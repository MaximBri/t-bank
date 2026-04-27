package com.tbank.tevent.application.dto.response;

import com.tbank.tevent.domain.model.InvitationStatus;
import io.swagger.v3.oas.annotations.media.Schema;

/**
 * DTO для отображения ожидающего приглашения.
 */
@Schema(description = "DTO для отображения ожидающего приглашения")
public record PendingInvitationResponse(
        @Schema(description = "ID приглашения", example = "505")
        Integer invitationId,

        @Schema(description = "Название группы", example = "Поездка в Турцию")
        String groupName,

        @Schema(description = "Имя владельца группы", example = "Александр (Admin)")
        String ownerName,

        @Schema(description = "Статус приглашения")
        InvitationStatus status
) {}