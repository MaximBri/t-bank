## Отчёт по API-тестированию: Auth

### Краткая сводка
Проведен тест-прогон Postman-коллекции для auth endpoint-ов локального бэкенда.

- Успешно пройдено проверок: 15
- Провалено проверок: 4
- Общее время выполнения: 472 ms
- Стенд: local
- Base URL: http://127.0.0.1:8080

### Проверенные endpoint-ы
- POST /auth/register
- POST /auth/login
- GET /auth/me
- POST /auth/refresh

### Успешные проверки
Успешно проходят основные позитивные и негативные сценарии:
- регистрация нового пользователя: 201 Created
- регистрация без invite code: 201 Created
- повторная регистрация существующего username: 409 Conflict
- валидация пустого username/password: 400 Bad Request
- вход с валидными данными: 200 OK
- вход с неверными credentials: 401 Unauthorized
- проверка текущей сессии: 200 OK / 401 Unauthorized
- обновление access token: 200 OK
- invalid refresh token возвращает 401 Unauthorized

### Проваленные проверки
1. POST /auth/register с forbidden characters
   - Ожидалось: 400 Bad Request
   - Фактически: 500 Internal Server Error

2. POST /auth/login с пустым request body
   - Ожидалось: 400 Bad Request
   - Фактически: 500 Internal Server Error

3. POST /auth/login с forbidden characters
   - Ожидалось: 400 Bad Request
   - Фактически: 500 Internal Server Error

4. POST /auth/refresh с invalid refresh token
   - Status code корректный: 401 Unauthorized
   - Провалился дополнительный assertion на текст/структуру ошибки

### Найденные дефекты
- BUG-005: Сообщение об ошибке в теле ответа `api/auth/refresh` возвращается `Invalid credentials` при невалидном токене.
- BUG-006: POST /auth/login возвращает 500 Internal Server Error при пустом request body вместо 400 Bad Request.
- BUG-007: POST /auth/login и POST /auth/register возвращают 500 Internal Server Error при некорректных символах / malformed request body вместо 400 Bad Request.
- 
### Рекомендации
Исправить обработку некорректного request body на уровне backend exception handling / validation, чтобы клиентские ошибки возвращали 400 Bad Request, а не 500 Internal Server Error.

### Raw output
- [`auth.postman_test_run.json`](../log/auth.postman_test_run.json)

### Test-run ссылка в postman
https://.postman.co/workspace/My-Workspace~2d7d6c9c-c339-4ecf-8542-85ab4ba32713/run/33361274-1be2e78d-213f-4430-b243-6415f57ad370?action=share&creator=33361274&active-environment=33361274-ab0b818f-f840-4c30-943e-c07bc06e9a75
