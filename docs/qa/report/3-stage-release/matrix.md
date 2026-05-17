# Матрица трассировки требований

## Назначение

Матрица показывает соответствие требований из ТЗ:

- тест-кейсам
- smoke-checklist
- автотестам по уровням пирамиды тестирования
- зафиксированным дефектам

## Пирамида тестирования

- `Unit` — модульные проверки frontend/backend логики
- `API` — контрактные и базовые API-тесты
- `E2E` — пользовательские сквозные сценарии и smoke UI
- `Manual` — test cases / checklists

## Статусы

- `Covered` — требование покрыто артефактами и/или автотестами
- `Partial` — покрыто частично
- `Planned` — покрытие запланировано, но не завершено
- `Blocked by bug` — покрытие упирается в открытые дефекты

## Матрица

| Req ID | Требование из ТЗ | Test Cases | Smoke | Источник проверки | Status | Комментарий | Баги | Unit | API | E2E |
|---|---|---|---|---|---|---|---|---|---|---|
| REQ-001 | Регистрация и авторизация пользователей | [`TC-001`](../../test-case/auth/tc-001.md), [`TC-002`](../../test-case/auth/tc-002.md), [`TC-SMOKE-UI-01`](../../test-case/auth/tc-smoke-ui-01.md), [`TC-SMOKE-UI-02`](../../test-case/auth/tc-smoke-ui-02.md) | [`SMK-01`](../../checklist/smoke-checklist.md), [`SMK-08`](../../checklist/smoke-checklist.md), [`SMK-20`](../../checklist/smoke-checklist.md), [`SMK-21`](../../checklist/smoke-checklist.md) | Manual, API autotests, E2E autotests | Covered | Базовое API и E2E покрытие есть | [`BUG-004`](../../bug-report/bug-004.md), [`BUG-005`](../../bug-report/bug-005.md), [`BUG-006`](../../bug-report/bug-006.md), [`BUG-007`](../../bug-report/bug-007.md), [`BUG-008`](../../bug-report/bug-008.md) | N/A | `auth` домен покрыт позитивными и негативными API-проверками | Есть UI smoke для login/register и auth e2e |
| REQ-002 | Создание события / поездки: название, даты, описание | [`TC-003`](../../test-case/events/tc-003.md), [`TC-015`](../../test-case/events/tc-015.md), [`TC-020`](../../test-case/events/tc-020.md), [`TC-SMOKE-UI-05`](../../test-case/events/tc-smoke-ui-05.md), [`TC-SMOKE-UI-06`](../../test-case/events/tc-smoke-ui-06.md) | [`SMK-02`](../../checklist/smoke-checklist.md), [`SMK-11`](../../checklist/smoke-checklist.md), [`SMK-23`](../../checklist/smoke-checklist.md), [`SMK-24`](../../checklist/smoke-checklist.md) | Manual, API autotests, E2E autotests | Partial | Создание события проходит, но редактирование падает с `500`, кнопка завершения события не работает, а длинные значения и изображение выявляют UI/validation-дефекты | [`BUG-011`](../../bug-report/bug-011.md), [`BUG-013`](../../bug-report/bug-013.md), [`BUG-015`](../../bug-report/bug-015.md), [`BUG-016`](../../bug-report/bug-016.md), [`BUG-017`](../../bug-report/bug-017.md), [`BUG-020`](../../bug-report/bug-020.md), [`BUG-023`](../../bug-report/bug-023.md) | N/A | `events` домен: базовое API-покрытие create/list/get/update | Есть UI smoke для home, create event screen и event page |
| REQ-003 | Роли: владелец и участник | [`TC-005`](../../test-case/participants/tc-005.md), [`TC-006`](../../test-case/participants/tc-006.md) | [`SMK-04`](../../checklist/smoke-checklist.md), [`SMK-05`](../../checklist/smoke-checklist.md) | Manual, API autotests, E2E smoke | Blocked by bug | Проверка ролей в сценариях с участниками упирается в нерабочее присоединение по пригласительной ссылке | [`BUG-019`](../../bug-report/bug-019.md) | N/A | `participants` домен покрыт частично | Частично через event/profile smoke |
| REQ-004 | Приглашение участников по ссылке и подтверждение участия | [`TC-004`](../../test-case/invitations/tc-004.md), [`TC-005`](../../test-case/participants/tc-005.md), [`TC-SMOKE-UI-04`](../../test-case/invitations/tc-smoke-ui-04.md) | [`SMK-03`](../../checklist/smoke-checklist.md), [`SMK-04`](../../checklist/smoke-checklist.md) | Manual, E2E smoke | Blocked by bug | Пригласительная ссылка формируется, но присоединение по ней сейчас нерабочее | [`BUG-019`](../../bug-report/bug-019.md) | N/A | По текущему `openapi` домен не представлен | UI сценарий invite flow блокируется |
| REQ-005 | Категории бюджета: дефолтные и пользовательские | [`TC-021`](../../test-case/expenses/tc-021.md) | — | Manual | Planned | Для требования заведен manual test case в сценарии добавления расхода, но в текущем контракте categories отсутствуют как отдельный домен | — | N/A | В текущем `openapi` endpoints отсутствуют | Нет |
| REQ-006 | Добавление расходов: плательщик, участники, категория, сумма, комментарий | [`TC-007`](../../test-case/expenses/tc-007.md), [`TC-016`](../../test-case/expenses/tc-016.md), [`TC-019`](../../test-case/expenses/tc-019.md), [`TC-SMOKE-UI-08`](../../test-case/expenses/tc-smoke-ui-08.md), [`TC-SMOKE-UI-09`](../../test-case/expenses/tc-smoke-ui-09.md), [`TC-SMOKE-UI-10`](../../test-case/expenses/tc-smoke-ui-10.md), [`TC-SMOKE-UI-11`](../../test-case/expenses/tc-smoke-ui-11.md) | [`SMK-06`](../../checklist/smoke-checklist.md), [`SMK-12`](../../checklist/smoke-checklist.md), [`SMK-13`](../../checklist/smoke-checklist.md) | Manual, API autotests, E2E smoke | Partial | Добавление расхода проходит, но редактирование падает с `500`, длинный заголовок ломает карточку расхода, а сценарии с участниками упираются в invite bug | [`BUG-012`](../../bug-report/bug-012.md), [`BUG-018`](../../bug-report/bug-018.md), [`BUG-019`](../../bug-report/bug-019.md) | N/A | `expenses` домен: базовое API-покрытие list/create | UI expense pages/forms ещё не закончены |
| REQ-007 | Автоматический расчёт долей при равном делении расхода | [`TC-008`](../../test-case/settlements/tc-008.md) | [`SMK-07`](../../checklist/smoke-checklist.md) | Manual | Blocked by bug | Ручная регрессия упирается в нерабочий многопользовательский сценарий присоединения по пригласительной ссылке | [`BUG-019`](../../bug-report/bug-019.md) | N/A | Нет отдельного контрактного покрытия | Нет |
| REQ-008 | Пересчёт сальдо после добавления или изменения расходов | [`TC-008`](../../test-case/settlements/tc-008.md), [`TC-009`](../../test-case/settlements/tc-009.md), [`TC-010`](../../test-case/settlements/tc-010.md) | [`SMK-07`](../../checklist/smoke-checklist.md) | Manual | Blocked by bug | Проверка расчетов и подтверждения платежей блокируется нерабочим сценарием приглашения второго участника | [`BUG-019`](../../bug-report/bug-019.md) | N/A | Нет отдельного контрактного покрытия | Нет |
| REQ-009 | История событий и действий участников | — | [`SMK-10`](../../checklist/smoke-checklist.md) | Smoke checklist | Planned | В ТЗ требование есть, в текущем контракте не представлено | — | N/A | В текущем `openapi` endpoint истории отсутствует | Нет |
| REQ-010 | Экспорт итогов в CSV | — | — | Не трассировано | Planned | Требование есть в ТЗ, но контракт/реализация не трассированы | — | N/A | Endpoint в текущем контракте отсутствует | Нет |
| REQ-011 | Личный кабинет / профиль пользователя | [`TC-012`](../../test-case/profile/tc-012.md), [`TC-013`](../../test-case/profile/tc-013.md), [`TC-SMOKE-UI-16`](../../test-case/profile/tc-smoke-ui-16.md) | [`SMK-17`](../../checklist/smoke-checklist.md), [`SMK-18`](../../checklist/smoke-checklist.md), [`SMK-25`](../../checklist/smoke-checklist.md) | Manual, API autotests, E2E autotests | Partial | Базовое API покрытие и UI smoke есть, но ручная регрессия выявила нерабочие сценарии редактирования профиля и смены пароля | [`BUG-021`](../../bug-report/bug-021.md), [`BUG-022`](../../bug-report/bug-022.md) | N/A | `profile` домен: базовое API-покрытие `GET /me`, `PATCH /me`, `POST /me/password` | Есть UI smoke для profile page |

## Покрытие по артефактам

### Unit coverage

Для frontend есть unit-тесты, но их покрытие пока не трассировано по отдельным требованиям из ТЗ. Поэтому в колонке `Unit` указано `N/A`, а ниже приведено только агрегированное покрытие:

- `Statements` — `20.78%` (`281/1352`)
- `Branches` — `4.28%` (`31/724`)
- `Functions` — `4.58%` (`21/458`)
- `Lines` — `20.78%` (`265/1275`)

### API baseline

Актуальные домены текущего `openapi` контракта, заведенные в автотестах:

- `auth`
- `events`
- `expenses`
- `profile`
- `participants`

Доменов нет в текущем контракте / неактуальны для базовой проверки:

- `categories`
- `invite-links`
- `settlements`

### E2E Smoke (UI)

Сейчас заведены:

- [`SMK-20`](../../checklist/smoke-checklist.md) / [`TC-SMOKE-UI-01`](../../test-case/auth/tc-smoke-ui-01.md) — login page
- [`SMK-21`](../../checklist/smoke-checklist.md) / [`TC-SMOKE-UI-02`](../../test-case/auth/tc-smoke-ui-02.md) — register page
- [`SMK-22`](../../checklist/smoke-checklist.md) / [`TC-SMOKE-UI-03`](../../test-case/events/tc-smoke-ui-03.md) — home page
- [`SMK-23`](../../checklist/smoke-checklist.md) / [`TC-SMOKE-UI-05`](../../test-case/events/tc-smoke-ui-05.md) — create event screen
- [`SMK-24`](../../checklist/smoke-checklist.md) / [`TC-SMOKE-UI-06`](../../test-case/events/tc-smoke-ui-06.md) — event page
- [`SMK-25`](../../checklist/smoke-checklist.md) / [`TC-SMOKE-UI-16`](../../test-case/profile/tc-smoke-ui-16.md) — profile page

Не закончены:

- последующие expense / invite / leave event UI сценарии

## Комментарий

Матрица отражает текущее состояние проекта:

- часть требований закрыта тестированием API и E2E smoke-тестами
- часть требований присутствует в ТЗ, но отсутствует в текущем `openapi` контракте
- часть ручных регрессионных сценариев переведена из `Planned` в `Blocked by bug` по фактическим результатам проверки
- сценарии профиля, редактирования/завершения события и редактирования расхода имеют подтвержденные дефекты
- часть позитивных API-сценариев выявила backend-дефекты `500`
