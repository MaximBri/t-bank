package com.tbank.tevent.invitations;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public record InvitationDecisionRequest(
        @NotNull
        @Pattern(regexp = "ACCEPTED|REJECTED", message = "Статус должен быть ACCEPTED или REJECTED")
        String status
) {}
