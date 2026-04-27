package com.tbank.tevent.expense;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
public class CreateExpenseRequest {
    @NotBlank
    private String title;

    @NotNull @Positive
    private BigDecimal amount;

    @NotBlank
    private String category;

    @NotNull @Size(min = 1)
    private List<UUID> participantIds;

    private String imageKey;
}
