package com.tbank.tevent.application.dto.response;

import com.tbank.tevent.domain.model.ParticipantRole;
import com.tbank.tevent.domain.model.ParticipantStatus;
import io.swagger.v3.oas.annotations.media.Schema;

/**
 * DTO участника события.
 */
@Schema(description = "DTO участника события")
public record ParticipantDTO(
        @Schema(description = "ID участника", example = "15")
        Integer id,

        @Schema(description = "Полное имя", example = "Иван Петров")
        String fullName,

        @Schema(description = "Email", example = "ivan@email.com")
        String email,

        @Schema(description = "URL аватара")
        String avatarUrl,

        @Schema(description = "Инициалы", example = "И.П.")
        String initials,

        @Schema(description = "Роль в событии")
        ParticipantRole role,

        @Schema(description = "Статус участия")
        ParticipantStatus status
) {}