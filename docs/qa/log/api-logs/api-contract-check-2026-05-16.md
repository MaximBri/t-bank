# API Contract Check — 2026-05-16

## Summary

Проверка API через Playwright API tests и сверка с `docs/qa/api/openapi.raw`.

## Contract Mismatches

### 1. `POST /auth/register`

- Contract: `200`
- Runtime: `201`
- Verdict: `201` корректнее, так как создаётся новый пользователь

### 2. `POST /auth/logout`

- Contract: `200`
- Runtime: `204`
- Verdict: `204` корректно для idempotent logout без body

### 3. `POST /events`

- Contract: `200`
- Runtime: `201`
- Verdict: `201` корректнее, так как создаётся новое событие

### 4. `POST /events/{eventId}/expenses`

- Contract: `200`
- Runtime: `201`
- Verdict: `201` корректнее, так как создаётся новый расход

## Runtime Failures (`500`)

### 1. `POST /events/{eventId}/expenses`

- Expected by runtime/controller: `201`
- Actual: `500`
- Notes:
  - positive API test падает на создании расхода
  - требует разбор backend-логики создания расхода/категорий

### 2. `PATCH /events/{eventId}`

- Contract: `200`
- Actual: `500`
- Notes:
  - positive API test падает на валидном update payload
  - требует разбор backend-логики update event

## Notes

- `categories` больше не присутствуют в текущем `openapi.raw`
- `invite-links` больше не присутствуют в текущем `openapi.raw`
- `settlements` больше не присутствуют в текущем `openapi.raw`
