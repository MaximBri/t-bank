# Jobrunr System Design for T-Event

## 1. Minimizer Task for Optimal Settlements

### Концепция
Минимазатор (Minimizer) - это Jobrunr задача, которая вычисляет оптимальные взаиморасчеты между участниками события. Вместо того чтобы создавать множество попарных долгов, алгоритм находит минимальное количество транзакций для погашения всех долгов.

### Алгоритм (Алгоритм минимальных транзакций)
1. **Сбор балансов**: Для каждого участника вычисляется чистый баланс (сумма всех расходов, которые он оплатил, минус его доля).
2. **Создание списков кредиторов и должников**:
   - Кредиторы (creditors): участники с положительным балансом (им должны)
   - Должники (debtors): участники с отрицательным балансом (они должны)
3. **Оптимизация**:
   - Используем жадный алгоритм для минимизации количества транзакций
   - Каждая транзакция погашает максимально возможную сумму между кредитором и должником
4. **Создание Settlement записей**: Для каждой оптимизированной транзакции создается запись в таблице `settlements`.

### Реализация в Jobrunr
```java
@Service
public class SettlementMinimizerJob {
    
    @Job(name = "Calculate optimal settlements", retries = 3)
    public void calculateOptimalSettlements(Integer eventId) {
        // 1. Получить все расходы события
        List<Expense> expenses = expenseRepository.findByEventId(eventId);
        
        // 2. Рассчитать балансы участников
        Map<Participant, Double> balances = calculateBalances(expenses);
        
        // 3. Оптимизировать транзакции
        List<SettlementTransaction> optimalTransactions = minimizeTransactions(balances);
        
        // 4. Сохранить оптимальные взаиморасчеты
        saveOptimalSettlements(eventId, optimalTransactions);
        
        // 5. Отправить уведомления участникам
        sendSettlementNotifications(eventId, optimalTransactions);
    }
    
    private List<SettlementTransaction> minimizeTransactions(Map<Participant, Double> balances) {
        // Реализация алгоритма минимальных транзакций
        // ...
    }
}
```

### Триггеры для запуска Minimizer
1. **При создании/изменении расхода**
2. **При изменении состава участников**
3. **По расписанию** (ежедневно в 2:00)
4. **Вручную через API**

## 2. Транзакционность и Атомарность с Jobrunr

### Проблема
Фоновые задачи должны быть:
1. **Атомарными**: либо полностью выполняются, либо полностью откатываются
2. **Идемпотентными**: повторное выполнение не должно создавать дубликаты
3. **Устойчивыми к сбоям**: при падении сервера задача должна продолжиться

### Решение с Jobrunr

#### Атомарность через Unit of Work
```java
@Job(name = "Process expense", retries = 3)
@Transactional
public void processExpense(Integer expenseId) {
    // 1. Начинаем транзакцию (Spring @Transactional)
    Expense expense = expenseRepository.findById(expenseId)
        .orElseThrow(() -> new ResourceNotFoundException("Expense not found"));
    
    // 2. Выполняем бизнес-логику
    expense.setApprovalStatus(ExpenseApprovalStatus.CONFIRMED);
    expenseRepository.save(expense);
    
    // 3. Запускаем Minimizer как дочернюю задачу
    BackgroundJob.enqueue(() -> 
        settlementMinimizerJob.calculateOptimalSettlements(expense.getEvent().getId())
    );
    
    // 4. Если произойдет исключение, Spring откатит транзакцию
    // Jobrunr пометит задачу как failed и попробует повторить
}
```

#### Идемпотентность через Versioning
```java
@Entity
public class Expense {
    @Id
    private Integer id;
    
    @Version
    private Integer version;  // Для оптимистичной блокировки
    
    // При обновлении проверяем версию
    public void confirmExpense(Integer expectedVersion) {
        if (!this.version.equals(expectedVersion)) {
            throw new OptimisticLockingException("Expense was modified by another transaction");
        }
        this.approvalStatus = ExpenseApprovalStatus.CONFIRMED;
        this.version++;
    }
}
```

#### Устойчивость к сбоям
Jobrunr обеспечивает:
1. **Persistent storage**: задачи хранятся в БД (PostgreSQL)
2. **Automatic retries**: при failure задачи автоматически повторяются
3. **Dead letter queue**: задачи, которые постоянно падают, перемещаются в DLQ
4. **State management**: Jobrunr отслеживает состояние каждой задачи

### Паттерны для транзакционности

#### Паттерн "Compensating Transaction"
```java
@Job(name = "Complex business process", retries = 3)
public void complexBusinessProcess(Integer eventId) {
    try {
        // Шаг 1: Резервируем ресурсы
        reserveResources(eventId);
        
        // Шаг 2: Выполняем основную логику
        processEvent(eventId);
        
        // Шаг 3: Подтверждаем операцию
        confirmOperation(eventId);
        
    } catch (Exception e) {
        // Компенсирующая транзакция
        compensateOperation(eventId);
        throw e;
    }
}
```

#### Паттерн "Saga Pattern" с Jobrunr
```java
@Job(name = "Expense approval saga", retries = 3)
public void expenseApprovalSaga(Integer expenseId) {
    // Шаг 1: Подтвердить расход
    expenseService.confirmExpense(expenseId);
    
    // Шаг 2: Пересчитать взаиморасчеты (асинхронно)
    BackgroundJob.enqueue(() -> 
        settlementMinimizerJob.calculateOptimalSettlements(expenseId)
    );
    
    // Шаг 3: Отправить уведомления (асинхронно)
    BackgroundJob.enqueue(() ->
        notificationService.sendExpenseConfirmedNotifications(expenseId)
    );
}
```

## 3. Оптимистическая Блокировка с Jobrunr

### Контекст T-Event
В T-Event несколько пользователей могут одновременно:
1. Редактировать один и тот же расход
2. Подтверждать/оспаривать расходы
3. Изменять состав участников

### Реализация оптимистической блокировки

#### 1. Version Field в Entity
```java
@Entity
public class Expense {
    @Id
    private Integer id;
    
    @Version
    private Integer version;
    
    // Геттеры и сеттеры
}
```

#### 2. Optimistic Lock в Service
```java
@Service
@Transactional
public class ExpenseServiceImpl implements ExpenseService {
    
    public ExpenseDTO updateExpense(Integer expenseId, UpdateExpenseRequest request) {
        // Загружаем с блокировкой версии
        Expense expense = expenseRepository.findById(expenseId)
            .orElseThrow(() -> new ResourceNotFoundException("Expense not found"));
        
        // Проверяем версию из запроса
        if (!expense.getVersion().equals(request.getVersion())) {
            throw new OptimisticLockException(
                "Expense was modified by another user. Current version: " + 
                expense.getVersion()
            );
        }
        
        // Обновляем
        expense.setTitle(request.getTitle());
        expense.setAmount(request.getAmount());
        // Версия автоматически увеличится благодаря @Version
        
        return expenseMapper.toDTO(expense);
    }
}
```

#### 3. Jobrunr Job с Optimistic Lock Retry
```java
@Job(name = "Process expense with optimistic lock", retries = 5)
public void processExpenseWithOptimisticLock(Integer expenseId, Integer expectedVersion) {
    try {
        expenseService.updateExpenseWithVersion(expenseId, expectedVersion);
        
    } catch (OptimisticLockException e) {
        // Получаем актуальную версию
        Integer currentVersion = expenseRepository.getVersion(expenseId);
        
        // Перезапускаем задачу с новой версией
        throw new JobRetryException(
            "Optimistic lock failed, retrying with new version",
            Duration.ofSeconds(5),
            currentVersion  // Новый параметр для ретрая
        );
    }
}
```

#### 4. Exponential Backoff для Retry
```java
@Job(
    name = "Expense processing",
    retries = 5,
    retryBackoff = @ExponentialBackoff(
        baseDelay = "PT5S",  // 5 секунд
        multiplier = 2.0,     // Удваиваем задержку каждый раз
        maxDelay = "PT5M"     // Максимум 5 минут
    )
)
public void processExpenseWithBackoff(Integer expenseId) {
    // Логика с оптимистической блокировкой
}
```

### Преимущества подхода
1. **Высокая производительность**: нет блокировок на уровне БД
2. **Масштабируемость**: множество инстансов могут работать параллельно
3. **Отказоустойчивость**: Jobrunr управляет ретраями
4. **Консистентность**: гарантируется, что последнее изменение победит

## 4. Очистка Уведомлений Jobrunr

### Проблема
Таблица уведомлений (`notifications`) может расти бесконечно. Старые прочитанные уведомления нужно удалять.

### Решение: Scheduled Job для очистки
```java
@Service
public class NotificationCleanupJob {
    
    @RecurringJob(
        id = "notification-cleanup",
        cron = "0 0 3 * * *",  // Ежедневно в 3:00
        zoneId = "Europe/Samara"
    )
    @Job(name = "Cleanup old notifications")
    public void cleanupOldNotifications() {
        // Удаляем прочитанные уведомления старше 30 дней
        notificationRepository.deleteByIsReadTrueAndCreatedAtBefore(
            LocalDateTime.now().minusDays(30)
        );
        
        // Удаляем все уведомления старше 90 дней
        notificationRepository.deleteByCreatedAtBefore(
            LocalDateTime.now().minusDays(90)
        );
        
        // Логируем статистику
        log.info("Notification cleanup completed");
    }
}
```

### Архитектура Monolith с Jobrunr

```
┌─────────────────────────────────────────────────────────────┐
│                    T-Event Monolith                         │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Web Layer │  │  App Layer  │  │  Domain     │        │
│  │  Controllers│  │  Services   │  │  Entities   │        │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘        │
│         │                │                │                │
├─────────┼────────────────┼────────────────┼────────────────┤
│         │                │                │                │
│  ┌──────▼──────┐  ┌──────▼──────┐  ┌──────▼──────┐        │
│  │   Jobrunr   │  │  Database   │  │   MinIO     │        │
│  │  Integration│  │  PostgreSQL │  │   Storage   │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
│         │                                                   │
│  ┌──────▼──────┐                                           │
│  │ Jobrunr     │                                           │
│  │ Dashboard   │                                           │
│  └─────────────┘                                           │
└─────────────────────────────────────────────────────────────┘
```

### Наследование Jobrunr в Monolith
Jobrunr интегрируется как:
1. **Background Job Processor**: для асинхронных задач
2. **Scheduler**: для периодических задач
3. **Workflow Engine**: для сложных бизнес-процессов
4. **Retry Manager**: для обработки сбоев

### Преимущества такой архитектуры
1. **Простота развертывания**: один артефакт
2. **Согласованность данных**: все в одной БД
3. **Упрощенная отладка**: все логи в одном месте
4. **Эффективное использование ресурсов**: общие connection pools

## 5. Рекомендации по Production

### Конфигурация Jobrunr
```yaml
# application.yaml
org:
  jobrunr:
    background-job-server:
      enabled: true
      worker-count: 10
      poll-interval-in-seconds: 15
    dashboard:
      enabled: true
    database:
      skip-create: false
    job-scheduler:
      enabled: true
    misfired-job-detector:
      enabled: true
      misfire-threshold-in-seconds: 60
```

### Мониторинг
1. **Health Checks**: `/actuator/health/jobrunr`
2. **Metrics**: `/actuator/metrics/jobrunr`
3. **Dashboard**: `/jobrunr/dashboard`

### Безопасность
1. **Dashboard Security**: защитить basic auth
2. **Job Input Validation**: валидация параметров задач
3. **Rate Limiting**: ограничение частоты запуска задач

Эта архитектура обеспечивает надежную, масштабируемую и отказоустойчивую систему для T-Event с поддержкой сложных бизнес-процессов через Jobrunr.