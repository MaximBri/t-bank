# API Endpoints

Source of truth for this document: `docs/qa/api/openapi.raw`

## Authentication

| Method | Path | Auth | Expected statuses | Purpose |
|---|---|---|---|---|
| POST | /auth/register | No | 200 | Регистрация нового пользователя |
| POST | /auth/login | No | 200 | Вход в систему |
| GET | /auth/me | Yes | 200 | Проверка текущей сессии |
| POST | /auth/refresh | Refresh cookie | 200 | Обновление access token |
| POST | /auth/logout | Yes | 200 | Выход из системы |

## Events

| Method | Path | Auth | Expected statuses | Purpose |
|---|---|---|---|---|
| POST | /events | Yes | 200 | Создание нового события |
| GET | /events/{eventId} | Yes | 200 | Получение информации о событии |
| PATCH | /events/{eventId} | Yes | 200 | Редактирование события |
| GET | /events/user/events | Yes | 200 | Получение списка событий пользователя |
| GET | /events/{eventId}/history | Not present in `openapi.raw` | N/A | Получение истории действий в событии |

## Categories

| Method | Path | Auth | Expected statuses | Purpose |
|---|---|---|---|---|
| GET | /events/categories | Yes | 200 | Получение дефолтных категорий |
| GET | /events/{eventId}/categories | Yes | 200 | Получение категорий события |
| POST | /events/{eventId}/categories | Yes | 200 | Создание категории для события |
| DELETE | /events/{eventId}/categories/{categoryId} | Yes | 200 | Удаление категории события |

## Expenses

| Method | Path | Auth | Expected statuses | Purpose |
|---|---|---|---|---|
| GET | /events/{eventId}/expenses | Yes | 200 | Получение списка расходов события |
| POST | /events/{eventId}/expenses | Yes | 200 | Добавление нового расхода |
| PATCH | /events/{expenseId}/status | Yes | 200 | Изменение статуса подтверждения расхода |

## Settlements

| Method | Path | Auth | Expected statuses | Purpose |
|---|---|---|---|---|
| GET | /events/{eventId}/settlements | Not present in `openapi.raw` | N/A | Получение списка взаиморасчетов |
| POST | /settlements/{settlementId}/pay | Not present in `openapi.raw` | N/A | Отметка долга как оплаченного |
| POST | /settlements/{settlementId}/confirm | Not present in `openapi.raw` | N/A | Подтверждение получения средств |

## Participants

| Method | Path | Auth | Expected statuses | Purpose |
|---|---|---|---|---|
| GET | /events/{eventId}/participants | Yes | 200, 403, 404 | Получение списка участников события |
| POST | /events/{eventId}/participants/invite | Yes | 201, 403, 404, 409 | Приглашение пользователя в событие |
| DELETE | /events/{eventId}/participants/{userId} | Yes | 204, 403, 404 | Удаление участника или отзыв приглашения |
| GET | /events/{eventId}/participants/leave/check | Yes | 200, 403, 404 | Проверка возможности выхода из события |
| POST | /events/{eventId}/participants/leave | Yes | 204, 403, 404, 409 | Подтверждение выхода из события |

## User Invitations

| Method | Path | Auth | Expected statuses | Purpose |
|---|---|---|---|---|
| GET | /user/invitations/pending | Yes | 200, 403 | Получение активных приглашений пользователя |
| POST | /user/invitations/{invitationId}/resolve | Yes | 200, 403, 404, 410 | Принятие или отклонение приглашения |
| GET | /events/{eventId}/participants/user/invitations/pending | Yes | 200, 403 | Получение активных приглашений пользователя в participant scope |
| POST | /events/{eventId}/participants/user/invitations/{invitationId}/resolve | Yes | 200, 403, 404, 410 | Принятие или отклонение приглашения в participant scope |

## Group Join

| Method | Path | Auth | Expected statuses | Purpose |
|---|---|---|---|---|
| POST | /groups/join | Yes | 202, 404, 409, 410 | Подача заявки на вступление в группу |

## Invite Links

| Method | Path | Auth | Expected statuses | Purpose |
|---|---|---|---|---|
| GET | /events/{eventId}/invite-link | Yes | 200, 403, 404 | Получение текущей пригласительной ссылки |
| POST | /events/{eventId}/invite-link/regenerate | Yes | 200, 403, 404 | Перегенерация пригласительной ссылки |

## User Profile

| Method | Path | Auth | Expected statuses | Purpose |
|---|---|---|---|---|
| GET | /me | Not present in `openapi.raw` | N/A | Получение данных профиля |
| PATCH | /me | Not present in `openapi.raw` | N/A | Редактирование профиля |
| POST | /me/password | Not present in `openapi.raw` | N/A | Изменение пароля |
