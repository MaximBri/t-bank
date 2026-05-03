--liquibase formatted sql

--changeset andrej:03-user-avatar-and-optional-names
ALTER TABLE user_data ALTER COLUMN first_name DROP NOT NULL;
ALTER TABLE user_data ALTER COLUMN last_name DROP NOT NULL;
ALTER TABLE user_data ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500);

--rollback ALTER TABLE user_data DROP COLUMN IF EXISTS avatar_url;
--rollback ALTER TABLE user_data ALTER COLUMN first_name SET NOT NULL;
--rollback ALTER TABLE user_data ALTER COLUMN last_name SET NOT NULL;
