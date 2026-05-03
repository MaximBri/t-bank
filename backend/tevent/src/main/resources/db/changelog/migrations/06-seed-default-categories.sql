--liquibase formatted sql

--changeset andrej:06-seed-default-categories
INSERT INTO category (id, name, event_id, created_at)
SELECT '11111111-1111-1111-1111-111111111111'::uuid, 'Еда', NULL, NOW()
WHERE NOT EXISTS (SELECT 1 FROM category WHERE id = '11111111-1111-1111-1111-111111111111'::uuid);

INSERT INTO category (id, name, event_id, created_at)
SELECT '22222222-2222-2222-2222-222222222222'::uuid, 'Транспорт', NULL, NOW()
WHERE NOT EXISTS (SELECT 1 FROM category WHERE id = '22222222-2222-2222-2222-222222222222'::uuid);

INSERT INTO category (id, name, event_id, created_at)
SELECT '33333333-3333-3333-3333-333333333333'::uuid, 'Проживание', NULL, NOW()
WHERE NOT EXISTS (SELECT 1 FROM category WHERE id = '33333333-3333-3333-3333-333333333333'::uuid);
--rollback DELETE FROM category WHERE id IN (
--rollback   '11111111-1111-1111-1111-111111111111',
--rollback   '22222222-2222-2222-2222-222222222222',
--rollback   '33333333-3333-3333-3333-333333333333'
--rollback );