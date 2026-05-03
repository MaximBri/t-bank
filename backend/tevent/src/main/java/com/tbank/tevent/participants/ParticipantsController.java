package com.tbank.tevent.participants;

import com.tbank.tevent.participants.dto.InviteUserRequest;
import com.tbank.tevent.participants.dto.ParticipantDTO;
import com.tbank.tevent.participants.dto.PendingInvitationResponse;
import com.tbank.tevent.participants.dto.ResolveInvitationRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/events/{eventId}/participants")
@RequiredArgsConstructor
@Tag(name = "Participants", description = "Управление участниками событий, приглашения и членство")
public class ParticipantsController {

    private final ParticipantsService participantsService;

    @GetMapping
    @Operation(summary = "Получить список участников события", description = "Возвращает список всех участников события")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Список участников"),
            @ApiResponse(responseCode = "403", description = "Недостаточно прав"),
            @ApiResponse(responseCode = "404", description = "Событие не найдено")
    })
    public ResponseEntity<GetParticipantsResponse> getParticipants(
            @Parameter(description = "ID события", required = true) @PathVariable UUID eventId,
            @Parameter(description = "Фильтр по статусу участия") @RequestParam(required = false) String status) {
        List<ParticipantDTO> participants = participantsService.getParticipants(eventId, status);
        return ResponseEntity.ok(new GetParticipantsResponse(participants, participants.size()));
    }

    @PostMapping("/invite")
    @Operation(summary = "Пригласить пользователя в событие", description = "Создание приглашения для пользователя по login")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Приглашение успешно создано"),
            @ApiResponse(responseCode = "403", description = "Недостаточно прав"),
            @ApiResponse(responseCode = "404", description = "Пользователь не найден"),
            @ApiResponse(responseCode = "409", description = "Пользователь уже приглашен или является участником")
    })
    public ResponseEntity<Void> inviteUser(
            @Parameter(description = "ID события", required = true) @PathVariable UUID eventId,
            @RequestBody InviteUserRequest request) {
        participantsService.inviteUser(eventId, request);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @DeleteMapping("/{userId}")
    @Operation(summary = "Удалить участника или отозвать приглашение", description = "Удаление участника из события или отзыв приглашения (только для владельца)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Участник удален / приглашение отозвано"),
            @ApiResponse(responseCode = "403", description = "Недостаточно прав"),
            @ApiResponse(responseCode = "404", description = "Участник не найден")
    })
    public ResponseEntity<Void> removeParticipant(
            @Parameter(description = "ID события", required = true) @PathVariable UUID eventId,
            @Parameter(description = "ID пользователя", required = true) @PathVariable UUID userId) {
        participantsService.removeParticipant(eventId, userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/leave/check")
    @Operation(summary = "Проверить возможность выхода из события", description = "Проверяет наличие долгов и роль пользователя перед выходом")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Результат проверки"),
            @ApiResponse(responseCode = "403", description = "Недостаточно прав"),
            @ApiResponse(responseCode = "404", description = "Событие не найдено")
    })
    public ResponseEntity<com.tbank.tevent.participants.dto.LeaveCheckResponse> checkLeaveAbility(
            @Parameter(description = "ID события", required = true) @PathVariable UUID eventId) {
        return ResponseEntity.ok(participantsService.checkLeaveAbility(eventId));
    }

    @PostMapping("/leave")
    @Operation(summary = "Подтвердить выход из события", description = "Окончательный выход пользователя из события")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Вы успешно покинули событие"),
            @ApiResponse(responseCode = "403", description = "Недостаточно прав"),
            @ApiResponse(responseCode = "404", description = "Событие не найдено"),
            @ApiResponse(responseCode = "409", description = "Конфликт (появились новые долги во время подтверждения)")
    })
    public ResponseEntity<Void> leaveEvent(
            @Parameter(description = "ID события", required = true) @PathVariable UUID eventId) {
        participantsService.leaveEvent(eventId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/user/invitations/pending")
    @Operation(summary = "Проверить наличие приглашений", description = "Возвращает список приглашений, ожидающих ответа пользователя")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Список активных приглашений"),
            @ApiResponse(responseCode = "403", description = "Недостаточно прав")
    })
    public ResponseEntity<List<PendingInvitationResponse>> getPendingInvitations() {
        return ResponseEntity.ok(participantsService.getPendingInvitations());
    }

    @PostMapping("/user/invitations/{invitationId}/resolve")
    @Operation(summary = "Принять или отклонить приглашение", description = "Ответ на приглашение от владельца группы")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Решение принято"),
            @ApiResponse(responseCode = "403", description = "Недостаточно прав"),
            @ApiResponse(responseCode = "404", description = "Приглашение не найдено"),
            @ApiResponse(responseCode = "410", description = "Приглашение просрочено")
    })
    public ResponseEntity<Void> resolveInvitation(
            @Parameter(description = "ID события", required = true) @PathVariable UUID eventId,
            @Parameter(description = "ID приглашения", required = true) @PathVariable UUID invitationId,
            @RequestBody ResolveInvitationRequest request) {
        participantsService.resolveInvitation(invitationId, request);
        return ResponseEntity.ok().build();
    }


    public static class GetParticipantsResponse {
        private final List<ParticipantDTO> participants;
        private final int totalCount;

        public GetParticipantsResponse(List<ParticipantDTO> participants, int totalCount) {
            this.participants = participants;
            this.totalCount = totalCount;
        }

        public List<ParticipantDTO> getParticipants() {
            return participants;
        }

        public int getTotalCount() {
            return totalCount;
        }
    }
}