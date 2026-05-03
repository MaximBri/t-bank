--liquibase formatted sql

--changeset andrej:07-expense-add_status_column_and_remove_is_confirmed_column
ALTER TABLE expense ADD COLUMN status VARCHAR(20);
UPDATE expense SET status = 'PENDING' WHERE status IS NULL;
ALTER TABLE expense ALTER COLUMN status SET NOT NULL;
ALTER TABLE expense ALTER COLUMN status SET DEFAULT 'PENDING';

UPDATE expense SET status = 'CONFIRMED' WHERE is_confirmed = TRUE;

ALTER TABLE expense ADD CONSTRAINT expense_status_check
CHECK (status IN ('PENDING', 'CONFIRMED', 'DISPUTED'));

ALTER TABLE expense DROP COLUMN is_confirmed;

CREATE INDEX idx_expense_status ON expense(status);

--rollback DROP INDEX IF EXISTS idx_expense_status;
--rollback ALTER TABLE expense DROP CONSTRAINT IF EXISTS expense_status_check;
--rollback ALTER TABLE expense ADD COLUMN is_confirmed BOOLEAN DEFAULT FALSE;
--rollback UPDATE expense SET is_confirmed = CASE WHEN status = 'CONFIRMED' THEN TRUE ELSE FALSE END;
--rollback ALTER TABLE expense ALTER COLUMN is_confirmed SET NOT NULL;
--rollback ALTER TABLE expense DROP COLUMN status;
