--liquibase formatted sql

--changeset add_history_name_columns:1
ALTER TABLE event_history
ADD COLUMN first_name VARCHAR(500) NOT NULL DEFAULT '',
ADD COLUMN second_name VARCHAR(500) NOT NULL DEFAULT '';

--changeset update_existing_history_records:2
-- Update existing records with empty strings (since we can't fetch historical user data)
-- This is safe because the application will populate these fields for new records
-- Note: If you have existing data and need to backfill, you would need a more complex migration
-- For now, we'll leave them as empty strings