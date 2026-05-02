# Matrix Template

## Status Legend

### Coverage Status
- `Not Covered` - требование пока не покрыто тест-кейсами
- `In Progress` - тест-кейсы пишутся или сценарий еще в работе
- `Covered` - требование покрыто тест-кейсами
- `Blocked` - проверка требования заблокирована

### Smoke Status
- `Not Run` - smoke-проверка еще не запускалась
- `Passed` - smoke-проверка пройдена
- `Failed` - smoke-проверка завершилась с ошибкой
- `Blocked` - smoke-проверка не может быть выполнена

### Bug Status
- `No Bugs` - по требованию баги не зафиксированы
- `Open Bug` - есть открытый дефект
- `In Fix` - дефект в работе
- `Fixed` - дефект исправлен и ожидает проверки
- `Verified` - исправление проверено
- `Rejected` - дефект отклонен

### Priority
- `Critical`
- `High`
- `Medium`
- `Low`

## Matrix

| Requirement | Requirement ID | Test Cases | Coverage Status | Smoke | Smoke Status | Bugs | Bug Status | Priority | Comment |
| ----------- | -------------- | ---------- | --------------- | ----- | ------------ | ---- | ---------- | -------- | ------- |
| Registration and Authorization | REQ-001 | TC-001..TC-005 | Covered | SMK-001 | Passed | BUG-001 | Open Bug | Critical | Основной пользовательский вход |
| Event Creation | REQ-002 | TC-006..TC-010 | In Progress | SMK-002 | Not Run | — | No Bugs | Critical | Проверка обязательных полей |
| Invitation by Link | REQ-003 | TC-011..TC-014 | Covered | SMK-003 | Failed | BUG-004 | In Fix | High | Есть дефект на приеме инвайта |
| Expense Creation | REQ-004 | TC-018..TC-023 | Blocked | SMK-005 | Blocked | BUG-008 | Open Bug | Critical | Блокер в backend validation |
| CSV Export | REQ-005 | — | Not Covered | — | Not Run | — | No Bugs | Medium | Сценарии еще не подготовлены |

## Blank Template

| Requirement | Requirement ID | Test Cases | Coverage Status | Smoke | Smoke Status | Bugs | Bug Status | Priority | Comment |
| ----------- | -------------- | ---------- | --------------- | ----- | ------------ | ---- | ---------- | -------- | ------- |
|             |                |            | Not Covered / In Progress / Covered / Blocked |       | Not Run / Passed / Failed / Blocked |      | No Bugs / Open Bug / In Fix / Fixed / Verified / Rejected | Critical / High / Medium / Low |         |
