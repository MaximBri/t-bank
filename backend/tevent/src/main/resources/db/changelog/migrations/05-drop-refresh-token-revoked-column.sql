--liquibase formatted sql

--changeset refresh_tokens:1-drop-revoked-column
ALTER TABLE refresh_tokens
    DROP COLUMN IF EXISTS revoked;
