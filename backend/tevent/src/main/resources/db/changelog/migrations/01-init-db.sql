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
       version                 BIGINT NOT NULL DEFAULT 0,
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
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      event_id UUID NOT NULL REFERENCES event(id),
      user_id UUID NOT NULL  REFERENCES user_data(id),
      invited_by UUID NOT NULL REFERENCES user_data(id),
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

-- 2. Таблица расходов с поддержкой состояний и версионирования
CREATE TABLE expense (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     event_id UUID NOT NULL REFERENCES event(id) ON DELETE CASCADE,
     payer_id UUID NOT NULL REFERENCES user_data(id),
     amount DECIMAL(19, 2) NOT NULL,
     title VARCHAR(255),
     image_url VARCHAR(255),
     description VARCHAR(255),
     status VARCHAR(30) NOT NULL DEFAULT 'PLANNED', -- PLANNED, PENDING, REJECTED, CONFIRMED, LOCKED
     version BIGINT NOT NULL DEFAULT 0, -- Optimistic Lock
     created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
     updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE expense_category (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      expense_id UUID NOT NULL REFERENCES expense(id) ON DELETE CASCADE,
      category_id UUID NOT NULL REFERENCES category(id),
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(expense_id, category_id)
);

-- 3. Детализация (сплит) расхода
CREATE TABLE expense_split (
       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
       expense_id UUID NOT NULL REFERENCES expense(id) ON DELETE CASCADE,
       user_id UUID NOT NULL REFERENCES user_data(id),
       amount DECIMAL(19, 2) NOT NULL,
       is_confirmed BOOLEAN DEFAULT FALSE 
);

-- 4. Платежи (взаиморасчеты)
CREATE TABLE payment (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     event_id UUID NOT NULL REFERENCES event(id) ON DELETE CASCADE,
     from_user_id UUID NOT NULL REFERENCES user_data(id),
     to_user_id UUID NOT NULL REFERENCES user_data(id),
     amount DECIMAL(19, 2) NOT NULL,
     status VARCHAR(30) NOT NULL, -- INITIATED, SENT, FAILED, COMPLETED
     expires_at TIMESTAMP NOT NULL, -- Для TTL логики
     created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
     confirmed_at TIMESTAMP
);

CREATE TABLE user_notification (
       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
       user_id UUID NOT NULL REFERENCES user_data(id) ON DELETE CASCADE,
       event_id UUID NOT NULL REFERENCES event(id) ON DELETE CASCADE,
       expense_id UUID REFERENCES expense(id) ON DELETE SET NULL,
       title VARCHAR(255) NOT NULL,
       message TEXT NOT NULL,
       is_read BOOLEAN DEFAULT FALSE,
       created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
