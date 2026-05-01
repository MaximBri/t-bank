--liquibase formatted sql

--changeset andrej:05-user-split-full-name
ALTER TABLE "user" ADD COLUMN first_name VARCHAR(255);
ALTER TABLE "user" ADD COLUMN second_name VARCHAR(255);

UPDATE "user"
SET
  first_name = CASE
    WHEN full_name IS NULL OR btrim(full_name) = '' THEN NULL
    ELSE split_part(btrim(full_name), ' ', 1)
  END,
  second_name = CASE
    WHEN full_name IS NULL OR btrim(full_name) = '' THEN NULL
    WHEN position(' ' in btrim(full_name)) = 0 THEN NULL
    ELSE nullif(substring(btrim(full_name) from position(' ' in btrim(full_name)) + 1), '')
  END;

ALTER TABLE "user" DROP COLUMN full_name;

--rollback ALTER TABLE "user" ADD COLUMN full_name VARCHAR(255);
--rollback UPDATE "user" SET full_name = nullif(concat_ws(' ', first_name, second_name), '');
--rollback ALTER TABLE "user" DROP COLUMN first_name;
--rollback ALTER TABLE "user" DROP COLUMN second_name;
