package com.tbank.tevent.invite_token;

import com.tbank.tevent.repo.InviteTokenRepository;
import com.tbank.tevent.repo.entity.InviteToken;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class TokenRotationService {

    private final InviteTokenRepository repository;

    @Transactional
    public void rotateExpiredTokens() {
        LocalDateTime now = LocalDateTime.now();
        List<InviteToken> expired = repository.findAllExpired(now);

        expired.forEach(token -> {
            token.setUpdatedAt(now);
            token.setExpiresAt(now.plusDays(3));
        });

        repository.saveAll(expired);
    }
}
