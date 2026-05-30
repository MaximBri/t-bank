package com.tbank.tevent.repo;

import java.util.UUID;

public interface ExpenseParticipantView {
    UUID getExpenseId();
    UUID getUserId();
}
