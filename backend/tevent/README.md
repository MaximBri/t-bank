# Инструкция по запуску проекта

## 1. Системные требования

- Docker и Docker Compose
- JDK 25 или выше
- Свободный порт 5432 (для БД) и 8080 (для приложения)

## 2. Параметры подключения (БД)

Данные для Docker Compose и application.yml:

- **Host:** localhost
- **Port:** 5432
- **Database:** my_database
- **Username:** user
- **Password:** password

## 3. Запуск базы данных (Docker)

Команды выполняются из корня проекта:

### Запуск базы в фоне:
```bash
docker-compose up -d
```

### Просмотр логов базы:
```bash
docker-compose logs -f postgres
```

### Остановить базу:
```bash
docker-compose stop
```

### Удалить контейнер (данные сохранятся в volume):
```bash
docker-compose down
```

### Полная очистка (удалить базу вместе с данными):
```bash
docker-compose down -v
```

## 4. Команды сборки и запуска (Maven)

### JWT_SECRET (обязателен для запуска приложения)

Перед запуском приложения необходимо задать переменную окружения `JWT_SECRET` (минимум 32 символа).

Пример:
```bash
export JWT_SECRET='<jwt-secret-need-minimum-32-chars>'
```

Используйте `./mvnw` (Linux/macOS) или `mvnw.cmd` (Windows):

### Полная очистка и сборка (создание JAR):
```bash
./mvnw clean package
```

### Запуск приложения (миграции Liquibase применятся сами):
```bash
./mvnw spring-boot:run
```

### Сборка без запуска тестов:
```bash
./mvnw clean package -DskipTests
```

### Запуск уже собранного JAR-файла:
```bash
java -jar target/*.jar
```

## 5. Проверка работоспособности

- **Главная страница API:** http://localhost:8080
- **Статус приложения (Actuator):** http://localhost:8080/actuator/health
- **Информация о приложении:** http://localhost:8080/actuator/info

## 6. Структура миграций (Liquibase)

- **Точка входа:** `src/main/resources/db/changelog/db.changelog-master.xml`
- **Папка со скриптами:** `src/main/resources/db/changelog/migrations/`