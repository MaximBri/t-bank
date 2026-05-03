package com.tbank.tevent.invitations;

import com.tbank.tevent.invitations.dto.InviteLinkDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/events/{eventId}/invite-link")
@RequiredArgsConstructor
@Tag(name = "Invitations", description = "Генерация и управление пригласительными ссылками")
public class InvitationLinkController {

    private final InvitationLinkService invitationLinkService;

    @GetMapping
    @Operation(summary = "Получить текущую пригласительную ссылку и QR-код", description = "Возвращает действующую пригласительную ссылку и QR-код. Если ссылка отсутствует или просрочена, генерирует новую.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Пригласительная ссылка"),
            @ApiResponse(responseCode = "403", description = "Недостаточно прав"),
            @ApiResponse(responseCode = "404", description = "Событие не найдено")
    })
    public ResponseEntity<InviteLinkDTO> getInviteLink(
            @Parameter(description = "ID события", required = true) @PathVariable UUID eventId) {
        return ResponseEntity.ok(invitationLinkService.getInviteLink(eventId));
    }

    @PostMapping("/regenerate")
    @Operation(summary = "Перегенерировать пригласительную ссылку", description = "Создает новую пригласительную ссылку с новым токеном и сроком действия 48 часов")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Новая пригласительная ссылка"),
            @ApiResponse(responseCode = "403", description = "Недостаточно прав"),
            @ApiResponse(responseCode = "404", description = "Событие не найдено")
    })
    public ResponseEntity<InviteLinkDTO> regenerateInviteLink(
            @Parameter(description = "ID события", required = true) @PathVariable UUID eventId) {
        return ResponseEntity.ok(invitationLinkService.regenerateInviteLink(eventId));
    }
}