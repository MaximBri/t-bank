# Отчет по тестированию безопасности и edge-cases

## 1. Краткий итог

Проведено тестирование негативных сценариев и edge-cases для Auth API через Postman collection.

Проверки заведены в Postman и выполнены в рамках запуска test-run с добавленем script-ов и тестирования API.

Артефакты:
- [`api-testing-report.md`](./api-testing-report.md)
- [`auth.postman_test_run.json`](../../log/auth.postman_test_run.json)
- [`postman-collection.zip`](../../api/postman-collection.zip)

---

## 2. Проверенные security / edge-case сценарии

| ID | Postman test case | Endpoint | Ожидаемый результат | Статус | Связанный дефект |
|---|---|---|---|---|---|
| SEC-001 | Регистрация: username уже существует | `POST /auth/register` | `409 Conflict` | Passed | - |
| SEC-002 | Регистрация: пустой password | `POST /auth/register` | `400 Bad Request` | Passed | - |
| SEC-003 | Регистрация: пустой username | `POST /auth/register` | `400 Bad Request` | Passed | - |
| SEC-004 | Регистрация: невалидная длина password | `POST /auth/register` | `400 Bad Request` | Passed | - |
| SEC-005 | Регистрация: forbidden characters | `POST /auth/register` | `400 Bad Request` | Failed | [`BUG-007`](../../bug-report/bug-007.md) |
| SEC-006 | Логин: invalid credentials | `POST /auth/login` | `401 Unauthorized` | Passed | - |
| SEC-007 | Логин: пустой password | `POST /auth/login` | `400 Bad Request` | Passed | - |
| SEC-008 | Логин: пустой username | `POST /auth/login` | `400 Bad Request` | Passed | - |
| SEC-009 | Логин: пустой request body | `POST /auth/login` | `400 Bad Request` | Failed | [`BUG-006`](../../bug-report/bug-006.md) |
| SEC-010 | Логин: forbidden characters | `POST /auth/login` | `400 Bad Request` | Failed | [`BUG-007`](../../bug-report/bug-007.md) |
| SEC-011 | Проверка текущей сессии без авторизации | `GET /auth/me` | `401 Unauthorized` | Passed | - |
| SEC-012 | Refresh token: invalid refresh token | `POST /auth/refresh` | `401 Unauthorized` | Partially failed | [`BUG-005`](../../bug-report/bug-005.md) |

---

## 3. Найденные дефекты

| Bug ID | Описание |
|---|---|
| [`BUG-005`](../../bug-report/bug-005.md) | Для `POST /auth/refresh` при invalid refresh token статус корректный `401 Unauthorized`, но не совпадает ожидаемый текст / структура ошибки |
| [`BUG-006`](../../bug-report/bug-006.md) | `POST /auth/login` и `POST /auth/register` возвращают `500 Internal Server Error` при пустом request body вместо `400 Bad Request` |
| [`BUG-007`](../../bug-report/bug-007.md) | `POST /auth/login` и `POST /auth/register` возвращают `500 Internal Server Error` при malformed / forbidden characters body вместо `400 Bad Request` |

---

## 4. Итог проверки

| Статус | Количество |
|---|---:|
| Passed | 9 |
| Failed | 3 |
| Partially failed | 1 |
| Всего | 13 |

---


## 5. Итоги и ограничения security-проверок

Edge-case проверки для Auth API выполнены через Postman collection.

Покрыты основные негативные сценарии:
- повторная регистрация существующего username;
- пустые обязательные поля;
- invalid password length;
- invalid credentials;
- запрос текущей сессии без авторизации;
- invalid refresh token;
- пустой request body;
- forbidden characters / malformed input.

Часть проверок прошла успешно: backend корректно возвращает `400`, `401` и `409` для ряда негативных сценариев.

Найдены проблемы обработки некорректного request body: в отдельных случаях backend возвращает `500 Internal Server Error` вместо ожидаемого `400 Bad Request`.

Дополнительные проверки требуется провести на следующем этапе после актуализации Postman collection и стабилизации новых endpoint-ов:

- проверка доступа к чужим данным для events / expenses / settlements endpoint-ов;
- проверка role-based access: участник не может выполнять действия владельца;
- проверка IDOR-сценариев: пользователь не должен получать данные чужого события по прямому `eventId`;
- проверка rate-limit / brute-force protection для login

Эти проверки не вошли в текущий test-run, так как новые endpoint-ы были добавлены позднее чем ожидалось, они требуют отдельной актуализации коллекции, и дополнительного времени для проведения тестирования.
