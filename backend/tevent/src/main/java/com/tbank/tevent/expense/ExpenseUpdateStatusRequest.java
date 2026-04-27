package com.tbank.tevent.expense;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ExpenseUpdateStatusRequest {
    @NotBlank
    private String status;
    private String comment;
}
