--liquibase formatted sql

--changeset add_payment_expires_at_column:1
-- Add expires_at column to payment table
ALTER TABLE payment ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP + INTERVAL '7 days';