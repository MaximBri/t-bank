## Запуск фронтенда

Требования:

- Node.js 20+
- npm 10.8.2 (зафиксирован в `package.json` через поле `packageManager`)

Установка Node.js и npm:

- Скачайте Node.js (LTS) с https://nodejs.org
- npm устанавливается вместе с Node.js

Проектные настройки npm зафиксированы в `frontend/.npmrc`:

- `min-release-age=1440` — пакеты моложе 24 часов не устанавливаются (защита от supply-chain атак)
- `engine-strict=true` — установка падает при несовместимых версиях Node/npm
- `save-exact=true` — версии зависимостей сохраняются точными, без диапазонов

Установка зависимостей (строго из `package-lock.json`, без модификации lock-файла):

```bash
npm ci
```

Запуск в dev-режиме:

```bash
npm run dev
```

Сборка:

```bash
npm run build
```

Запуск тестов:

```bash
npm test
```

Линт:

```bash
npm run lint
```
