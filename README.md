# T-Ивент

Совместное управление бюджетом события или поездки: расходы, авто-деление,
взаиморасчёты «кто кому должен».

Стек: React 19 + TypeScript (frontend) · Spring Boot 4 / Java 25 (backend) ·
PostgreSQL · Redis · MinIO (S3) · Docker.

## Запуск проекта локально

Полный стек (frontend, backend, PostgreSQL, Redis, MinIO + авто-создание
бакета) поднимается одной командой. Всё собирается локально — доступ к
GHCR и `.env` не нужны.

### Требования

- Docker и Docker Compose (v2)
- Свободные порты: `3001`, `8081`, `5432`, `6379`, `9000`, `9001`

### Поднять

```bash
docker compose -f docker-compose.dev.yml up -d --build
```

Первая сборка занимает несколько минут (Maven-сборка backend). Повторные
запуски без изменений кода — быстрые; флаг `--build` нужен только после
правок исходников.

### Адреса

| Сервис            | URL                                          |
|-------------------|----------------------------------------------|
| Приложение        | http://localhost:3001                        |
| Backend / Swagger | http://localhost:8081/swagger-ui/index.html  |
| MinIO консоль     | http://localhost:9001 (`minioadmin` / `minioadmin123`) |

### Проверить, что всё поднялось

```bash
docker compose -f docker-compose.dev.yml ps
curl -s -o /dev/null -w "frontend %{http_code}\n" http://localhost:3001
curl -s -o /dev/null -w "backend  %{http_code}\n" http://localhost:8081/swagger-ui/index.html
curl -s -o /dev/null -w "minio    %{http_code}\n" http://localhost:9000/minio/health/live
```

Всё в порядке: контейнеры в статусе `Up`, три запроса возвращают `200`.

### Остановить

```bash
docker compose -f docker-compose.dev.yml down          # сохранить данные (volumes)
docker compose -f docker-compose.dev.yml down -v       # удалить и данные тоже
```

### Логи

```bash
docker compose -f docker-compose.dev.yml logs -f backend
```

## Разработка frontend отдельно

Если нужен hot-reload фронта без пересборки контейнера — см.
[frontend/README.md](frontend/README.md). Backend и инфраструктуру при этом
держите поднятыми через compose выше.

## Деплой

Прод разворачивается автоматически из ветки `main` через GitHub Actions
(`.github/workflows/deploy.yml`): сборка образов → push в GHCR → доставка на
сервер. Конфигурация прод-окружения (включая S3) задаётся через GitHub
Secrets — деплой генерирует `.env` на сервере из них.
