package com.tbank.tevent.expenses;

import com.tbank.tevent.SecurityUtils;
import com.tbank.tevent.repo.ExpenseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/expenses/participant")
@RequiredArgsConstructor
public class ExpenseParticipantController {

    private final InboxQueryService  inboxQueryService;
    private final ExpenseRepository expenseRepository;
    private final ExpenseCommandService  commandService;

    @GetMapping("/inbox")
    public ResponseEntity<ListInboxItemDTO> getInbox() {
        UUID userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(inboxQueryService.getUserInbox(userId));
    }

    @PostMapping("/{expenseId}/confirm")
    public ResponseEntity<Void> confirm(@PathVariable UUID expenseId) {
        UUID authorId= SecurityUtils.getCurrentUserId();
        commandService.confirmSplit(expenseId, authorId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{expenseId}/leave")
    public ResponseEntity<Void> leave(@PathVariable UUID expenseId) {
        UUID authorId= SecurityUtils.getCurrentUserId();
        commandService.rejectExpense(expenseId, authorId);
        return ResponseEntity.noContent().build();
    }
}
