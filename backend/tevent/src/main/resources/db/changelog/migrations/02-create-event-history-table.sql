--liquibase formatted sql

--changeset create_event_history_table:1
CREATE TABLE IF NOT EXISTS event_history (
    id UUID PRIMARY KEY,
    event_id UUID NOT NULL REFERENCES event(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES user_data(id) ON DELETE CASCADE,
    action_type VARCHAR(50) NOT NULL,
    message VARCHAR(500) NOT NULL,
    created_at TIMESTAMP NOT NULL
);
