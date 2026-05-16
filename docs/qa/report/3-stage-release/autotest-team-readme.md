# Autotest Runbook

## Purpose

Короткая инструкция для команды по локальному и CI-запуску автотестов.

## Scope

- API autotests: `frontend/tests/api`
- E2E autotests: `frontend/tests/e2e`

## Preconditions

- Docker / Docker Compose установлены
- Node.js `20+`
- npm `10+`
- свободны порты:
  - `5432`
  - `6379`
  - `8081`
  - `5173`

## Local environment

### 1. Start backend, database and redis

Из корня проекта:

```bash
docker compose -f docker-compose.dev.yml up --build backend postgres redis
```

### 2. Start frontend

```bash
cd frontend
VITE_BACKEND_PORT=8081 npm run dev -- --port 5173
```

### 3. Verify URLs

- frontend: `http://localhost:5173`
- backend: `http://localhost:8081`
- OpenAPI: `http://localhost:8081/v3/api-docs`

## Local test run

### API tests

Из `frontend`:

```bash
npm run test:api
```

### E2E tests

Из `frontend`:

```bash
npm run test:e2e
```

## Local reports

### Playwright HTML report

API:

```bash
npx playwright show-report .artifacts/api/playwright-report
```

E2E:

```bash
npx playwright show-report .artifacts/e2e/playwright-report
```

### Allure report

API:

```bash
npm run test:api:allure:run
```

E2E:

```bash
npm run test:e2e:allure:run
```

Notes:

- `:allure:run` очищает старые `allure-results` и `allure-report`
- `:allure:generate` и `:allure:open` не очищают старые артефакты

## Useful test commands

Из `frontend`:

```bash
npm run test:api
```

```bash
npm run test:e2e
```

```bash
npm run test:e2e:ui
```

```bash
npm run test:e2e:headed
```

```bash
npm run test:e2e:debug
```

## Test locations

- API:
  - specs: `frontend/tests/api/domains`
  - shared config/lib: `frontend/tests/api/shared`

- E2E:
  - smoke: `frontend/tests/e2e/smoke`
  - features: `frontend/tests/e2e/features`
  - shared config/lib: `frontend/tests/e2e/shared`

## CI workflows

- API workflow:
  - file: `.github/workflows/api.yml`
  - workflow запускается:
    - при `push` в ветки `main`, `test`, `test/*`, `chore/test-*`
    - при `pull_request` в `dev` и `main`
    - вручную через `workflow_dispatch`
  - workflow срабатывает при изменениях в:
    - `backend/tevent/**`
    - `frontend/tests/api/**`
    - `frontend/playwright.api.config.ts`
    - `frontend/package.json`
    - `frontend/package-lock.json`
    - `.github/workflows/api.yml`

- E2E workflow:
  - file: `.github/workflows/e2e.yml`
  - workflow запускается:
    - при `push` в ветки `main`, `test`, `test/*`, `chore/test-*`
    - при `pull_request` в `dev` и `main`
    - вручную через `workflow_dispatch`
  - workflow срабатывает при изменениях в:
    - `frontend/**`
    - `backend/tevent/**`
    - `.github/workflows/e2e.yml`

## CI artifacts

API workflow uploads:
- `playwright-api-report`
- `backend-log-api` on failure

E2E workflow uploads:
- `playwright-report`
- `backend-log` on failure

## Known issues

- Allure-отчет становится устаревший, если перед генерацией не очищен `allure-results`
