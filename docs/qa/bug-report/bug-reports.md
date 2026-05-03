## Bug ID
`BUG-001`

## Documented API response status codes do not match endpoint semantics

## Severity (Серьёзность дефекта)
- [ ] Высокая
- [ ] Средняя
- [x] Низкая

## Description
В текущем API-контракте часть кодов ответа не соответствует семантике endpoint-ов.

Для некоторых успешных операций указан `200 OK`, когда ответ не содержит body.

Для некоторых ошибок используется `400 Bad Request`, хотя сам запрос может быть валидным.

## Preconditions
1. API-контракт https://github.com/MaximBri/t-bank/blob/docs/add-project-documentation/docs/tevent_openapi.yml

## Steps to Reproduce
1. Открыть API-контракт 
2. Проверить корректность семантики кодов ответов для:
   - `POST /user/invitations/:invitationId/resolve`
   - `PATCH /expenses/:expenseId/status`
   - `POST /settlements/:settlementId/pay`
   - `POST /settlements/:settlementId/confirm`
   - `PATCH /me`
   - `POST /groups/join`

## Expected Result (Ожидаемый результат)
Так как планируется, что фронтенд будет опираться на статусы ответов, то для следующих endpoint-ов коды ответа скорректированы

- `POST /user/invitations/:invitationId/resolve`: `200 -> 204`
- `PATCH /expenses/:expenseId/status`: `200 -> 204`
- `POST /settlements/:settlementId/pay`: `200 -> 204`
- `POST /settlements/:settlementId/confirm`: `200 -> 204`
- `PATCH /me`: `200 -> 204`

- `POST /settlements/:settlementId/pay`: `400 -> 409`
- `POST /settlements/:settlementId/confirm`: `400 -> 409`

- `POST /groups/join`: `202 -> 201` (если заявка создается сразу)

## Actual Result (Фактический результат)
Сейчас в контракте указаны следующие коды ответа:

- `POST /user/invitations/:invitationId/resolve`: `200`
- `PATCH /expenses/:expenseId/status`: `200`
- `POST /settlements/:settlementId/pay`: `200`
- `POST /settlements/:settlementId/confirm`: `200`
- `PATCH /me`: `200`

- `POST /settlements/:settlementId/pay`: `400`
- `POST /settlements/:settlementId/confirm`: `400`

- `POST /groups/join`: `202`

## Environment
- N/A

## Attachments
- N/A


---


## Bug ID
`BUG-002`

## Title UI Элементы формы 'Создание события' перекрывают другие элементы данной фомры.

## Severity (Серьёзность дефекта)
- [ ] Высокая
- [ ] Средняя
- [x] Низкая

## Description
Дефекты UI:
1. Для поля `Категории расходов` текст ошибки валидации `Добавьте хотя бы одну категорию` перекрывает текст тултипа ниже, делая оба текста плохочитаемыми. (Скриншот N.1)
2. Для полей `Дата конца` и `Дата начала` иконка календаря перекрывается кнопкой очистки значения, из-за чего элементы управления отображаются некорректно. (Скриншот N.2)


## Preconditions
1. Открывается стенд `https://t-event.front-craft.ru/`

## Steps to Reproduce
### Сценарий 1. Перекрытие текста ошибки и тултипа
1. Открыть стенд
2. Нажать кнопку `Создать событие`
3. Удалить все чипы категорий расхода

### Сценарий 2. Наложение иконки календаря и кнопки очистки
1. Открыть стенд
2. Нажать кнопку `Создать событие`
3. Заполнить поле `Дата начала` или `Дата конца` валидной датой


## Expected Result (Ожидаемый результат)
1. Текст ошибки `Добавьте хотя бы одну категорию` не перекрывает тултип `Категории помогут организовать учет расходов по направлениям`
2. В полях `Дата начала` и `Дата конца` иконка календаря и кнопка очистки отображаются корректно и не накладываются друг на друга

## Actual Result (Фактический результат)
1. Текст ошибки `Добавьте хотя бы одну категорию` перекрывает тултип `Категории помогут организовать учет расходов по направлениям`
2. В полях `Дата начала` и `Дата конца` иконка календаря перекрывается кнопкой очистки значения

## Environment
- Браузер (Chrome, стабильная версия ` 147.0.7727.55`, Linux/Pop!_OS 24.04 LTS x86_64)
- Стенд: деплой (`https://t-event.front-craft.ru/`)

## Attachments
(Скриншоты, запись экрана)


---


## Bug ID
`BUG-003`

## Title Фильтры на главной странице принимают невалидные значения дат и количества участников

## Severity (Серьёзность дефекта)
- [ ] Высокая
- [x] Средняя
- [ ] Низкая

## Description
В блоке фильтров на главной странице отсутствует корректная валидация значений.

1. Поле `Дата до` принимает дату меньше, чем `Дата от`.
2. Поля диапазона `Количество участников` принимают отрицательные значения.

Из-за этого пользователь может задать логически некорректные параметры фильтрации.

## Preconditions
1. Открывается стенд `https://t-event.front-craft.ru/`
2. Пользователь авторизован и находится на главной странице со списком событий

## Steps to Reproduce
1. Открыть главную страницу со списком событий
2. В блоке фильтров заполнить поле `Дата от` значением `04/20/2026`
3. В поле `Дата до` указать значение `04/19/2026`
4. В поле минимального количества участников указать `-2`
5. В поле максимального количества участников указать `-1`

## Expected Result (Ожидаемый результат)
1. Поле `Дата до` не позволяет указать дату ранее, чем `Дата от`, либо показывает ошибку валидации
2. Поля `Количество участников` не принимают отрицательные значения

## Actual Result (Фактический результат)
1. Поле `Дата до` принимает дату меньше, чем `Дата от`
2. Поля `Количество участников` принимают отрицательные значения `-2` и `-1`

## Environment
- Браузер (Chrome, стабильная версия ` 147.0.7727.55`, Linux/Pop!_OS 24.04 LTS x86_64)
- Стенд: деплой (`https://t-event.front-craft.ru/`)

## Attachments
(Скриншоты, запись экрана)


---


## Bug ID
`BUG-004`

## Title
На страницах авторизации и регистрации отсутствует переключатель видимости пароля

## Severity (Серьёзность дефекта)
- [ ] Высокая
- [ ] Средняя
- [x] Низкая

## Description
На страницах `https://t-event.front-craft.ru/login` и `https://t-event.front-craft.ru/register` для полей с паролем отсутствует кнопка показа/скрытия пароля.

## Preconditions
1. Открывается стенд `https://t-event.front-craft.ru/`

## Steps to Reproduce
1. Открыть страницу `https://t-event.front-craft.ru/login`
2. Проверить поле `Пароль`
3. Открыть страницу `https://t-event.front-craft.ru/registration`
4. Проверить поля с вводом пароля

## Expected Result (Ожидаемый результат)
Для полей с паролем отображается кнопка показа/скрытия значения пароля

## Actual Result (Фактический результат)
Для полей с паролем кнопка показа/скрытия значения пароля отсутствует

## Environment
- Браузер (Chrome, стабильная версия ` 147.0.7727.55`, Linux/Pop!_OS 24.04 LTS x86_64)
- Стенд: деплой (`https://t-event.front-craft.ru/`)

## Attachments
(Скриншоты, запись экрана)


---


## Bug ID
`BUG-005`

## Title
Сообщение об ошибке в теле ответа `api/auth/refresh` возвращается `Invalid credentials` при невалидном токене

## Severity (Серьёзность дефекта)
- [ ] Высокая
- [ ] Средняя
- [x] Низкая

## Description
При запросе обновления access token с существующей cookie `refreshToken`, содержащей невалидное значение, API возвращает сообщение `Invalid credentials`.

Сообщение описывает ошибку как `Invalid credentials`, которое на практике относится к неверному логину/паролю при авторизации.

## Preconditions
1. Открывается стенд `https://t-event.front-craft.ru/`
2. baseUrl `https://t-event.front-craft.ru/api`
3. Хэдер `Cookie: refreshToken=invalid-refresh-token`

## Steps to Reproduce
1. Выполнить request через curl:

```bash
curl -i -X POST "https://t-event.front-craft.ru/api/auth/refresh" \
  -H "Cookie: refreshToken=invalid-refresh-token"
```

## Expected Result (Ожидаемый результат)
API возвращает `401 Unauthorized` с сообщением, которое явно относится к refresh token, например:

```json
{
  "message": "Invalid refresh token",
  "status": 401
}
```

## Actual Result (Фактический результат)
API возвращает `401 Unauthorized` с сообщением:

```json
{
  "message": "Invalid credentials",
  "status": 401
}
```

## Environment
- Стенд: деплой (`https://t-event.front-craft.ru/`)
- API base URL: `https://t-event.front-craft.ru/api`


---


## Bug ID
`BUG-006`

## Severity (Серьёзность дефекта)
- [ ] Высокая
- [x] Средняя
- [ ] Низкая

## Description
При отправке запроса с пустым request body сервер возвращает `500 Internal Server Error` вместо ошибки клиента `400 Bad Request`.

Проблема воспроизводится не только при регистрации пользователя, но и при авторизации.

Ожидается, что сервер будет корректно обрабатывать отсутствие тела запроса и возвращать `400 Bad Request`, без внутренней ошибки сервера, так как ошибка находится на стороне запроса, а приходит ошибка серверва 5XX

## Preconditions
1. Бэкенд запущен локально

## Steps to Reproduce
1. Создать `POST` запрос с endpoint-ом `/auth/login`
2. Оставить request body пустым
3. Отправить запрос
4. Обратить внимание на HTTP status code
5. Повторить те же шаги для endpoint-а `auth/register`

## Expected Result (Ожидаемый результат)
Сервер возвращает `400 Bad Request`.

Например:

    {
      "status": 400,
      "message": "Invalid request body"
    }

## Actual Result (Фактический результат)
Сервер возвращает `500 Internal Server Error`.

Проблема воспроизводится на endpoint-ах:
- `POST /auth/login`
- `POST /auth/register`

## Environment
- Stand: local
- Header: `Content-Type: application/json`

## Attachments
- Скриншот ответа `500` для `POST /auth/login`
- Скриншот ответа `500` для `POST /auth/register`


---


## Bug ID
`BUG-007`

## Title
POST /auth/login и POST /auth/register возвращают 500 Internal Server Error при malformed JSON body вместо 400 Bad Request

## Severity (Серьёзность дефекта)
- [ ] Высокая
- [x] Средняя
- [ ] Низкая

## Description
При отправке запроса с некорректно сформированным JSON в request body сервер возвращает `500 Internal Server Error` вместо ошибки клиента `400 Bad Request`.

Проблема воспроизводится не только при регистрации пользователя, но и при авторизации.

Ожидается, что сервер будет корректно обрабатывать malformed JSON body и возвращать `400 Bad Request`, без внутренней ошибки сервера, так как ошибка находится на стороне запроса, а приходит ошибка сервера 5XX.

## Preconditions
1. Бэкенд запущен локально

## Steps to Reproduce
1. Создать `POST` запрос с endpoint-ом `/auth/login`
2. В request body передать некорректно сформированный JSON:

    {
      "username": ""';:[]{} `~!@#$%^&*()_+-=<>?,./\|",
      "password": "securePassword123"
    }

3. Отправить запрос
4. Обратить внимание на HTTP status code
5. Повторить те же шаги для endpoint-а `/auth/register`

## Expected Result (Ожидаемый результат)
Сервер возвращает `400 Bad Request`.

Например:

    {
      "status": 400,
      "message": "Invalid request body"
    }

## Actual Result (Фактический результат)
Сервер возвращает `500 Internal Server Error`.

Проблема воспроизводится на endpoint-ах:
- `POST /auth/login`
- `POST /auth/register`

## Environment
- Stand: local
- Header: `Content-Type: application/json`

## Attachments
- Скриншот ответа `500` для `POST /auth/login`
- Скриншот ответа `500` для `POST /auth/register`
