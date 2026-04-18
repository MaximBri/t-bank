--liquibase formatted sql

--changeset initial_schema:1
-- ======================================================
-- Таблица пользователей
-- ======================================================
CREATE TABLE "user" (
    id            UUID PRIMARY KEY,
    login         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name     VARCHAR(255) NOT NULL,
    avatar_url    VARCHAR(500) UNIQUE,
    created_at    TIMESTAMP    NOT NULL,
    updated_at    TIMESTAMP    NOT NULL
);

-- ======================================================
-- Таблица событий (мероприятий)
-- ======================================================
CREATE TABLE event (
   id            UUID PRIMARY KEY,
   owner_id      UUID         NOT NULL REFERENCES "user"(id),
   name          VARCHAR(255) NOT NULL,
   cover_url     VARCHAR(500) UNIQUE,
   start_date    TIMESTAMP    NOT NULL,
   end_date      TIMESTAMP    NOT NULL,
   currency_code VARCHAR(3)   NOT NULL,  -- например, 'USD', 'EUR', 'RUB'
   description   TEXT,
   status        VARCHAR(20)  NOT NULL CHECK (status IN ('ACTIVE', 'PLANNED', 'COMPLETED')),
   created_at    TIMESTAMP    NOT NULL,
   updated_at    TIMESTAMP    NOT NULL
);

-- ======================================================
-- Категории расходов внутри события
-- ======================================================
CREATE TABLE category (
      id         UUID PRIMARY KEY,
      name       VARCHAR(255) NOT NULL,
      event_id   UUID         NOT NULL REFERENCES event(id) ON DELETE CASCADE,
      created_at TIMESTAMP    NOT NULL,
      UNIQUE (event_id, name)  -- в рамках одного события название категории уникально
);

-- ======================================================
-- Участники события (многие ко многим)
-- ======================================================
CREATE TABLE event_participant (
               id                   UUID PRIMARY KEY,
               event_id             UUID        NOT NULL REFERENCES event(id) ON DELETE CASCADE,
               user_id              UUID        NOT NULL REFERENCES "user"(id),
               participation_status VARCHAR(20) NOT NULL CHECK (participation_status IN ('ACTIVE', 'REMOVED', 'LEFT')),
               joined_date          TIMESTAMP   NOT NULL,
               created_at           TIMESTAMP   NOT NULL,
               UNIQUE (event_id, user_id)
);

-- ======================================================
-- Приглашения (токены для входа в событие)
-- ======================================================
CREATE TABLE invitation (
    id         UUID PRIMARY KEY,
    event_id   UUID        NOT NULL REFERENCES event(id) ON DELETE CASCADE,
    token      VARCHAR(255) NOT NULL UNIQUE,
    is_active  BOOLEAN     NOT NULL,
    expires_at TIMESTAMP   NOT NULL,
    created_at TIMESTAMP   NOT NULL
);

-- ======================================================
-- Расходы (траты)
-- ======================================================
CREATE TABLE expense (
         id           UUID PRIMARY KEY,
         category_id  UUID           NOT NULL REFERENCES category(id),
         event_id     UUID           NOT NULL REFERENCES event(id) ON DELETE CASCADE,
         paid_by      UUID           NOT NULL REFERENCES "user"(id),
         amount       DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
         comment      TEXT,
         check_url    VARCHAR(500) UNIQUE,
         is_confirmed BOOLEAN        NOT NULL DEFAULT FALSE,
         expense_date TIMESTAMP      NOT NULL,
         created_at   TIMESTAMP      NOT NULL,
         updated_at   TIMESTAMP      NOT NULL
);

-- ======================================================
-- Связь расхода с участниками, на которых делится трата
-- ======================================================
CREATE TABLE expense_participant (
         id         UUID PRIMARY KEY,
         user_id    UUID NOT NULL REFERENCES "user"(id),
         expense_id UUID NOT NULL REFERENCES expense(id) ON DELETE CASCADE,
         UNIQUE (user_id, expense_id)
);

-- ======================================================
-- Снимок баланса (долги между участниками)
-- ======================================================
CREATE TABLE balance_snapshot (
      id          UUID           PRIMARY KEY,
      event_id    UUID           NOT NULL REFERENCES event(id) ON DELETE CASCADE,
      debtor_id   UUID           NOT NULL REFERENCES "user"(id),
      creditor_id UUID           NOT NULL REFERENCES "user"(id),
      amount      DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
      created_at  TIMESTAMP      NOT NULL,
      CHECK (debtor_id <> creditor_id)  -- нельзя быть должником самому себе
);

-- ======================================================
-- История действий по событию (аудит)
-- ======================================================
CREATE TABLE event_history (
       id         UUID PRIMARY KEY,
       event_id   UUID      NOT NULL REFERENCES event(id) ON DELETE CASCADE,
       user_id    UUID      NOT NULL REFERENCES "user"(id),
       type       VARCHAR(50) NOT NULL CHECK (type IN (
                                                       'EVENT_CREATED', 'EVENT_COMPLETED', 'INVITATION_CREATED',
                                                       'USER_JOINED', 'USER_LEFT', 'USER_REMOVED',
                                                       'EXPENSE_CREATED', 'EXPENSE_UPDATED', 'EXPENSE_DELETED'
           )),
       detail     TEXT,
       created_at TIMESTAMP NOT NULL
);

-- ======================================================
-- Файлы экспорта (отчёты)
-- ======================================================
CREATE TABLE export_file (
         id         UUID PRIMARY KEY,
         event_id   UUID        NOT NULL REFERENCES event(id) ON DELETE CASCADE,
         created_by UUID        NOT NULL REFERENCES "user"(id),
         file_type  VARCHAR(3)  NOT NULL CHECK (file_type = 'CSV'),
         file_url   VARCHAR(500) NOT NULL,
         created_at TIMESTAMP   NOT NULL
);

-- ======================================================
-- Индексы для ускорения запросов
-- ======================================================
CREATE INDEX idx_event_owner ON event(owner_id);
CREATE INDEX idx_category_event ON category(event_id);
CREATE INDEX idx_event_participant_event ON event_participant(event_id);
CREATE INDEX idx_event_participant_user ON event_participant(user_id);
CREATE INDEX idx_invitation_event ON invitation(event_id);
CREATE INDEX idx_expense_event ON expense(event_id);
CREATE INDEX idx_expense_paid_by ON expense(paid_by);
CREATE INDEX idx_expense_participant_expense ON expense_participant(expense_id);
CREATE INDEX idx_balance_snapshot_event ON balance_snapshot(event_id);
CREATE INDEX idx_event_history_event ON event_history(event_id);
CREATE INDEX idx_export_file_event ON export_file(event_id);