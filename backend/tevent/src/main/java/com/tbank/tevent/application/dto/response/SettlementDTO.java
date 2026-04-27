package com.tbank.tevent.application.dto.response;

import com.tbank.tevent.domain.model.SettlementStatus;
import io.swagger.v3.oas.annotations.media.Schema;

/**
 * DTO взаиморасчета.
 */
@Schema(description = "DTO взаиморасчета")
public record SettlementDTO(
        @Schema(description = "ID взаиморасчета", example = "701")
        Integer id,

        @Schema(description = "Пользователь, который должен")
        UserShortDTO fromUser,

        @Schema(description = "Пользователь, которому должны")
        UserShortDTO toUser,

        @Schema(description = "Сумма долга", example = "2000.00")
        Double amount,

        @Schema(description = "Статус взаиморасчета")
        SettlementStatus status
) {}