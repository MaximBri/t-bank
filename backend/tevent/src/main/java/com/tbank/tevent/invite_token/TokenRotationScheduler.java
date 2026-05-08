package com.tbank.tevent.invite_token;

import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class TokenRotationScheduler {

    private final TokenRotationService tokenRotationService;

    @Scheduled(cron = "0 * * * * *")
    public void scheduleTokenRotation() {
        tokenRotationService.rotateExpiredTokens();
    }
}
