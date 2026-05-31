package com.tbank.tevent.expenses.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;
import java.util.List;

public record EventExpensesResponse(
        List<ExpenseResponse> expenses,
        @JsonProperty("event_total_sum") BigDecimal eventTotalSum
) {}
