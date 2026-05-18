package com.tbank.tevent.expenses;

import java.util.UUID;

public interface ExpenseParticipantView {
    UUID getExpenseId();
    UUID getUserId();
}
