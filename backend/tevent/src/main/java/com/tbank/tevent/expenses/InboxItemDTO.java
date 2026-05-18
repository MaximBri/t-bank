package com.tbank.tevent.expenses;

import java.math.BigDecimal;
import java.util.UUID;

public record InboxItemDTO(
        UUID expenseId,
        String expenseTitle,
        BigDecimal amountToPay,
        String expenseStatus
) {}
