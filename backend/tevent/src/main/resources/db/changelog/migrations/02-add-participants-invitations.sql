--liquibase formatted sql

--changeset add_participants_invitations:1
-- ======================================================
-- Add columns to event_user table
-- ======================================================
ALTER TABLE event_user
ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'PARTICIPANT',
ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'ACCEPTED',
ADD COLUMN invited_at TIMESTAMP;

-- ======================================================
-- Add columns to event table for invite link
-- ======================================================
ALTER TABLE event
ADD COLUMN invite_token VARCHAR(64) UNIQUE,
ADD COLUMN invite_token_created_at TIMESTAMP,
ADD COLUMN invite_token_expires_at TIMESTAMP;

-- ======================================================
-- Create event_invitation table
-- ======================================================
CREATE TABLE event_invitation (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES event(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES user_data(id) ON DELETE CASCADE,
    invited_by UUID NOT NULL REFERENCES user_data(id) ON DELETE CASCADE,
    status VARCHAR(30) NOT NULL CHECK (status IN ('PENDING_APPROVAL', 'INVITED', 'ACCEPTED', 'DECLINED', 'REJECTED')),
    token VARCHAR(64),
    expires_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(event_id, user_id)
);

CREATE INDEX idx_event_invitation_event_id ON event_invitation(event_id);
CREATE INDEX idx_event_invitation_user_id ON event_invitation(user_id);

-- ======================================================
-- Update existing event_user rows to set role based on owner_id
-- ======================================================
UPDATE event_user eu
SET role = 'OWNER'
FROM event e
WHERE eu.event_id = e.id AND eu.user_id = e.owner_id;

-- ======================================================
-- Set invited_at for existing participants (use joined_at as approximation)
-- ======================================================
UPDATE event_user SET invited_at = joined_at WHERE invited_at IS NULL;