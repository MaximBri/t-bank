# Bug Reports

- [`BUG-001`](./bug-001.md) Documented API response status codes do not match endpoint semantics
- [`BUG-002`](./bug-002.md) UI элементы формы "Создание события" перекрывают другие элементы данной формы
- [`BUG-003`](./bug-003.md) Фильтры на главной странице принимают невалидные значения дат и количества участников
- [`BUG-004`](./bug-004.md) На страницах авторизации и регистрации отсутствует переключатель видимости пароля
- [`BUG-005`](./bug-005.md) Сообщение об ошибке в теле ответа `api/auth/refresh` возвращается `Invalid credentials` при невалидном токене
- [`BUG-006`](./bug-006.md) `POST /auth/login` и `POST /auth/register` возвращают `500 Internal Server Error` при пустом request body вместо `400 Bad Request`
- [`BUG-007`](./bug-007.md) `POST /auth/login` и `POST /auth/register` возвращают `500 Internal Server Error` при malformed JSON body вместо `400 Bad Request`
- [`BUG-008`](./bug-008.md) CORS-ошибка при регистрации через frontend
