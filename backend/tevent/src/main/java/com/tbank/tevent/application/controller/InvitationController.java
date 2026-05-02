package com.tbank.tevent.application.controller;

import com.tbank.tevent.application.dto.response.InviteLinkDTO;
import com.tbank.tevent.application.service.InvitationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Контроллер для управления пригласительными ссылками.
 */
@RestController
@RequestMapping("/api/v1/events/{eventId}/invitations")
@Tag(name = "Invitations", description = "Генерация и управление пригласительными ссылками")
public class InvitationController {

    private final InvitationService invitationService;

    public InvitationController(InvitationService invitationService) {
        this.invitationService = invitationService;
    }

    @PostMapping("/link")
    @Operation(summary = "Создать пригласительную ссылку")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Ссылка создана"),
            @ApiResponse(responseCode = "404", description = "Событие не найдено"),
            @ApiResponse(responseCode = "403", description = "Недостаточно прав")
    })
    public ResponseEntity<InviteLinkDTO> createInviteLink(
            @PathVariable @Parameter(description = "ID события") Integer eventId) {
        InviteLinkDTO inviteLink = invitationService.createInviteLink(eventId);
        return ResponseEntity.status(HttpStatus.CREATED).body(inviteLink);
    }

    @GetMapping("/link")
    @Operation(summary = "Получить активную пригласительную ссылку")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Ссылка получена"),
            @ApiResponse(responseCode = "404", description = "Событие или активная ссылка не найдены"),
            @ApiResponse(responseCode = "403", description = "Недостаточно прав")
    })
    public ResponseEntity<InviteLinkDTO> getActiveInviteLink(
            @PathVariable @Parameter(description = "ID события") Integer eventId) {
        InviteLinkDTO inviteLink = invitationService.getActiveInviteLink(eventId);
        return ResponseEntity.ok(inviteLink);
    }

    @DeleteMapping("/link")
    @Operation(summary = "Отозвать пригласительную ссылку")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Ссылка отозвана"),
            @ApiResponse(responseCode = "404", description = "Событие или активная ссылка не найдены"),
            @ApiResponse(responseCode = "403", description = "Недостаточно прав")
    })
    public ResponseEntity<Void> revokeInviteLink(
            @PathVariable @Parameter(description = "ID события") Integer eventId) {
        invitationService.revokeInviteLink(eventId);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    @PostMapping("/join")
    @Operation(summary = "Присоединиться к событию по токену приглашения")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Пользователь присоединился к событию"),
            @ApiResponse(responseCode = "400", description = "Некорректный токен"),
            @ApiResponse(responseCode = "404", description = "Событие не найдено или ссылка отозвана"),
            @ApiResponse(responseCode = "409", description = "Пользователь уже участник")
    })
    public ResponseEntity<Void> joinByToken(
            @RequestParam @Parameter(description = "Токен приглашения") String token) {
        invitationService.joinByToken(token);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    @GetMapping("/validate")
    @Operation(summary = "Проверить валидность токена приглашения")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Токен валиден"),
            @ApiResponse(responseCode = "400", description = "Токен невалиден")
    })
    public ResponseEntity<Boolean> validateToken(
            @RequestParam @Parameter(description = "Токен приглашения") String token) {
        boolean isValid = invitationService.validateToken(token);
        return ResponseEntity.ok(isValid);
    }

    @GetMapping("/link/details")
    @Operation(summary = "Получить детали события по токену приглашения")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Детали события получены"),
            @ApiResponse(responseCode = "400", description = "Токен невалиден"),
            @ApiResponse(responseCode = "404", description = "Событие не найдено")
    })
    public ResponseEntity<EventDetailsDTO> getEventDetailsByToken(
            @RequestParam @Parameter(description = "Токен приглашения") String token) {
        EventDetailsDTO details = invitationService.getEventDetailsByToken(token);
        return ResponseEntity.ok(details);
    }

    /**
     * DTO для деталей события (используется при проверке токена).
     */
    public record EventDetailsDTO(
            Integer eventId,
            String eventTitle,
            String ownerName,
            Integer participantsCount
    ) {}
}