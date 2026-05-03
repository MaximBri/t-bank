--liquibase formatted sql

--changeset andrej:08-expense-add-reason-conflict-column
ALTER TABLE expense ADD COLUMN reason_conflict VARCHAR(255);

--rollback ALTER TABLE expense DROP COLUMN IF EXISTS reason_conflict;
