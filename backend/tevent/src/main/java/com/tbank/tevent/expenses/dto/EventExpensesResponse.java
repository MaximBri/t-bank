package com.tbank.tevent.expenses.dto;

import java.math.BigDecimal;
import java.util.List;

public record EventExpensesResponse(
        List<ExpenseResponse> expenses,
        BigDecimal eventTotalSum
) {}
