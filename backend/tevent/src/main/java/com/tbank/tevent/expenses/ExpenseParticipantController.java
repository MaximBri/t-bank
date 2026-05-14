package com.tbank.tevent.expenses;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/expenses/participant")
@RequiredArgsConstructor
public class ExpenseParticipantController {

    private final ExpenseParticipantService participantService;

    @GetMapping("/inbox")
    public ResponseEntity<InboxResponse> getInbox() {
        return ResponseEntity.ok(participantService.getInbox());
    }

    @PostMapping("/{expenseId}/confirm")
    public ResponseEntity<Void> confirm(@PathVariable UUID expenseId) {
        participantService.confirm(expenseId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{expenseId}/leave")
    public ResponseEntity<Void> leave(@PathVariable UUID expenseId) {
        participantService.leave(expenseId);
        return ResponseEntity.noContent().build();
    }
}
