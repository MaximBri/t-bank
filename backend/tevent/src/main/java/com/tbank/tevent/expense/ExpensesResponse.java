package com.tbank.tevent.expense;

import lombok.Data;
import java.util.List;

@Data
public class ExpensesResponse {
    private EventHeaderDTO eventHeader;
    private List<ExpenseDTO> expenses;
}
