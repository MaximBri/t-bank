--liquibase formatted sql

--changeset andrej:02-user-full-name-nullable

ALTER TABLE "user" ALTER COLUMN full_name DROP NOT NULL;

--rollback ALTER TABLE "user" ALTER COLUMN full_name SET NOT NULL;