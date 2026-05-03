--liquibase formatted sql

--changeset initial_schema:1
-- ======================================================
-- Таблица пользователей
-- ======================================================
CREATE TABLE user_data (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    login         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    second_name     VARCHAR(255) NOT NULL,
    first_name    VARCHAR(255) NOT NULL,
    created_at    TIMESTAMP    NOT NULL,
    updated_at    TIMESTAMP    NOT NULL,
    avatar_url    VARCHAR(255)
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
