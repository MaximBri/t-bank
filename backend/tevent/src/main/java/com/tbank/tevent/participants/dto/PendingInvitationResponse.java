package com.tbank.tevent.participants.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PendingInvitationResponse {
    private UUID invitationId;
    private String groupName;
    private String ownerName;
    private String status;
}