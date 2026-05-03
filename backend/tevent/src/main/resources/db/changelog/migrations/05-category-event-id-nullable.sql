--liquibase formatted sql

--changeset andrej:05-category-event-id-nullable
ALTER TABLE category ALTER COLUMN event_id DROP NOT NULL;
--rollback ALTER TABLE category ALTER COLUMN event_id SET NOT NULL;