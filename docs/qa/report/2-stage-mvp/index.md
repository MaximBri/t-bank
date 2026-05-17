# Отчет второго дедлайна (**PR:**) https://github.com/MaximBri/t-bank/pull/75

## Общий итог

Во втором дедлайне подготовлен комплект QA-артефактов по API, UI, security / edge-case проверкам, баг-репортам и базовой инфраструктуре для дальнейшей автоматизации.

На текущем этапе:
- выполнен test-run для Auth API;
- проведено ручное функциональное тестирование основных пользовательских сценариев;
- проведено ручное UI-тестирование доступных сценариев;
- оформлены баг-репорты по найденным дефектам;
- проведены negative / edge-case проверки для Auth API;
- дополнительно подготовлена базовая инфраструктура для UI/API-автотестов и CI.

Основные ограничения отчета:
- API и security test-run покрывают Auth API, но не все новые endpoint-ы проекта;
- полноценные frontend + backend пользовательские сценарии заблокированы дефектом авторизации [`BUG-008`](../../bug-report/bug-008.md);
- часть защищенных UI-сценариев была проверена только статически.

## 1. API-тестирование

### Краткий итог

**Статус:** выполнено для Auth API на момент test-run.

Проведено API-тестирование реализованных endpoint-ов модуля авторизации.
Новые endpoint-ы, добавленные позже чем ожидалось, не вошли в текущий test-run и перенесены в scope третьего этапа для актуализации коллекции и повторного прогона. Postman коллекция актуализирована.

**Артефакты:**
- [`api-testing-report.md`](./api-testing-report.md)
- [`auth.postman_test_run.json`](../../log/auth.postman_test_run.json)
- [`postman-collection.zip`](../../api/postman-collection.zip)

---


## 2. Функциональное тестирование

### Краткий итог

**Статус:** выполнено частично; основной пользовательский сценарий заблокирован дефектом авторизации на момент тестирования.

Проведено ручное функциональное тестирование основных пользовательских сценариев текущего состояния MVP.

Что удалось проверить:
- сценарий регистрации нового пользователя зафиксирован как `Failed`;
- сформирован перечень заблокированных сценариев, зависящих от успешной авторизации.

Ограничения:
- регистрация через frontend блокировалась CORS-ошибкой, описанной в [`BUG-008`](../../bug-report/bug-008.md);
- сценарии после авторизации не могли быть полноценно выполнены и были отмечены как `Blocked`.

**Артефакты:**
- [`functional-testing-report.md`](./functional-testing-report.md)
- [`BUG-008`](../../bug-report/bug-008.md)

---


## 3. UI-тестирование основных сценариев

### Краткий итог

**Статус:** выполнено частично, основной пользовательский cценарий заблокирован дефектом авторизации на момент тестирования.

Проведено ручное UI-тестирование текущей версии приложения.

Что удалось проверить:
- открытие страницы логина;
- открытие страницы регистрации;
- доступность публичных auth-экранов без авторизации.

Что дополнительно проверено:
- после временного отключения `AuthGuard` выполнена статическая проверка защищенных экранов;
- подтверждено, что защищенные страницы, разделы, формы и модальные окна существуют, открываются и базово отображаются.

Ограничения:
- полноценные frontend + backend сценарии после авторизации не были завершены из-за дефекта [`BUG-008`](../../bug-report/bug-008.md);
- бизнес-сценарии, загрузка данных, отправка форм и backend-интеграция для защищенных экранов требуют повторной проверки после исправления блокера.

**Артефакты:**
- [`ui-testing-report.md`](./ui-testing-report.md)
- [`ui-checklist.md`](../../checklist/ui-checklist.md)
- [`index.md`](../../test-case/index.md)
- [`BUG-008`](../../bug-report/bug-008.md)


---


## 4. Баг-репорты

### Краткий итог

Оформлены баг-репорты по результатам API, UI и security-проверок.

Сводка:
- всего заведено баг-репортов: 8
- высокая severity: 1
- средняя severity: 3
- низкая severity: 4

**Артефакты:**
- [`bug-reports.md`](../../bug-report/index.md)
- [`BUG-001`](../../bug-report/bug-001.md)
- [`BUG-002`](../../bug-report/bug-002.md)
- [`BUG-003`](../../bug-report/bug-003.md)
- [`BUG-004`](../../bug-report/bug-004.md)
- [`BUG-005`](../../bug-report/bug-005.md)
- [`BUG-006`](../../bug-report/bug-006.md)
- [`BUG-007`](../../bug-report/bug-007.md)
- [`BUG-008`](../../bug-report/bug-008.md)

---


## 5. Тестирование безопасности и edge-cases

### Краткий итог

**Статус:** выполнено для Auth API.

Проведено тестирование негативных сценариев и edge-cases для auth endpoint-ов через Postman collection.

Проверено:
- повторная регистрация существующего пользователя;
- пустые обязательные поля;
- невалидная длина password;
- invalid credentials;
- запрос текущей сессии без авторизации;
- invalid refresh token;
- пустой request body;
- malformed input / forbidden characters.

Результат:
- часть негативных сценариев отрабатывает корректно с `400`, `401`, `409`;
- найдены дефекты обработки некорректного request body и malformed input;
- оформлены связанные баг-репорты [`BUG-005`](../../bug-report/bug-005.md), [`BUG-006`](../../bug-report/bug-006.md), [`BUG-007`](../../bug-report/bug-007.md).

Ограничения:
- текущий security test-run покрывает Auth API;
- дополнительные security-проверки для новых endpoint-ов вынесены на следующий этап после актуализации Postman collection.

**Артефакты:**
- [`security-testing-report.md`](./security-testing-report.md)
- [`api-testing-report.md`](./api-testing-report.md)
- [`auth.postman_test_run.json`](../../log/auth.postman_test_run.json)
- [`postman-collection.zip`](../../api/postman-collection.zip)
- [`BUG-005`](../../bug-report/bug-005.md), [`BUG-006`](../../bug-report/bug-006.md), [`BUG-007`](../../bug-report/bug-007.md)


---


## 6. QA-автоматизация и CI (**PR:**) https://github.com/MaximBri/t-bank/pull/76
**ISSUE:** https://github.com/users/MaximBri/projects/3/views/1?pane=issue&itemId=182305995&issue=MaximBri%7Ct-bank%7C73

### Краткий итог

Подготовлена базовая инфраструктура для дальнейшей автоматизации UI и API-проверок, а также для запуска тестов и сопутствующих процессов для Github Actions CI

**Статус:** добавлена основа для unit- и e2e-проверок frontend и CI test-run.

Что было добавлено и настроено:

- Playwright-конфигурация для E2E-тестирования frontend:
  - выделена отдельная конфигурация `frontend/playwright.config.ts`;
  - добавлены browser projects: `chromium`, `firefox`, `webkit`;
  - настроены artifacts и HTML report для результатов E2E.

- Vitest-конфигурация для unit-тестирования frontend:
  - расширена конфигурация в `frontend/vite.config.ts`;
  - настроен `setupFiles` для тестового окружения;
  - добавлена конфигурация coverage-report;

- Структура для тестов и артефактов:
  - добавлена директория `frontend/tests/` для хранения e2e- и unit-тестов;
  - добавлена директория `frontend/.artifacts/` для хранения E2E report, test results и unit coverage.

- Скрипты для локального запуска тестов:
  - в `frontend/package.json` добавлены команды для unit test run, watch mode, coverage run, Playwright E2E run, headed mode, UI mode, debug mode и просмотра E2E report.
```js
    "test:watch": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage",
    "test:coverage:short": "vitest run --coverage --coverage.reporter=text-summary",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:headed": "playwright test --headed",
    "test:e2e:report": "playwright show-report ./.artifacts/e2e/playwright-report",
    "test:e2e:debug": "playwright test --debug"
```

- GitHub Actions workflows:
  - `check.yml`: запуск unit-тестов frontend и публикация coverage artifacts;
  - `e2e.yml`: подъем backend и PostgreSQL в CI, запуск Playwright E2E и загрузка test artifacts.
