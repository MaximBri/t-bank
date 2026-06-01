package com.tbank.tevent.expenses.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;
import java.util.UUID;

public record InboxItemDTO(
        @JsonProperty("expense_id") UUID expenseId,
        @JsonProperty("expense_title") String expenseTitle,
        @JsonProperty("amount_to_pay") BigDecimal amountToPay,
        @JsonProperty("expense_status") String expenseStatus
) {}
