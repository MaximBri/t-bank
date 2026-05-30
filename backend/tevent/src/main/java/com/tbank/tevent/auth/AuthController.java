package com.tbank.tevent.auth;

import com.tbank.tevent.SecurityUtils;
import com.tbank.tevent.auth.dto.CurrentUserResponse;
import com.tbank.tevent.auth.dto.LoginRequest;
import com.tbank.tevent.auth.dto.RegisterRequest;
import com.tbank.tevent.auth.dto.RegisterResponse;
import com.tbank.tevent.auth.exception.MissingRefreshTokenException;
import com.tbank.tevent.repo.entity.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Tag(name = "Auth", description = "Аутентификация и управление сессией")
public class AuthController {

    private final AuthService authService;
    private final AuthCookieService authCookieService;

    @PostMapping("/register")
    @Operation(summary = "Регистрация нового пользователя")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Пользователь успешно зарегистрирован"),
            @ApiResponse(responseCode = "400", description = "Некорректные входные данные"),
            @ApiResponse(responseCode = "409", description = "Пользователь уже существует")
    })
    public ResponseEntity<RegisterResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthService.RegisterResult registerResult = authService.register(request);
        AuthTokens tokens = registerResult.tokens();
        return ResponseEntity.status(HttpStatus.CREATED)
                .headers(createAuthCookieHeaders(tokens))
                .body(new RegisterResponse(tokens.userId(), registerResult.joinedGroupId()));
    }

    @PostMapping("/login")
    @Operation(summary = "Вход пользователя")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Успешный вход"),
            @ApiResponse(responseCode = "400", description = "Некорректные входные данные"),
            @ApiResponse(responseCode = "401", description = "Неверные учетные данные")
    })
    public ResponseEntity<Void> login(@Valid @RequestBody LoginRequest request) {
        AuthTokens tokens = authService.login(request);
        return ResponseEntity.ok()
                .headers(createAuthCookieHeaders(tokens))
                .build();
    }

    @GetMapping("/me")
    @Operation(summary = "Получить данные текущего пользователя")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Данные пользователя получены"),
            @ApiResponse(responseCode = "401", description = "Пользователь не аутентифицирован")
    })
    public CurrentUserResponse me() {
        User user = SecurityUtils.getCurrentUser();

        return new CurrentUserResponse(
                user.getLogin(),
                user.getId(),
                user.getFirstName(),
                user.getSecondName(),
                user.getAvatarUrl()
        );
    }

    @PostMapping("/refresh")
    @Operation(summary = "Обновить access и refresh токены по refresh token")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Токены обновлены"),
            @ApiResponse(responseCode = "401", description = "Refresh token отсутствует или невалиден")
    })
    public ResponseEntity<Void> refresh(
            @CookieValue(name = AuthCookieService.REFRESH_TOKEN_COOKIE, required = false) String refreshToken
    ) {
        if (refreshToken == null) {
            throw new MissingRefreshTokenException();
        }

        AuthTokens tokens = authService.refresh(refreshToken);

        return ResponseEntity.ok()
                .headers(createAuthCookieHeaders(tokens))
                .build();
    }

    @PostMapping("/logout")
    @Operation(summary = "Выход пользователя")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Выход выполнен, cookies очищены")
    })
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
