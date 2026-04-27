package com.tbank.tevent.application.controller;

import com.tbank.tevent.application.dto.response.ParticipantDTO;
import com.tbank.tevent.application.dto.response.PendingInvitationResponse;
import com.tbank.tevent.application.service.ParticipantService;
import com.tbank.tevent.domain.model.InvitationStatus;
import com.tbank.tevent.domain.model.ParticipantRole;
import com.tbank.tevent.domain.model.ParticipantStatus;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Контроллер для управления участниками событий.
 */
@RestController
@RequestMapping("/api/v1/events/{eventId}/participants")
@Tag(name = "Participants", description = "Управление участниками событий, приглашения и членство")
public class ParticipantController {

    private final ParticipantService participantService;

    public ParticipantController(ParticipantService participantService) {
        this.participantService = participantService;
    }

    @GetMapping
    @Operation(summary = "Получить список участников события")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Список участников получен"),
            @ApiResponse(responseCode = "404", description = "Событие не найдено")
    })
    public ResponseEntity<List<ParticipantDTO>> getParticipants(
            @PathVariable @Parameter(description = "ID события") Integer eventId) {
        List<ParticipantDTO> participants = participantService.getEventParticipants(eventId);
        return ResponseEntity.ok(participants);
    }

    @PostMapping("/invite")
    @Operation(summary = "Пригласить пользователя в событие")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Приглашение отправлено"),
            @ApiResponse(responseCode = "400", description = "Некорректные данные"),
            @ApiResponse(responseCode = "404", description = "Событие или пользователь не найдены"),
            @ApiResponse(responseCode = "409", description = "Пользователь уже участник")
    })
    public ResponseEntity<Void> inviteParticipant(
            @PathVariable @Parameter(description = "ID события") Integer eventId,
            @RequestParam @Parameter(description = "ID пользователя для приглашения") Integer userId,
            @RequestParam(required = false, defaultValue = "PARTICIPANT") 
            @Parameter(description = "Роль участника") ParticipantRole role) {
        participantService.inviteParticipant(eventId, userId, role);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    @DeleteMapping("/{participantId}")
    @Operation(summary = "Удалить участника из события")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Участник удален"),
            @ApiResponse(responseCode = "404", description = "Событие или участник не найдены"),
            @ApiResponse(responseCode = "403", description = "Недостаточно прав")
    })
    public ResponseEntity<Void> removeParticipant(
            @PathVariable @Parameter(description = "ID события") Integer eventId,
            @PathVariable @Parameter(description = "ID участника") Integer participantId) {
        participantService.removeParticipant(eventId, participantId);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    @PatchMapping("/{participantId}/role")
    @Operation(summary = "Изменить роль участника")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Роль изменена"),
            @ApiResponse(responseCode = "404", description = "Событие или участник не найдены"),
            @ApiResponse(responseCode = "403", description = "Недостаточно прав")
    })
    public ResponseEntity<Void> changeRole(
            @PathVariable @Parameter(description = "ID события") Integer eventId,
            @PathVariable @Parameter(description = "ID участника") Integer participantId,
            @RequestParam @NotNull @Parameter(description = "Новая роль") ParticipantRole newRole) {
        participantService.changeParticipantRole(eventId, participantId, newRole);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    @GetMapping("/invitations/pending")
    @Operation(summary = "Получить список ожидающих приглашений для текущего пользователя")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Список приглашений получен")
    })
    public ResponseEntity<List<PendingInvitationResponse>> getPendingInvitations() {
        List<PendingInvitationResponse> invitations = participantService.getPendingInvitations();
        return ResponseEntity.ok(invitations);
    }

    @PostMapping("/invitations/{invitationId}/accept")
    @Operation(summary = "Принять приглашение в событие")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Приглашение принято"),
            @ApiResponse(responseCode = "404", description = "Приглашение не найдено"),
            @ApiResponse(responseCode = "409", description = "Приглашение уже обработано")
    })
    public ResponseEntity<Void> acceptInvitation(
            @PathVariable @Parameter(description = "ID приглашения") Integer invitationId) {
        participantService.acceptInvitation(invitationId);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    @PostMapping("/invitations/{invitationId}/reject")
    @Operation(summary = "Отклонить приглашение в событие")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Приглашение отклонено"),
            @ApiResponse(responseCode = "404", description = "Приглашение не найдено"),
            @ApiResponse(responseCode = "409", description = "Приглашение уже обработано")
    })
    public ResponseEntity<Void> rejectInvitation(
            @PathVariable @Parameter(description = "ID приглашения") Integer invitationId) {
        participantService.rejectInvitation(invitationId);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    @PatchMapping("/{participantId}/status")
    @Operation(summary = "Обновить статус участника")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Статус обновлен"),
            @ApiResponse(responseCode = "404", description = "Событие или участник не найдены"),
            @ApiResponse(responseCode = "403", description = "Недостаточно прав")
    })
    public ResponseEntity<Void> updateStatus(
            @PathVariable @Parameter(description = "ID события") Integer eventId,
            @PathVariable @Parameter(description = "ID участника") Integer participantId,
            @RequestParam @NotNull @Parameter(description = "Новый статус") ParticipantStatus newStatus) {
        participantService.updateParticipantStatus(eventId, participantId, newStatus);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }
}