--liquibase formatted sql

--changeset initial_schema:1
-- ======================================================
-- Таблица пользователей
-- ======================================================
CREATE TABLE user_data (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    login         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    last_name     VARCHAR(255) NOT NULL,
    first_name    VARCHAR(255) NOT NULL,
    created_at    TIMESTAMP    NOT NULL,
    updated_at    TIMESTAMP    NOT NULL
);


CREATE TABLE refresh_tokens (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token_hash  VARCHAR(255) NOT NULL,
    user_id     UUID NOT NULL,
    expiry_date TIMESTAMP NOT NULL,
    revoked     BOOLEAN NOT NULL DEFAULT FALSE,

    CONSTRAINT fk_user
        FOREIGN KEY(user_id)
            REFERENCES user_data(id)
            ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS event (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description VARCHAR(1000),
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    category VARCHAR(255) NOT NULL,
    image_key VARCHAR(255),
    owner_id UUID NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    CONSTRAINT fk_event_owner FOREIGN KEY(owner_id) REFERENCES user_data(id) ON DELETE CASCADE
    );

CREATE TABLE IF NOT EXISTS event_user (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL,
    user_id UUID NOT NULL,
    joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_event_user_event FOREIGN KEY (event_id) REFERENCES event(id) ON DELETE CASCADE,
    CONSTRAINT fk_event_user_user FOREIGN KEY (user_id) REFERENCES user_data(id) ON DELETE CASCADE,
    CONSTRAINT uq_event_user UNIQUE (event_id, user_id)
);

CREATE TABLE IF NOT EXISTS expense (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    category VARCHAR(50) NOT NULL,
    approval_status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    payer_id UUID NOT NULL,
    image_key VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_expense_event FOREIGN KEY (event_id) REFERENCES event(id) ON DELETE CASCADE,
    CONSTRAINT fk_expense_payer FOREIGN KEY (payer_id) REFERENCES user_data(id) ON DELETE CASCADE
    );

CREATE TABLE IF NOT EXISTS expense_participant (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    expense_id UUID NOT NULL,
    user_id UUID NOT NULL,
    share_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
    CONSTRAINT fk_expense_part_expense FOREIGN KEY (expense_id) REFERENCES expense(id) ON DELETE CASCADE,
    CONSTRAINT fk_expense_part_user FOREIGN KEY (user_id) REFERENCES user_data(id) ON DELETE CASCADE,
    CONSTRAINT uq_expense_participant UNIQUE (expense_id, user_id)
    );

CREATE TABLE IF NOT EXISTS settlement (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL,
    from_user_id UUID NOT NULL,
    to_user_id UUID NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    CONSTRAINT fk_settlement_event FOREIGN KEY (event_id) REFERENCES event(id) ON DELETE CASCADE,
    CONSTRAINT fk_settlement_from FOREIGN KEY (from_user_id) REFERENCES user_data(id) ON DELETE CASCADE,
    CONSTRAINT fk_settlement_to FOREIGN KEY (to_user_id) REFERENCES user_data(id) ON DELETE CASCADE
);




-- CREATE TABLE event (
--    id            UUID PRIMARY KEY,
--    owner_id      UUID         NOT NULL REFERENCES "user"(id),
--    name          VARCHAR(255) NOT NULL,
--    cover_url     VARCHAR(500) UNIQUE,
--    start_date    TIMESTAMP    NOT NULL,
--    end_date      TIMESTAMP    NOT NULL,
--    currency_code VARCHAR(3)   NOT NULL,  -- например, 'USD', 'EUR', 'RUB'
--    description   TEXT,
--    status        VARCHAR(20)  NOT NULL CHECK (status IN ('ACTIVE', 'PLANNED', 'COMPLETED')),
--    created_at    TIMESTAMP    NOT NULL,
--    updated_at    TIMESTAMP    NOT NULL,
--    version       INTEGER      NOT NULL DEFAULT 0
-- );
--
-- -- ======================================================
-- -- Категории расходов внутри события
-- -- ======================================================
-- CREATE TABLE category (
--       id         UUID PRIMARY KEY,
--       name       VARCHAR(255) NOT NULL,
--       event_id   UUID         NOT NULL REFERENCES event(id) ON DELETE CASCADE,
--       created_at TIMESTAMP    NOT NULL,
--       UNIQUE (event_id, name)  -- в рамках одного события название категории уникально
-- );
--
-- -- ======================================================
-- -- Участники события (многие ко многим)
-- -- ======================================================
-- CREATE TABLE event_participant (
--                id                   UUID PRIMARY KEY,
--                event_id             UUID        NOT NULL REFERENCES event(id) ON DELETE CASCADE,
--                user_id              UUID        NOT NULL REFERENCES "user"(id),
--                role                 VARCHAR(20) NOT NULL DEFAULT 'MEMBER' CHECK (role IN ('OWNER', 'ADMIN', 'MEMBER')),
--                participation_status VARCHAR(20) NOT NULL CHECK (participation_status IN ('ACTIVE', 'REMOVED', 'LEFT')),
--                invitation_token     VARCHAR(255),
--                invited_at           TIMESTAMP,
--                joined_date          TIMESTAMP   NOT NULL,
--                created_at           TIMESTAMP   NOT NULL,
--                version              INTEGER     NOT NULL DEFAULT 0,
--                UNIQUE (event_id, user_id)
-- );
--
-- -- ======================================================
-- -- Приглашения (токены для входа в событие)
-- -- ======================================================
-- CREATE TABLE invitation (
--     id         UUID PRIMARY KEY,
--     event_id   UUID        NOT NULL REFERENCES event(id) ON DELETE CASCADE,
--     token      VARCHAR(255) NOT NULL UNIQUE,
--     is_active  BOOLEAN     NOT NULL,
--     expires_at TIMESTAMP   NOT NULL,
--     created_at TIMESTAMP   NOT NULL
-- );
--
-- -- ======================================================
-- -- Расходы (траты)
-- -- ======================================================
-- CREATE TABLE expense (
--          id           UUID PRIMARY KEY,
--          category_id  UUID           NOT NULL REFERENCES category(id),
--          event_id     UUID           NOT NULL REFERENCES event(id) ON DELETE CASCADE,
--          paid_by      UUID           NOT NULL REFERENCES "user"(id),
--          amount       DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
--          comment      TEXT,
--          check_url    VARCHAR(500) UNIQUE,
--          is_confirmed BOOLEAN        NOT NULL DEFAULT FALSE,
--          expense_date TIMESTAMP      NOT NULL,
--          participant_ids JSONB,  -- JSON array of participant IDs for expense splitting
--          created_at   TIMESTAMP      NOT NULL,
--          updated_at   TIMESTAMP      NOT NULL,
--          version      INTEGER        NOT NULL DEFAULT 0
-- );
--
-- -- ======================================================
-- -- Связь расхода с участниками, на которых делится трата
-- -- ======================================================
-- CREATE TABLE expense_participant (
--          id         UUID PRIMARY KEY,
--          user_id    UUID NOT NULL REFERENCES "user"(id),
--          expense_id UUID NOT NULL REFERENCES expense(id) ON DELETE CASCADE,
--          UNIQUE (user_id, expense_id)
-- );
--
-- -- ======================================================
-- -- Снимок баланса (долги между участниками)
-- -- ======================================================
-- CREATE TABLE balance_snapshot (
--       id          UUID           PRIMARY KEY,
--       event_id    UUID           NOT NULL REFERENCES event(id) ON DELETE CASCADE,
--       debtor_id   UUID           NOT NULL REFERENCES "user"(id),
--       creditor_id UUID           NOT NULL REFERENCES "user"(id),
--       amount      DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
--       created_at  TIMESTAMP      NOT NULL,
--       version     INTEGER        NOT NULL DEFAULT 0,
--       CHECK (debtor_id <> creditor_id)  -- нельзя быть должником самому себе
-- );
--
-- -- ======================================================
-- -- Оптимизированные взаиморасчеты (результат работы Minimizer)
-- -- ======================================================
-- CREATE TABLE settlement (
--     id           UUID PRIMARY KEY,
--     event_id     UUID           NOT NULL REFERENCES event(id) ON DELETE CASCADE,
--     debtor_id    UUID           NOT NULL REFERENCES "user"(id),
--     creditor_id  UUID           NOT NULL REFERENCES "user"(id),
--     amount       DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
--     status       VARCHAR(20)    NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'COMPLETED', 'CANCELLED')),
--     calculated_at TIMESTAMP     NOT NULL,
--     completed_at  TIMESTAMP,
--     created_at   TIMESTAMP      NOT NULL,
--     updated_at   TIMESTAMP      NOT NULL,
--     version      INTEGER        NOT NULL DEFAULT 0,
--     CHECK (debtor_id <> creditor_id)
-- );
--
-- -- ======================================================
-- -- Уведомления пользователей
-- -- ======================================================
-- CREATE TABLE notification (
--     id          UUID PRIMARY KEY,
--     user_id     UUID        NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
--     title       VARCHAR(255) NOT NULL,
--     message     TEXT         NOT NULL,
--     type        VARCHAR(50)  NOT NULL CHECK (type IN ('INFO', 'WARNING', 'ERROR', 'INVITATION', 'EXPENSE', 'SETTLEMENT', 'SYSTEM')),
--     is_read     BOOLEAN      NOT NULL DEFAULT FALSE,
--     read_at     TIMESTAMP,
--     expires_at  TIMESTAMP    NOT NULL,  -- Когда уведомление должно быть очищено
--     metadata    JSONB,
--     created_at  TIMESTAMP    NOT NULL,
--     updated_at  TIMESTAMP    NOT NULL,
--     version     INTEGER      NOT NULL DEFAULT 0
-- );
--
-- -- ======================================================
-- -- История действий по событию (аудит)
-- -- ======================================================
-- CREATE TABLE event_history (
--        id         UUID PRIMARY KEY,
--        event_id   UUID      NOT NULL REFERENCES event(id) ON DELETE CASCADE,
--        user_id    UUID      NOT NULL REFERENCES "user"(id),
--        type       VARCHAR(50) NOT NULL CHECK (type IN (
--                                                        'EVENT_CREATED', 'EVENT_COMPLETED', 'INVITATION_CREATED',
--                                                        'USER_JOINED', 'USER_LEFT', 'USER_REMOVED',
--                                                        'EXPENSE_CREATED', 'EXPENSE_UPDATED', 'EXPENSE_DELETED',
--                                                        'SETTLEMENT_CALCULATED', 'SETTLEMENT_COMPLETED'
--            )),
--        detail     TEXT,
--        created_at TIMESTAMP NOT NULL
-- );
--
-- -- ======================================================
-- -- Файлы экспорта (отчёты)
-- -- ======================================================
-- CREATE TABLE export_file (
--          id         UUID PRIMARY KEY,
--          event_id   UUID        NOT NULL REFERENCES event(id) ON DELETE CASCADE,
--          created_by UUID        NOT NULL REFERENCES "user"(id),
--          file_type  VARCHAR(3)  NOT NULL CHECK (file_type = 'CSV'),
--          file_url   VARCHAR(500) NOT NULL,
--          created_at TIMESTAMP   NOT NULL
-- );
--
-- -- ======================================================
-- -- Таблицы Jobrunr (создаются автоматически, здесь для справки)
-- -- ======================================================
-- -- Jobrunr создает следующие таблицы автоматически:
-- -- jobrunr_jobs
-- -- jobrunr_recurring_jobs
-- -- jobrunr_backgroundjobservers
-- -- jobrunr_metadata
-- -- Эти таблицы не нужно создавать вручную
--
-- -- ======================================================
-- -- Индексы для ускорения запросов
-- -- ======================================================
-- -- Основные индексы
-- CREATE INDEX idx_event_owner ON event(owner_id);
-- CREATE INDEX idx_category_event ON category(event_id);
-- CREATE INDEX idx_event_participant_event ON event_participant(event_id);
-- CREATE INDEX idx_event_participant_user ON event_participant(user_id);
-- CREATE INDEX idx_invitation_event ON invitation(event_id);
-- CREATE INDEX idx_expense_event ON expense(event_id);
-- CREATE INDEX idx_expense_paid_by ON expense(paid_by);
-- CREATE INDEX idx_expense_participant_expense ON expense_participant(expense_id);
-- CREATE INDEX idx_balance_snapshot_event ON balance_snapshot(event_id);
-- CREATE INDEX idx_event_history_event ON event_history(event_id);
-- CREATE INDEX idx_export_file_event ON export_file(event_id);
--
-- -- Индексы для новых таблиц
-- CREATE INDEX idx_settlement_event ON settlement(event_id);
-- CREATE INDEX idx_settlement_debtor ON settlement(debtor_id);
-- CREATE INDEX idx_settlement_creditor ON settlement(creditor_id);
-- CREATE INDEX idx_settlement_status ON settlement(status) WHERE status = 'PENDING';
--
-- CREATE INDEX idx_notification_user ON notification(user_id);
-- CREATE INDEX idx_notification_expires_at ON notification(expires_at) WHERE is_read = TRUE;
-- CREATE INDEX idx_notification_user_unread ON notification(user_id) WHERE is_read = FALSE;
-- CREATE INDEX idx_notification_created_at ON notification(created_at DESC);
--
-- -- Индексы для курсорной пагинации
-- CREATE INDEX idx_event_owner_cursor ON event(owner_id, created_at DESC, id DESC);
-- CREATE INDEX idx_notification_user_cursor ON notification(user_id, created_at DESC, id DESC);
-- CREATE INDEX idx_expense_event_cursor ON expense(event_id, expense_date DESC, id DESC);
-- CREATE INDEX idx_settlement_event_cursor ON settlement(event_id, calculated_at DESC, id DESC);
--
-- -- Индексы для оптимистичной блокировки (версии)
-- CREATE INDEX idx_user_version ON "user"(version) WHERE version > 0;
-- CREATE INDEX idx_event_version ON event(version) WHERE version > 0;
-- CREATE INDEX idx_expense_version ON expense(version) WHERE version > 0;
-- CREATE INDEX idx_event_participant_version ON event_participant(version) WHERE version > 0;
-- CREATE INDEX idx_balance_snapshot_version ON balance_snapshot(version) WHERE version > 0;
-- CREATE INDEX idx_settlement_version ON settlement(version) WHERE version > 0;
-- CREATE INDEX idx_notification_version ON notification(version) WHERE version > 0;
--
-- -- ======================================================
-- -- Представления для удобства
-- -- ======================================================
-- -- Представление для непрочитанных уведомлений
-- CREATE VIEW v_unread_notifications AS
-- SELECT n.*, u.login as user_login
-- FROM notification n
-- JOIN "user" u ON n.user_id = u.id
-- WHERE n.is_read = FALSE
-- ORDER BY n.created_at DESC;
--
-- -- Представление для активных событий
-- CREATE VIEW v_active_events AS
-- SELECT e.*, u.login as owner_login
-- FROM event e
-- JOIN "user" u ON e.owner_id = u.id
-- WHERE e.status = 'ACTIVE'
-- ORDER BY e.start_date;
--
-- -- Представление для ожидающих взаиморасчетов
-- CREATE VIEW v_pending_settlements AS
-- SELECT s.*,
--        debtor.login as debtor_login,
--        creditor.login as creditor_login,
--        e.name as event_name
-- FROM settlement s
-- JOIN "user" debtor ON s.debtor_id = debtor.id
-- JOIN "user" creditor ON s.creditor_id = creditor.id
-- JOIN event e ON s.event_id = e.id
-- WHERE s.status = 'PENDING'
-- ORDER BY s.calculated_at DESC;
--
-- -- ======================================================
-- -- Комментарии к таблицам
-- -- ======================================================
-- COMMENT ON TABLE "user" IS 'Пользователи системы';
-- COMMENT ON TABLE event IS 'События (мероприятия)';
-- COMMENT ON TABLE category IS 'Категории расходов внутри события';
-- COMMENT ON TABLE event_participant IS 'Участники событий';
-- COMMENT ON TABLE invitation IS 'Приглашения для входа в события';
-- COMMENT ON TABLE expense IS 'Расходы (траты) участников';
-- COMMENT ON TABLE expense_participant IS 'Связь расходов с участниками';
-- COMMENT ON TABLE balance_snapshot IS 'Снимки балансов (долги между участниками)';
-- COMMENT ON TABLE settlement IS 'Оптимизированные взаиморасчеты (результат работы Minimizer)';
-- COMMENT ON TABLE notification IS 'Уведомления пользователей (очищаются Jobrunr)';
-- COMMENT ON TABLE event_history IS 'История действий по событиям';
-- COMMENT ON TABLE export_file IS 'Файлы экспорта отчетов';
--
-- COMMENT ON COLUMN event_participant.role IS 'Роль участника: OWNER, ADMIN, MEMBER';
-- COMMENT ON COLUMN event_participant.invitation_token IS 'Токен приглашения (если участник был приглашен)';
-- COMMENT ON COLUMN expense.participant_ids IS 'JSON массив ID участников, между которыми делится расход';
-- COMMENT ON COLUMN notification.expires_at IS 'Время, после которого уведомление может быть очищено Jobrunr';
-- COMMENT ON COLUMN settlement.calculated_at IS 'Время расчета взаиморасчета Minimizer';
-- COMMENT ON COLUMN settlement.completed_at IS 'Время завершения взаиморасчета (когда долг погашен)';