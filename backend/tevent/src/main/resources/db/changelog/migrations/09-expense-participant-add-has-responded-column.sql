--liquibase formatted sql

--changeset andrej:09-expense-participant-add-has-responded-column
ALTER TABLE expense_participant ADD COLUMN has_responded BOOLEAN;
ALTER TABLE expense_participant ALTER COLUMN has_responded SET DEFAULT false;
UPDATE expense_participant SET has_responded = false WHERE has_responded IS NULL;
ALTER TABLE expense_participant ALTER COLUMN has_responded SET NOT NULL;

--rollback ALTER TABLE expense_participant DROP COLUMN IF EXISTS has_responded;
