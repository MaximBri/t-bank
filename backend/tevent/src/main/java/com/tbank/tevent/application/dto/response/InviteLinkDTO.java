package com.tbank.tevent.application.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * DTO пригласительной ссылки.
 */
@Schema(description = "DTO пригласительной ссылки")
public record InviteLinkDTO(
        @Schema(description = "Полная ссылка для приглашения", 
                example = "https://t-event.ru/join/zp1v56...")
        String fullUrl,

        @Schema(description = "Токен приглашения", example = "zp1v56uxy8rdx5ypatb96i45")
        String token,

        @Schema(description = "Картинка QR-кода в base64 или ссылка")
        String qrCodeBase64
) {}