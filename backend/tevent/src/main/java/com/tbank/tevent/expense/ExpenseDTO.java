package com.tbank.tevent.expense;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class ExpenseDTO {
    private UUID id;
    private String title;
    private String category;
    private String approvalStatus;
    private String payerName;
    private Integer splitBetweenCount;
    private LocalDateTime createdAt;
    private BigDecimal totalAmount;
    private BigDecimal perPersonAmount;
    private String imageUrl;
}
