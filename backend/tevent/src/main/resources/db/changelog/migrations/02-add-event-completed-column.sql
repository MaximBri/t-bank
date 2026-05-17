--liquibase formatted sql

--changeset add_event_completed_column:1
-- Add is_completed column to event table
ALTER TABLE event ADD COLUMN IF NOT EXISTS is_completed BOOLEAN DEFAULT FALSE;