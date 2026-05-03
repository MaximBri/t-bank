package com.tbank.tevent.participants;

import com.tbank.tevent.participants.dto.PendingInvitationResponse;
import com.tbank.tevent.participants.dto.ResolveInvitationRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/user/invitations")
@RequiredArgsConstructor
@Tag(name = "Participants", description = "Управление участниками событий, приглашения и членство")
public class UserInvitationController {

    private final ParticipantsService participantsService;

    @GetMapping("/pending")
    @Operation(summary = "Проверить наличие приглашений", description = "Возвращает список приглашений, ожидающих ответа пользователя")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Список активных приглашений"),
            @ApiResponse(responseCode = "403", description = "Недостаточно прав")
    })
    public ResponseEntity<List<PendingInvitationResponse>> getPendingInvitations() {
        return ResponseEntity.ok(participantsService.getPendingInvitations());
    }

    @PostMapping("/{invitationId}/resolve")
    @Operation(summary = "Принять или отклонить приглашение", description = "Ответ на приглашение от владельца группы")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Решение принято"),
            @ApiResponse(responseCode = "403", description = "Недостаточно прав"),
            @ApiResponse(responseCode = "404", description = "Приглашение не найдено"),
            @ApiResponse(responseCode = "410", description = "Приглашение просрочено")
    })
    public ResponseEntity<Void> resolveInvitation(
            @Parameter(description = "ID приглашения", required = true) @PathVariable UUID invitationId,
            @RequestBody ResolveInvitationRequest request) {
        participantsService.resolveInvitation(invitationId, request);
        return ResponseEntity.ok().build();
    }
}