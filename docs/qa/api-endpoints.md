# API Endpoints

## Authentication

| Method | Path | Auth | Expected statuses | Purpose |
|---|---|---|---|---|
| POST | /auth/register | No | 201, 400, 409 | Регистрация нового пользователя |
| POST | /auth/login | No | 200, 401 | Вход в систему |
| GET | /auth/me | Yes | 200, 401 | Проверка текущей сессии |
| POST | /auth/refresh | Refresh cookie | 200, 401 | Обновление access token |

## Events

| Method | Path | Auth | Expected statuses | Purpose |
|---|---|---|---|---|
| POST | /events | Yes | 201, 400 | Создание нового события |
| GET | /events/{eventId} | Yes | 200, 404 | Получение информации о событии |
| PATCH | /events/{eventId} | Yes | 200, 403, 404 | Редактирование события |
| GET | /user/events | Yes | 200 | Получение списка событий пользователя |
| GET | /events/{eventId}/history | Yes | 200 | Получение истории действий в событии |

## Participants

| Method | Path | Auth | Expected statuses | Purpose |
|---|---|---|---|---|
| GET | /events/{eventId}/participants | Yes | 200 | Получение списка участников события |
| POST | /events/{eventId}/participants/invite | Yes | 201, 404, 409 | Приглашение пользователя в событие |
| DELETE | /events/{eventId}/participants/{userId} | Yes | 204, 403, 404 | Удаление участника или отзыв приглашения |
| POST | /groups/join | Yes | 202, 409, 410 | Подача заявки на вступление в группу |
| GET | /user/invitations/pending | Yes | 200 | Получение активных приглашений пользователя |
| POST | /user/invitations/{invitationId}/resolve | Yes | 200, 403, 404 | Принятие или отклонение приглашения |
| GET | /events/{eventId}/leave/check | Yes | 200 | Проверка возможности выхода из события |
| POST | /events/{eventId}/leave | Yes | 204, 409 | Выход из события |

## Expenses

| Method | Path | Auth | Expected statuses | Purpose |
|---|---|---|---|---|
| GET | /events/{eventId}/expenses | Yes | 200 | Получение списка расходов события |
| POST | /events/{eventId}/expenses | Yes | 201, 400 | Добавление нового расхода |
| PATCH | /expenses/{expenseId}/status | Yes | 200, 403, 404 | Изменение статуса подтверждения расхода |

## Settlements

| Method | Path | Auth | Expected statuses | Purpose |
|---|---|---|---|---|
| GET | /events/{eventId}/settlements | Yes | 200 | Получение списка взаиморасчетов |
| POST | /settlements/{settlementId}/pay | Yes | 200, 400, 404 | Отметка долга как оплаченного |
| POST | /settlements/{settlementId}/confirm | Yes | 200, 400, 404 | Подтверждение получения средств |

## User Profile

| Method | Path | Auth | Expected statuses | Purpose |
|---|---|---|---|---|
| GET | /me | Yes | 200 | Получение данных профиля |
| PATCH | /me | Yes | 200 | Редактирование профиля |
| POST | /me/password | Yes | 204, 400 | Изменение пароля |

## Invitations

| Method | Path | Auth | Expected statuses | Purpose |
|---|---|---|---|---|
| GET | /events/{eventId}/invite-link | Yes | 200 | Получение текущей пригласительной ссылки |
| POST | /events/{eventId}/invite-link | Yes | 201 | Перевыпуск пригласительной ссылки |
