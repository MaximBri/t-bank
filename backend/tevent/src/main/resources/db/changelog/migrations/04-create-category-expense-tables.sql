--liquibase formatted sql

--changeset andrej:04-create-category-expense-tables
CREATE TABLE IF NOT EXISTS category (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    event_id UUID NOT NULL REFERENCES event(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_category_event_name UNIQUE (event_id, name)
);

CREATE TABLE IF NOT EXISTS expense (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES category(id) ON DELETE RESTRICT,
    event_id UUID NOT NULL REFERENCES event(id) ON DELETE CASCADE,
    paid_by UUID NOT NULL REFERENCES user_data(id) ON DELETE RESTRICT,
    amount NUMERIC(10, 2) NOT NULL,
    comment VARCHAR(255),
    check_url VARCHAR(500) UNIQUE,
    is_confirmed BOOLEAN NOT NULL DEFAULT FALSE,
    expense_date TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS expense_participant (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_data(id) ON DELETE CASCADE,
    expense_id UUID NOT NULL REFERENCES expense(id) ON DELETE CASCADE,
    CONSTRAINT uq_expense_participant_user_expense UNIQUE (user_id, expense_id)
);

CREATE INDEX IF NOT EXISTS idx_category_event_id ON category(event_id);
CREATE INDEX IF NOT EXISTS idx_expense_event_id ON expense(event_id);
CREATE INDEX IF NOT EXISTS idx_expense_category_id ON expense(category_id);
CREATE INDEX IF NOT EXISTS idx_expense_paid_by ON expense(paid_by);
CREATE INDEX IF NOT EXISTS idx_expense_participant_expense_id ON expense_participant(expense_id);

--rollback DROP INDEX IF EXISTS idx_expense_participant_expense_id;
--rollback DROP INDEX IF EXISTS idx_expense_paid_by;
--rollback DROP INDEX IF EXISTS idx_expense_category_id;
--rollback DROP INDEX IF EXISTS idx_expense_event_id;
--rollback DROP INDEX IF EXISTS idx_category_event_id;
--rollback DROP TABLE IF EXISTS expense_participant;
--rollback DROP TABLE IF EXISTS expense;
--rollback DROP TABLE IF EXISTS category;
