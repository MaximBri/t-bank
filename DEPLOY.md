# Деплой прода

## Обычный деплой

```bash
cd /opt/t-events
./deploy.sh   # docker login + compose pull + up -d
```

`docker-compose.prod.yml` и `.env` лежат на сервере вне git и не
перезаписываются `deploy.sh`. При изменении этих файлов в репозитории
их нужно вручную синхронизировать на сервер.

## S3 / MinIO — настройка хранилища (делается один раз на сервер)

S3 проксируется **отдельным сабдоменом на хостовом nginx**, а не через
контейнерный nginx фронта. Причина: бэк (AWS SDK / spring-cloud-aws)
подписывает presigned-URL по SigV4, включая путь в canonical request.
Если endpoint содержит префикс пути (напр. `https://domain/s3-storage`),
а реверс-прокси этот префикс срезает, MinIO считает подпись по другому
пути → `SignatureDoesNotMatch` (403 на каждый upload/download).

Решение: сабдомен `s3.<домен>` → MinIO напрямую, путь 1:1.

### 1. DNS

A-запись `s3.<домен>` → IP сервера (тот же, что у основного домена).

### 2. Проброс порта MinIO

В `docker-compose.prod.yml` сервис `minio` пробрасывает порт только на
loopback хоста (уже в этой ветке):

```yaml
  minio:
    ports:
      - "127.0.0.1:9000:9000"
```

Наружу MinIO не публикуется — доступ только через хостовой nginx с TLS.

### 3. TLS-сертификат

```bash
certbot certonly --nginx -d s3.<домен> --non-interactive --agree-tos -m <email>
```

### 4. nginx server-блок (хостовой nginx, вне репозитория)

Добавить в конфиг сайта (напр. `/etc/nginx/sites-available/<домен>.conf`):

```nginx
server {
    listen 80;
    server_name s3.<домен>;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name s3.<домен>;

    ssl_certificate     /etc/letsencrypt/live/s3.<домен>/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/s3.<домен>/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    client_max_body_size 10m;

    location / {
        proxy_pass http://127.0.0.1:9000;          # БЕЗ слеша на конце,
        proxy_set_header Host $host;               # location тоже без префикса —
        proxy_set_header X-Real-IP $remote_addr;   # путь идёт в MinIO 1:1
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_request_buffering off;
    }
}
```

```bash
nginx -t && systemctl reload nginx
```

### 5. .env на сервере

```dotenv
MINIO_ROOT_USER=<логин, не minioadmin>
MINIO_ROOT_PASSWORD=<сильный секрет: openssl rand -base64 24>
SPRING_CLOUD_AWS_S3_ENDPOINT=https://s3.<домен>
SPRING_CLOUD_AWS_S3_BUCKET_NAME=tbank-receipts
SPRING_CLOUD_AWS_REGION_STATIC=us-east-1
```

Затем пересоздать backend:

```bash
docker compose -f docker-compose.prod.yml up -d --force-recreate backend minio
```

Бакет создаётся автоматически сервисом `create-bucket` из compose.

### Проверка

```bash
curl -sI https://s3.<домен>/minio/health/live | head -1   # → 200
```

Загрузить файл в UI → PUT на `s3.<домен>/tbank-receipts/...` должен
вернуть 200, файл появиться в бакете.
