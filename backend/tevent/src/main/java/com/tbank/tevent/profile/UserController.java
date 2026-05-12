package com.tbank.tevent.profile;

import com.tbank.tevent.profile.dto.PasswordChangeRequest;
import com.tbank.tevent.profile.dto.UpdateProfileRequest;
import com.tbank.tevent.profile.dto.UserProfileDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/me")
@RequiredArgsConstructor
@Tag(name = "Profile", description = "Управление профилем пользователя")
public class UserController {
    private final UserService userService;

    @GetMapping
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Профиль успешно получен"),
            @ApiResponse(responseCode = "401", description = "Пользователь не аутентифицирован")
    })
    @Operation(summary = "Получить профиль текущего пользователя")
    public ResponseEntity<UserProfileDto> getUser() {
        return userService.getUserData();
    }


    @PatchMapping
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Данные пользователя успешно обновлены"),
            @ApiResponse(responseCode = "401", description = "Пользователь не аутентифицирован"),
            @ApiResponse(responseCode = "400", description = "Входные данные невалидны"),
            @ApiResponse(responseCode = "409", description = "Данный логин уже занят")
    })
    @Operation(summary = "Обновить данные текущего пользователя")
    public ResponseEntity<UserProfileDto> updateUser(@Valid @RequestBody UpdateProfileRequest request) {
        return userService.updateUser(request);
    }

    @PostMapping("/password")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Пароль успешно обновлен"),
            @ApiResponse(responseCode = "401", description = "Пользователь не аутентифицирован"),
            @ApiResponse(responseCode = "400", description = "Входные данные невалидны")
    })
    @Operation(summary = "Обновить пароль текущего пользователя")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void updatePassword(@Valid @RequestBody PasswordChangeRequest request) {
        userService.updateUserPassword(request);
    }
}
