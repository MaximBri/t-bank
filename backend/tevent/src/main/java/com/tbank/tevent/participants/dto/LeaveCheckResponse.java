package com.tbank.tevent.participants.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeaveCheckResponse {
    private boolean canLeave;
    private String reason;
    private boolean hasDebts;
    private boolean isOwner;
}