--liquibase formatted sql

--changeset category:1-event-driven-cleanup
WITH duplicate_links AS (
    SELECT c.id AS duplicate_id, keeper.keeper_id
    FROM category c
             JOIN (
        SELECT name, MIN(id::text)::uuid AS keeper_id
        FROM category
        GROUP BY name
    ) keeper ON keeper.name = c.name
    WHERE c.id <> keeper.keeper_id
)
DELETE
FROM category_event ce_duplicate
USING duplicate_links d, category_event ce_keeper
WHERE ce_duplicate.category_id = d.duplicate_id
  AND ce_keeper.event_id = ce_duplicate.event_id
  AND ce_keeper.category_id = d.keeper_id;

WITH duplicate_links AS (
    SELECT c.id AS duplicate_id, keeper.keeper_id
    FROM category c
             JOIN (
        SELECT name, MIN(id::text)::uuid AS keeper_id
        FROM category
        GROUP BY name
    ) keeper ON keeper.name = c.name
    WHERE c.id <> keeper.keeper_id
)


UPDATE category_event ce
SET category_id = d.keeper_id
FROM duplicate_links d
WHERE ce.category_id = d.duplicate_id;

WITH duplicate_links AS (
    SELECT c.id AS duplicate_id, keeper.keeper_id
    FROM category c
             JOIN (
        SELECT name, MIN(id::text)::uuid AS keeper_id
        FROM category
        GROUP BY name
    ) keeper ON keeper.name = c.name
    WHERE c.id <> keeper.keeper_id
)
DELETE
FROM expense_category ec_duplicate
USING duplicate_links d, expense_category ec_keeper
WHERE ec_duplicate.category_id = d.duplicate_id
  AND ec_keeper.expense_id = ec_duplicate.expense_id
  AND ec_keeper.category_id = d.keeper_id;

WITH duplicate_links AS (
    SELECT c.id AS duplicate_id, keeper.keeper_id
    FROM category c
             JOIN (
        SELECT name, MIN(id::text)::uuid AS keeper_id
        FROM category
        GROUP BY name
    ) keeper ON keeper.name = c.name
    WHERE c.id <> keeper.keeper_id
)
UPDATE expense_category ec
SET category_id = d.keeper_id
FROM duplicate_links d
WHERE ec.category_id = d.duplicate_id;

WITH duplicate_links AS (
    SELECT c.id AS duplicate_id, keeper.keeper_id
    FROM category c
             JOIN (
        SELECT name, MIN(id::text)::uuid AS keeper_id
        FROM category
        GROUP BY name
    ) keeper ON keeper.name = c.name
    WHERE c.id <> keeper.keeper_id
)
DELETE
FROM category c
    USING duplicate_links d
WHERE c.id = d.duplicate_id;

ALTER TABLE category DROP COLUMN IF EXISTS user_id;
ALTER TABLE category DROP CONSTRAINT IF EXISTS category_name_user_id_key;
ALTER TABLE category DROP CONSTRAINT IF EXISTS category_name_key;
ALTER TABLE category ADD CONSTRAINT category_name_key UNIQUE (name);
