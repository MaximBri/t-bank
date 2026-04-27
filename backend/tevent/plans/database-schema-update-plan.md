# Database Schema Update Plan

## Current State Analysis

The existing database schema (`01-init-db.sql`) contains:
1. `user` table - basic user information
2. `event` table - event information
3. `category` table - expense categories per event
4. `event_participant` table - participants in events
5. `invitation` table - invitation tokens
6. `expense` table - expenses with categories
7. `expense_participant` table - many-to-many between expenses and participants
8. `balance_snapshot` table - debt records between users
9. `event_history` table - audit log
10. `export_file` table - exported reports

## Missing Components Based on Domain Models and Requirements

### 1. Notifications Table
Required for the NotificationController and NotificationService. Based on `NotificationService.NotificationDTO`:
- `id` (Integer)
- `title` (String)
- `message` (String)
- `type` (String) - notification type
- `isRead` (Boolean)
- `createdAt` (String/Timestamp)
- Additional fields needed:
  - `user_id` (UUID) - foreign key to user table
  - `expires_at` (TIMESTAMP) - for cleanup by Jobrunr
  - `read_at` (TIMESTAMP) - when notification was read
  - `metadata` (JSONB) - additional data

### 2. Missing Fields from Domain Models
Comparing domain models with existing schema:

**Event model has:**
- `categories` (List<EventCategory>) - already has category table
- `imageKey` (String) - corresponds to `cover_url` in schema
- `inviteToken` (String) - corresponds to invitation.token
- Missing: `currency_code` field (already exists in schema)

**Participant model has:**
- `role` (ParticipantRole) - missing in `event_participant` table
- `status` (ParticipantStatus) - exists as `participation_status`
- `invitationToken` (String) - missing
- `invitedAt` (LocalDateTime) - missing
- `joinedAt` (LocalDateTime) - exists as `joined_date`

**Expense model** (need to check):
- Should have `participantIds` field for expense splitting (from user requirement)

**Settlement model** (need to check):
- Should exist as separate table for calculated settlements

### 3. Jobrunr Tables
Jobrunr creates its own tables automatically when using SQL storage:
- `jobrunr_jobs`
- `jobrunr_recurring_jobs`
- `jobrunr_backgroundjobservers`
- `jobrunr_metadata`

We should include these table definitions for reference.

### 4. Cursors for Pagination
Implement cursor-based pagination for:
- Event lists
- Notification lists
- Expense lists
- Participant lists

Need to add:
- `cursor` columns (typically `created_at` + `id` composite)
- Indexes for cursor-based queries

### 5. Optimistic Locking Support
Add `version` column to all tables that support concurrent updates:
- `event`
- `expense`
- `user`
- `event_participant`
- `balance_snapshot`

### 6. Partitioning Strategies
For scalability, consider partitioning:
- `event_history` by `event_id` or date range
- `notifications` by `user_id` or date range
- `expense` by `event_id`

### 7. Cleanup Strategies
- Notifications: auto-delete after expiry date (Jobrunr cleanup job)
- Event history: archive old records
- Expired invitations: auto-cleanup

### 8. Performance Optimizations
- Additional indexes for common query patterns
- Materialized views for complex aggregations
- Function-based indexes for text search

## Implementation Plan

### Phase 1: Add Missing Tables
1. Create `notification` table with all required fields
2. Create `settlement` table for calculated settlements
3. Add Jobrunr table definitions (commented out or as reference)

### Phase 2: Update Existing Tables
1. Add `role` column to `event_participant` table
2. Add `invitation_token` and `invited_at` to `event_participant`
3. Add `version` column to all tables needing optimistic locking
4. Add `participant_ids` JSONB column to `expense` table for splitting

### Phase 3: Cursor Pagination Support
1. Add composite indexes for cursor pagination
2. Create helper functions for cursor encoding/decoding

### Phase 4: Partitioning Setup
1. Create partitioned table structures
2. Add partition management functions

### Phase 5: Cleanup Infrastructure
1. Add expiry columns where needed
2. Create cleanup job definitions

## SQL Changes Outline

```sql
-- 1. Notifications table
CREATE TABLE notification (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('INFO', 'WARNING', 'ERROR', 'INVITATION', 'EXPENSE', 'SETTLEMENT')),
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    read_at TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    version INTEGER NOT NULL DEFAULT 0
);

-- 2. Settlement table
CREATE TABLE settlement (
    id UUID PRIMARY KEY,
    event_id UUID NOT NULL REFERENCES event(id) ON DELETE CASCADE,
    debtor_id UUID NOT NULL REFERENCES "user"(id),
    creditor_id UUID NOT NULL REFERENCES "user"(id),
    amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
    status VARCHAR(20) NOT NULL CHECK (status IN ('PENDING', 'COMPLETED', 'CANCELLED')),
    calculated_at TIMESTAMP NOT NULL,
    completed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    version INTEGER NOT NULL DEFAULT 0,
    CHECK (debtor_id <> creditor_id)
);

-- 3. Jobrunr tables (reference)
-- These tables are created automatically by Jobrunr
-- jobrunr_jobs
-- jobrunr_recurring_jobs
-- jobrunr_backgroundjobservers
-- jobrunr_metadata

-- 4. Update event_participant table
ALTER TABLE event_participant 
ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'MEMBER' CHECK (role IN ('OWNER', 'ADMIN', 'MEMBER')),
ADD COLUMN invitation_token VARCHAR(255),
ADD COLUMN invited_at TIMESTAMP,
ADD COLUMN version INTEGER NOT NULL DEFAULT 0;

-- 5. Update expense table for participant splitting
ALTER TABLE expense
ADD COLUMN participant_ids JSONB,
ADD COLUMN version INTEGER NOT NULL DEFAULT 0;

-- 6. Add version columns to other tables
ALTER TABLE "user" ADD COLUMN version INTEGER NOT NULL DEFAULT 0;
ALTER TABLE event ADD COLUMN version INTEGER NOT NULL DEFAULT 0;
ALTER TABLE balance_snapshot ADD COLUMN version INTEGER NOT NULL DEFAULT 0;

-- 7. Cursor pagination indexes
CREATE INDEX idx_notification_user_cursor ON notification(user_id, created_at DESC, id DESC);
CREATE INDEX idx_event_owner_cursor ON event(owner_id, created_at DESC, id DESC);
CREATE INDEX idx_expense_event_cursor ON expense(event_id, expense_date DESC, id DESC);

-- 8. Partitioning example for event_history
-- (Would require more complex setup based on PostgreSQL version)
```

## Next Steps

1. Review this plan with stakeholders
2. Implement Phase 1 changes
3. Test migration with existing data
4. Implement remaining phases incrementally
5. Document the final schema