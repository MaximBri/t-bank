package com.tbank.tevent.auth;

import com.tbank.tevent.auth.dto.CurrentUserResponse;
import com.tbank.tevent.auth.dto.LoginRequest;
import com.tbank.tevent.auth.dto.RegisterResponse;
import com.tbank.tevent.auth.dto.RegisterRequest;
import com.tbank.tevent.auth.exception.MissingRefreshTokenException;
import com.tbank.tevent.repo.entity.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final AuthCookieService authCookieService;

    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthTokens tokens = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .headers(createAuthCookieHeaders(tokens))
                .body(new RegisterResponse(tokens.userId(), null));
    }

    @PostMapping("/login")
    public ResponseEntity<Void> login(@Valid @RequestBody LoginRequest request) {
        AuthTokens tokens = authService.login(request);
        return ResponseEntity.ok()
                .headers(createAuthCookieHeaders(tokens))
                .build();
    }

    @GetMapping("/me")
    public CurrentUserResponse me(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return new CurrentUserResponse(user.getLogin(), user.getId(), user.getFirstName(),
                user.getSecondName(), user.getAvatarUrl());
    }

    @PostMapping("/refresh")
    public ResponseEntity<Void> refresh(
            @CookieValue(name = AuthCookieService.REFRESH_TOKEN_COOKIE, required = false) String refreshToken
    ) {
        if (refreshToken == null) {
            throw new MissingRefreshTokenException();
        }
        AuthTokens tokens = authService.refresh(refreshToken);
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, authCookieService.createAccessTokenCookie(tokens.accessToken()).toString())
                .header(HttpHeaders.SET_COOKIE, authCookieService.createRefreshTokenCookie(tokens.refreshToken()).toString())
                .build();
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        return ResponseEntity.noContent()
                .header(HttpHeaders.SET_COOKIE, authCookieService.clearAccessTokenCookie().toString())
                .header(HttpHeaders.SET_COOKIE, authCookieService.clearRefreshTokenCookie().toString())
                .build();
    }

    private HttpHeaders createAuthCookieHeaders(AuthTokens tokens) {
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.SET_COOKIE, authCookieService.createAccessTokenCookie(tokens.accessToken()).toString());
        headers.add(HttpHeaders.SET_COOKIE, authCookieService.createRefreshTokenCookie(tokens.refreshToken()).toString());
        return headers;
    }
}
