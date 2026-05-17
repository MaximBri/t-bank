# Local Run Notes

## Purpose

Короткая инструкция, как локально поднять `T-Ивент` для ручной проверки, smoke и QA-прогонов.

## What is started

- `Postgres` в Docker
- `Redis` в Docker
- `backend` в Docker Compose (`docker-compose.dev.yml`)
- `frontend` локально через Vite

## Preconditions

- Docker / Docker Compose установлены
- Node.js и npm установлены
- свободны порты:
  - `5432` для Postgres
  - `6379` для Redis
  - `8081` для backend
  - `5173` для frontend

## Start order

### 1. Start backend, database and redis

Из корня проекта:

```bash
docker compose -f docker-compose.dev.yml up --build backend postgres redis
```

### 2. Start frontend

Перейти в `frontend` и запустить:

```bash
VITE_BACKEND_PORT=8081 npm run dev -- --port 5173
```

## URLs

- frontend: `http://localhost:5173`
- backend: `http://localhost:8081`
- Swagger UI: `http://localhost:8081/swagger-ui.html`
- OpenAPI JSON: `http://localhost:8081/v3/api-docs`

## Why frontend runs on 5173

Vite dev server в проекте настроен на `5173`, и backend CORS уже разрешает `http://localhost:5173`.
Для локального ручного прогона и e2e-конфига это сейчас основной dev URL.

## Notes / Known issues

### 1. Port 8081 may already be occupied

В проекте может остаться старый контейнер `t-bank-backend-1`, который занимает `8081`.

Проверка:

```bash
docker ps --format '{{.Names}} {{.Ports}}'
```

Если виден контейнер `t-bank-backend-1`, его нужно остановить:

```bash
docker stop t-bank-backend-1
```

### 2. Orphan backend container warning is expected

При `docker compose up` может появляться warning про orphan container. Для локального QA это не критично, но если контейнер держит порт `8081`, его нужно остановить.

### 3. Existing local DB state can affect startup

Если локальная база осталась от старого состояния проекта, startup может падать на миграциях.

Если backend уходит в restart loop, сначала посмотреть логи контейнера, затем при необходимости пересоздать локальную БД:

```bash
docker compose -f docker-compose.dev.yml logs backend
```

```bash
docker compose -f docker-compose.dev.yml down
docker volume ls
```

Удаление volume делать только осознанно, потому что это сносит локальные данные.

### 4. Backend container listens on 8080 inside Docker

В `docker-compose.dev.yml` backend внутри контейнера слушает `8080`, но наружу опубликован на `8081`.

Это нормальная схема:

- container: `8080`
- host: `8081`

Поэтому frontend локально должен ходить на `http://localhost:8081`.

## Quick smoke after startup

### Backend smoke

- `http://localhost:8081/swagger-ui.html`

```bash
curl http://localhost:8081/v3/api-docs
```

### Frontend smoke

- `http://localhost:5173`

## Stop commands

### Stop backend, Postgres and Redis

Из корня проекта:

```bash
docker compose -f docker-compose.dev.yml stop backend postgres redis
```

## All commands

```bash
docker compose -f docker-compose.dev.yml up --build backend postgres redis
```

```bash
cd frontend && \
VITE_BACKEND_PORT=8081 npm run dev -- --port 5173
```

```bash
docker ps --format '{{.Names}} {{.Ports}}'
```

```bash
docker stop t-bank-backend-1
```

```bash
curl http://localhost:8081/v3/api-docs
```

```bash
docker compose -f docker-compose.dev.yml stop backend postgres redis
```

```bash
docker compose -f docker-compose.dev.yml down
```

```bash
lsof -i :port
```

```bash
kill PID
```
