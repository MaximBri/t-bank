# Отчет третьего дедлайна 

**PR:** https://github.com/MaximBri/t-bank/pull/??

## 1. Релизный статус

| Параметр | Статус |
|---|---|
| Релизная готовность | **Не готово к релизу** |
| Основной пользовательский сценарий | **Не подтверждается** |
| Регрессионное тестирование | **Выполнено вручную, часть сценариев заблокирована** |
| API-автоматизация | **Полное покрытие доступных endpoint-ов** |
| E2E-автоматизация | **Добавлено для всех экранов - смок сценарии* |
| Unit coverage | **Зафиксирован для frontend** |

Продукт пока не готов к релизу, так как остаются открытые блокеры, часть регрессионных сценариев находится в статусе `Blocked`, а полный основной пользовательский сценарий продукта пока не подтвержден.

Ключевые блокеры:

- [`BUG-019`](../../bug-report/bug-019.md)
- [`BUG-012`](../../bug-report/bug-012.md)
- [`BUG-013`](../../bug-report/bug-013.md)
- [`BUG-023`](../../bug-report/bug-023.md)

## 2. Прогноз после исправления блокеров

После исправления текущих блокеров ожидается следующее:

- [`BUG-019`](../../bug-report/bug-019.md) разблокирует значительную часть многопользовательских сценариев: приглашение, участники, взаиморасчеты и выход из события;
- исправление [`BUG-012`](../../bug-report/bug-012.md), [`BUG-013`](../../bug-report/bug-013.md) и [`BUG-023`](../../bug-report/bug-023.md) позволит полноценно перепроверить CRUD-сценарии событий и расходов;
- исправление [`BUG-021`](../../bug-report/bug-021.md) и [`BUG-022`](../../bug-report/bug-022.md) позволит подтвердить сценарии личного кабинета;
- после снятия текущих блокеров число найденных дефектов может кратковременно вырасти, так как станут доступны ранее заблокированные сценарии.

## 3. Почему продукт пока не готов к релизу

Основная причина - наличие дефектов, которые блокируют подтверждение ключевых пользовательских сценариев.

На текущем этапе:

- часть регрессионных сценариев остается в статусе `Blocked`;
- полный основной пользовательский сценарий продукта пока не подтвержден;
- часть требований из ТЗ отсутствует в текущем `openapi` контракте и поэтому не может быть полноценно покрыта на API-уровне;
- frontend unit-тесты существуют, находятся в зоне ответственности программистов;
- часть позитивных API-сценариев вскрывает реальные backend-дефекты `500`.

## 4. Ключевые метрики этапа

### 4.1 Требования

| Covered | Partial | Planned(not ready) | Blocked by bug |
|---:|---:|---:|---:|
| 9% | 36% | 27% | 28% |

```text
Covered         [##..................] 9%
Partial         [#######.............] 36%
Planned         [#####...............] 27%
Blocked by bug  [######..............] 28%
```

### 4.2 Регрессия

| Всего сценариев | Passed | Failed | Blocked |
|---:|---:|---:|---:|
| 20 | 30% | 30% | 40% |

```text
Passed   [######..............] 30%
Failed   [######..............] 30%
Blocked  [########............] 40%
```

### 4.3 Дефекты

| Всего баг-репортов | Open high severity | Open medium severity | Blockers |
|---:|---:|---:|---:|
| 23 | 26% | 13% | 17% |

```text
Open high severity    [#####...............] 26%
Open medium severity  [###.................] 13%
Blockers     [###.................] 17%
```

### 4.4 Автотесты

| API-тесты | E2E smoke сценариев | Manual test cases |
|---:|---:|---:|
| 5 | 6 | 21 |

## 5. Что было сделано на этапе

В рамках третьего дедлайна подготовлен комплект QA-артефактов по регрессионному тестированию, матрице трассировки требований, анализу major-дефектов, покрытию автотестами и автоматизации API / E2E / unit-проверок.

На текущем этапе:

- проведено повторное ручное регрессионное тестирование основных пользовательских сценариев;
- собрана матрица трассировки требований с привязкой к test-case-ам, smoke-checklist-ам, автотестам и баг-репортам;
- актуализирована сводка по крупным дефектам и блокерам проверки перед релизом;
- оформлены и дополнены баг-репорты по найденным дефектам;
- добавлено базовое API-покрытие по актуальным доменам: позитивные и негативные сценарии;
- добавлены E2E smoke-тесты основных экранов и сценариев открытия страниц для 3 основных браузеров (chromium, firefox, webkit) и mobile (Mobile Chrome, Mobile Safari);
- зафиксировано текущее frontend unit coverage;
- настроен локальный запуск автотестов и CI workflows.

## 6. Детализация по направлениям

### 6.1 Регрессионное тестирование

Проведено повторное ручное регрессионное тестирование основных пользовательских сценариев после исправления блокирующего дефекта регистрации [`BUG-008`](../../bug-report/bug-008.md).

Что подтверждено:

- сценарии регистрации и авторизации работают;
- базовые сценарии создания события, добавления расхода и выхода из аккаунта доступны для повторной проверки;
- часть сценариев завершилась статусами `Failed` и `Blocked` из-за открытых дефектов.

Итог регресса:

- `Passed` - 6
- `Failed` - 6
- `Blocked` - 8
- `Всего` - 20

**Артефакты:**

- [`regress-testing-report.md`](./regress-testing-report.md)
- [`test-cases`](../../test-case/index.md)
- [`BUG-019`](../../bug-report/bug-019.md)
- [`BUG-012`](../../bug-report/bug-012.md)
- [`BUG-013`](../../bug-report/bug-013.md)
- [`BUG-023`](../../bug-report/bug-023.md)

---

### 6.2 Матрица трассировки требований

Подготовлена матрица трассировки требований из ТЗ с привязкой к:

- manual test cases;
- smoke-checklist;
- API autotests;
- E2E autotests;
- bug reports.

Что отражено в матрице:

- покрытие требований по уровням пирамиды тестирования;
- статус требования: `Covered`, `Partial`, `Planned`, `Blocked by bug`;
- источник проверки для каждого требования.

**Артефакты:**

- [`matrix.md`](./matrix.md)
- [`test-cases index.md`](../../test-case/index.md)
- [`smoke-checklist.md`](../../checklist/smoke-checklist.md)
- [`bug-report index.md`](../../bug-report/index.md)

---

### 6.3 Анализ крупных дефектов

Подготовлена отдельная сводка по крупным дефектам и блокерам релизной проверки.

Сводка:

- исправлен 1 ранее блокирующий дефект: [`BUG-008`](../../bug-report/bug-008.md);
- открыты 6 дефектов высокой серьезности;
- открыты 3 дефекта средней серьезности;
- выделены блокеры, влияющие на завершение основных пользовательских сценариев.

**Артефакты:**

- [`major-bug-report.md`](./major-bug-report.md)
- [`bug-report index.md`](../../bug-report/index.md)
- [`BUG-019`](../../bug-report/bug-019.md)
- [`BUG-012`](../../bug-report/bug-012.md)
- [`BUG-013`](../../bug-report/bug-013.md)
- [`BUG-023`](../../bug-report/bug-023.md)

---

### 6.4 Баг-репорты

Оформлены и дополнены баг-репорты по результатам регрессии, API-проверок и smoke-UI-проверок.

Сводка по текущему набору багов:

- всего заведено баг-репортов: 23;
- высокая severity: 7;
- средняя severity: 8;
- низкая severity: 8.

**Артефакты:**

- [`bug-report index.md`](../../bug-report/index.md)
- [`BUG-011`](../../bug-report/bug-011.md)
- [`BUG-012`](../../bug-report/bug-012.md)
- [`BUG-013`](../../bug-report/bug-013.md)
- [`BUG-014`](../../bug-report/bug-014.md)
- [`BUG-015`](../../bug-report/bug-015.md)
- [`BUG-016`](../../bug-report/bug-016.md)
- [`BUG-017`](../../bug-report/bug-017.md)
- [`BUG-018`](../../bug-report/bug-018.md)
- [`BUG-019`](../../bug-report/bug-019.md)
- [`BUG-020`](../../bug-report/bug-020.md)
- [`BUG-021`](../../bug-report/bug-021.md)
- [`BUG-022`](../../bug-report/bug-022.md)
- [`BUG-023`](../../bug-report/bug-023.md)

---

### 6.5 API-автоматизация и покрытие

Добавлено базовое API-покрытие для актуальных доменов текущего контракта.

Что покрыто:

- `auth` - позитивные и негативные сценарии;
- `events` - позитивные и негативные сценарии;
- `expenses` - позитивные и негативные сценарии;
- `profile` - позитивные и негативные сценарии;
- `participants` - базовые сценарии по текущему контракту.

Что дополнительно сделано:

- актуализированы endpoints;
- добавлен Allure для локального запуска API-тестов;
- API-тесты интегрированы в CI.

CI workflow:

- workflow: `api.yml`;
- `push`: ветки `main`, `test`, `test/*`, `chore/test-*`;
- `pull_request`: ветки `dev`, `main`;
- `workflow_dispatch`: ручной запуск;
- workflow срабатывает при изменениях в:
  - `backend/tevent/**`;
  - `frontend/tests/api/**`;
  - `frontend/playwright.api.config.ts`;
  - `frontend/package.json`;
  - `frontend/package-lock.json`;
  - `.github/workflows/api.yml`.

Где находятся настройки и артефакты:

- config: [`frontend/playwright.api.config.ts`](../../../../frontend/playwright.api.config.ts)
- scripts: [`frontend/package.json`](../../../../frontend/package.json)
- test results: `frontend/.artifacts/api/test-results`
- Playwright report: `frontend/.artifacts/api/playwright-report`
- Allure results: `frontend/.artifacts/api/allure-results`
- Allure report: `frontend/.artifacts/api/allure-report`

Скрипты локального запуска:

Из директории `frontend`:
- API tests: `npm run test:api`
- API Allure run: `npm run test:api:allure:run`

Ограничения:

- часть позитивных API-сценариев вскрывает реальные backend-дефекты `500`;
- часть доменов из ТЗ отсутствует в текущем `openapi` контракте.

**Артефакты:**

- [`matrix.md`](./matrix.md)
- [`regress-testing-report.md`](./regress-testing-report.md)
- [`api-endpoints.md`](../../api/api-endpoints.md)
- [`frontend/playwright.api.config.ts`](../../../../frontend/playwright.api.config.ts)
- [`frontend/package.json`](../../../../frontend/package.json)

---

### 6.6 E2E-автоматизация и smoke UI

Добавлены E2E smoke-тесты для основных экранов и базовых пользовательских переходов с использованием Page Object pattern.

Что покрыто:

- login page;
- register page;
- home page;
- create event screen;
- event page;
- profile page.

Что дополнительно сделано:

- тесты организованы по Page Object pattern;
- E2E smoke запускается в кросс-браузерной и mobile-конфигурации:
  - desktop: `chromium`, `firefox`, `webkit`;
  - mobile: `Mobile Chrome`, `Mobile Safari`;
- таким образом покрываются базовые проверки desktop, cross-browser и mobile / responsive поведения;
- E2E smoke интегрирован в CI.

CI workflow:

- workflow: `e2e.yml`;
- `push`: ветки `main`, `test`, `test/*`, `chore/test-*`;
- `pull_request`: ветки `dev`, `main`;
- `workflow_dispatch`: ручной запуск;
- workflow срабатывает при изменениях в:
  - `frontend/**`;
  - `backend/tevent/**`;
  - `.github/workflows/e2e.yml`.

Где находятся настройки и артефакты:

- config: [`frontend/playwright.config.ts`](../../../../frontend/playwright.config.ts)
- scripts: [`frontend/package.json`](../../../../frontend/package.json)
- test results: `frontend/.artifacts/e2e/test-results`
- Playwright report: `frontend/.artifacts/e2e/playwright-report`
- Allure results: `frontend/.artifacts/e2e/allure-results`
- Allure report: `frontend/.artifacts/e2e/allure-report`
- tests: [`frontend/tests/e2e`](../../../frontend/tests/e2e)

Скрипты локального запуска:

Из директории `frontend`:
- E2E tests: `npm run test:e2e`
- E2E Playwright report: `npm run test:e2e:playwright:open`
- E2E Allure run: `npm run test:e2e:allure:run`

Ограничения:

- последующие UI-сценарии для expenses / invite / leave event еще не завершены;
- часть полных пользовательских сценариев блокируется текущими frontend- и backend-дефектами.

**Артефакты:**

- [`matrix.md`](./matrix.md)
- [`smoke-checklist.md`](../../checklist/smoke-checklist.md)
- [`index.md`](../../test-case/index.md)
- [`frontend/playwright.config.ts`](../../../../frontend/playwright.config.ts)
- [`frontend/package.json`](../../../../frontend/package.json)
- [`frontend/tests/e2e`](../../../frontend/tests/e2e)

---

### 6.7 Unit coverage и запуск автотестов

Зафиксировано текущее frontend unit coverage и подготовлена инструкция для команды по локальному и CI-запуску автотестов.

Текущее покрытие frontend unit-тестов:

- `Statements` - `20.78%` (`281/1352`);
- `Branches` - `4.28%` (`31/724`);
- `Functions` - `4.58%` (`21/458`);
- `Lines` - `20.78%` (`265/1275`).

Где находятся настройки:

- E2E Playwright config: [`frontend/playwright.config.ts`](../../../../frontend/playwright.config.ts)
- API Playwright config: [`frontend/playwright.api.config.ts`](../../../../frontend/playwright.api.config.ts)
- npm scripts: [`frontend/package.json`](../../../../frontend/package.json)

Где хранятся артефакты:

- unit coverage: `frontend/.artifacts/unit/coverage`

Скрипты локального запуска:

Из директории `frontend`:
- unit coverage: `npm run test:coverage`
- unit short summary: `npm run test:coverage:short`

CI workflow:

- workflow: `check.yml`;
- `push`: ветки `dev`, `main`, `test`, `test/*`, `chore/test-*`;
- `pull_request`: ветки `dev`, `main`;
- workflow срабатывает при изменениях в:
  - `frontend/**`;
  - `.github/workflows/check.yml`.

**Артефакты:**

- [`autotest-team-readme.md`](./autotest-team-readme.md)
- [`frontend/package.json`](../../../../frontend/package.json)
- [`matrix.md`](./matrix.md)
- [`check.yml`](../../../../.github/workflows/check.yml)
- [`api.yml`](../../../../.github/workflows/api.yml)
- [`e2e.yml`](../../../../.github/workflows/e2e.yml)

## 7. Ограничения и риски

На текущем этапе сохраняются следующие ограничения:

- часть требований из ТЗ отсутствует в текущем `openapi` контракте и поэтому не может быть полноценно покрыта на API-уровне;
- часть регрессионных сценариев остается в статусе `Blocked` из-за открытых дефектов:
  - [`BUG-019`](../../bug-report/bug-019.md);
  - [`BUG-012`](../../bug-report/bug-012.md);
  - [`BUG-013`](../../bug-report/bug-013.md);
  - [`BUG-023`](../../bug-report/bug-023.md);
- frontend unit-тесты существуют, но не трассированы по требованиям в матрице;
- последующие UI-сценарии для expenses / invite / leave event доменов не завершены на момент релиза;
- часть позитивных API-сценариев вскрывает реальные backend-дефекты `500`;
- после исправления текущих блокеров может быть найдено больше дефектов, так как станут доступны ранее заблокированные сценарии.

## 8. Итог

QA-часть третьего дедлайна выполнена: проведена регрессия, обновлены тестовые артефакты, заведены и актуализированы баг-репорты, добавлено базовое API / E2E / unit-покрытие и настроены CI workflows.

При этом продуктовый статус остается **не готов к релизу**, так как открытые дефекты блокируют подтверждение части основных пользовательских сценариев.


Фокус для следующего этапа:

- исправление и перепроверка блокеров;
- повторный прогон заблокированных регрессионных сценариев;
- расширение E2E-сценариев для expenses / invite / leave event;
- актуализация матрицы после исправления дефектов;
- подтверждение полного пользовательского сценария перед демо.
