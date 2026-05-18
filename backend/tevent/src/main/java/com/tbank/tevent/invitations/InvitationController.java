package com.tbank.tevent.invitations;

import com.tbank.tevent.SecurityUtils;
import com.tbank.tevent.invitations.dto.MyInvitationResponse;
import com.tbank.tevent.invitations.dto.OwnerInvitationResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/invitations")
@RequiredArgsConstructor
public class InvitationController{

    private final InvitationService invitationService;

    @GetMapping("/outbox")
    public ResponseEntity<List<MyInvitationResponse>> getMySentInvitations() {
        UUID userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(invitationService.getUserOutbox(userId));
    }

    @GetMapping("/inbox")
    public ResponseEntity<List<OwnerInvitationResponse>> getIncomingInvitations(
            @RequestParam(required = false) UUID eventId) {
        UUID ownerId = SecurityUtils.getCurrentUserId();
        if (eventId != null) {
            return ResponseEntity.ok(invitationService.getOwnerInboxByEventId(ownerId, eventId));
        } else {
            return ResponseEntity.ok(invitationService.getOwnerInbox(ownerId));
        }
    }

    @PatchMapping("/{invitationId}/decide")
    public ResponseEntity<Void> decideInvitation(
            @PathVariable UUID invitationId,
            @Valid @RequestBody InvitationDecisionRequest request
    ) {
        invitationService.processDecision(invitationId, request.status());
        return ResponseEntity.noContent().build();
    }
}