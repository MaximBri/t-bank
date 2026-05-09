# Local Run Notes

## Purpose

Короткая инструкция, как локально поднять `T-Ивент` для ручной проверки, smoke и QA-прогонов.

## What is started

- `Postgres` в Docker
- `Redis` в Docker
- `backend` локально через Maven
- `frontend` локально через Vite

## Preconditions

- Docker / Docker Compose установлены
- Java 25 установлена
- Node.js и npm установлены
- свободны порты:
  - `5432` для Postgres
  - `6379` для Redis
  - `8081` для backend
  - `3000` для frontend

## Start order

### 1. Start database and redis

Из корня проекта:

```bash
docker compose up -d postgres redis
```

### 2. Start backend

Перейти в `backend/tevent` и запустить:

```bash
JWT_SECRET=local_dev_secret_key_123456789012345 ./mvnw spring-boot:run -Dspring-boot.run.jvmArguments='-Dserver.port=8081'
```

### 3. Start frontend

Перейти в `frontend` и запустить:

```bash
VITE_API_URL=http://localhost:8081 VITE_BACKEND_PORT=8081 npm run dev -- --host 127.0.0.1 --port 3000
```

## URLs

- frontend: `http://127.0.0.1:3000`
- backend: `http://127.0.0.1:8081`
- Swagger UI: `http://127.0.0.1:8081/swagger-ui.html`
- OpenAPI JSON: `http://127.0.0.1:8081/v3/api-docs`

## Why frontend runs on 3000

В текущем состоянии проекта backend CORS настроен на `http://localhost:3000`, поэтому для локального ручного прогона проще поднимать frontend именно на `3000`.

## Notes / Known issues

### 1. JWT secret is mandatory

Backend не стартует без `JWT_SECRET` длиной минимум 32 символа.

Если секрет короткий, приложение падает с ошибкой:

- `JWT secret must contain at least 32 characters123123123`

### 2. Port 8081 may already be occupied

В проекте может остаться старый контейнер `t-bank-backend-1`, который занимает `8081`.

Проверка:

```bash
docker ps --format '{{.Names}} {{.Ports}}'
```

Если виден контейнер `t-bank-backend-1`, его нужно остановить:

```bash
docker stop t-bank-backend-1
```

### 3. Orphan backend container warning is expected

При `docker compose up` может появляться warning про orphan container. Для локального QA это не критично, но если контейнер держит порт `8081`, его нужно остановить.

### 4. Liquibase migration issue

В проекте была проблема в миграции `03-user-avatar-and-optional-names.sql`: использовалось имя колонки `last_name`, тогда как схема работает с `second_name`.

Если кто-то запускает старую версию файла, backend может падать на старте Liquibase.

### 5. Existing local DB state can affect startup

Если локальная база осталась от старого состояния проекта, startup может падать на миграциях.

В таком случае сначала посмотреть логи backend, затем при необходимости пересоздать локальную БД:

```bash
docker compose down
docker volume ls
```

Удаление volume делать только осознанно, потому что это сносит локальные данные.

## Quick smoke after startup

### Backend smoke

- `http://127.0.0.1:8081/swagger-ui.html`

```bash
curl http://127.0.0.1:8081/v3/api-docs
```

### Frontend smoke

- `http://127.0.0.1:3000`

## Stop commands

### Stop Postgres and Redis

Из корня проекта:

```bash
docker compose stop postgres redis
```

## All commands

```bash
docker compose up -d postgres redis
```

```bash
cd backend/tevent && \
JWT_SECRET=local_dev_secret_key_123456789012345 ./mvnw spring-boot:run -Dspring-boot.run.jvmArguments='-Dserver.port=8081'
```

```bash
cd frontend && \
VITE_API_URL=http://localhost:8081 VITE_BACKEND_PORT=8081 npm run dev -- --host 127.0.0.1 --port 3000
```

```bash
docker ps --format '{{.Names}} {{.Ports}}'
```

```bash
docker stop t-bank-backend-1
```

```bash
curl http://127.0.0.1:8081/v3/api-docs
```

```bash
docker compose stop postgres redis
```

```bash
docker compose down
```

```bash
lsof -i :port
```

```bash
kill PID
```
