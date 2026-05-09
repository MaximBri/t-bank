--liquibase formatted sql

--changeset initial_schema:1
-- 1. Таблица пользователей
CREATE TABLE user_data (
       id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
       login         VARCHAR(255) NOT NULL UNIQUE,
       password_hash VARCHAR(255) NOT NULL,
       second_name   VARCHAR(255),
       first_name    VARCHAR(255),
       avatar_url    VARCHAR(500),
       created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
       updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE category (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name        VARCHAR(255) NOT NULL,
      user_id     UUID NOT NULL REFERENCES user_data(id),
      created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(name, user_id)
);

create table invite_token (
    id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token    VARCHAR(255) NOT NULL,
    expires_at     TIMESTAMP NOT NULL,
    created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. События
CREATE TABLE event (
       id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
       title                   VARCHAR(255) NOT NULL,
       description             VARCHAR(1000),
       start_date              TIMESTAMP NOT NULL,
       end_date                TIMESTAMP NOT NULL,
       image_key               VARCHAR(255),
       owner_id                UUID NOT NULL REFERENCES user_data(id) ON DELETE CASCADE,
       invite_token_id         UUID NOT NULL REFERENCES invite_token(id),
       created_at              TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
       updated_at              TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE event_user (
       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
       event_id UUID NOT NULL REFERENCES event(id) ON DELETE CASCADE,
       user_id UUID NOT NULL REFERENCES user_data(id) ON DELETE CASCADE,
       role VARCHAR(30) NOT NULL,
       joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       UNIQUE(event_id, user_id)
);

create table category_event(
    id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id  UUID NOT NULL REFERENCES event(id),
    category_id UUID NOT NULL REFERENCES category(id),
    UNIQUE (event_id, category_id)
);

CREATE TABLE event_invitation (
      id UUID PRIMARY KEY,
      event_id UUID NOT NULL REFERENCES event(id),
      user_id UUID NOT NULL  REFERENCES user_data(id),
      invited_by UUID NOT NULL,
      status VARCHAR(50) NOT NULL,
      created_at TIMESTAMP NOT NULL,
      updated_at TIMESTAMP NOT NULL
);

CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token_hash VARCHAR(255) NOT NULL,
    user_id UUID NOT NULL REFERENCES user_data(id),
    expiry_date TIMESTAMP NOT NULL,
    revoked BOOLEAN NOT NULL DEFAULT FALSE
);
