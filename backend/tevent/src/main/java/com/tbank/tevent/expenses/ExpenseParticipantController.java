package com.tbank.tevent.expenses;

import com.tbank.tevent.SecurityUtils;
import com.tbank.tevent.expenses.dto.ListInboxItemDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/expenses/participant")
@RequiredArgsConstructor
@Tag(name = "Expenses Participant", description = "Действия участника по расходам")
public class ExpenseParticipantController {

    private final InboxQueryService inboxQueryService;
    private final ExpenseCommandService commandService;

    @GetMapping("/inbox")
    @Operation(summary = "Получить inbox участника по расходам")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Inbox получен")
    })
    public ResponseEntity<ListInboxItemDTO> getInbox() {
        UUID userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(inboxQueryService.getUserInbox(userId));
    }

    @PostMapping("/{expenseId}/confirm")
    @Operation(summary = "Подтвердить участие в расходе")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Участие подтверждено"),
            @ApiResponse(responseCode = "404", description = "Расход не найден")
    })
    public ResponseEntity<Void> confirm(@PathVariable UUID expenseId) {
        UUID userId= SecurityUtils.getCurrentUserId();
        commandService.confirmSplit(expenseId, userId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{expenseId}/leave")
    @Operation(summary = "Отклонить участие в расходе")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Участие отклонено"),
            @ApiResponse(responseCode = "404", description = "Расход не найден")
    })
    public ResponseEntity<Void> leave(@PathVariable UUID expenseId) {
        UUID userId= SecurityUtils.getCurrentUserId();
        commandService.rejectSplit(expenseId, userId);
        return ResponseEntity.noContent().build();
    }
}
