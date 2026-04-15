#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [[ ! -f "${ROOT_DIR}/.env" ]]; then
  echo ".env file not found in ${ROOT_DIR}" >&2
  exit 1
fi

set -a
source "${ROOT_DIR}/.env"
set +a

echo "${GHCR_TOKEN}" | docker login "${IMAGE_REGISTRY}" -u "${GHCR_USERNAME}" --password-stdin
docker compose -f "${ROOT_DIR}/docker-compose.prod.yml" pull
docker compose -f "${ROOT_DIR}/docker-compose.prod.yml" up -d
docker image prune -f
