package com.tbank.tevent.expense;


import lombok.Data;
import java.math.BigDecimal;
import java.util.UUID;

@Data
public class SettlementDTO {
    private UUID id;
    private UserShortDTO fromUser;
    private UserShortDTO toUser;
    private BigDecimal amount;
    private String status;
}
