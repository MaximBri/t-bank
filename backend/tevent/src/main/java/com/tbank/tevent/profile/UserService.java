package com.tbank.tevent.profile;

import com.tbank.tevent.repo.UserRepository;
import com.tbank.tevent.repo.entity.User;
import com.tbank.tevent.profile.dto.PasswordChangeRequest;
import com.tbank.tevent.profile.dto.UpdateProfileRequest;
import com.tbank.tevent.profile.dto.UserProfileDto;
import com.tbank.tevent.s3.S3Service;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class UserService {
    private static final Logger log = LoggerFactory.getLogger(UserService.class);
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final S3Service s3Service;

    @Transactional
    public void updateUserPassword(PasswordChangeRequest request) {
        log.debug("Attempt to update password for authenticated user");
        User currentUser = getCurrentUser();
        log.debug("User found: userId={}", currentUser.getId());

        if (!passwordEncoder.matches(request.currentPassword(), currentUser.getPasswordHash())) {
            log.warn("Password update failed - invalid current password for userId={}", currentUser.getId());
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Неверный текущий пароль");
        }

        if (passwordEncoder.matches(request.newPassword(), currentUser.getPasswordHash())) {
            log.warn("Password update failed - new password matches old password for userId={}", currentUser.getId());
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Новый пароль должен отличаться от текущего");
        }

        currentUser.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        currentUser.setUpdatedAt(LocalDateTime.now());
        userRepository.save(currentUser);

        log.info("Password updated successfully for userId={}", currentUser.getId());
    }

    public UserProfileDto getUserData() {
        log.debug("Fetching user profile data");

        User currentUser = getCurrentUser();
        UserProfileDto userProfile = mapToUserProfileDto(currentUser);

        log.debug("User profile fetched successfully for userId={}", currentUser.getId());
        return userProfile;
    }

    @Transactional
    public UserProfileDto updateUser(UpdateProfileRequest request) {
        log.debug("Attempt to update user profile");
        User currentUser = getCurrentUser();
        log.debug("User found: userId={}", currentUser.getId());

        if (request.login() != null && !request.login().isBlank()) {
            if (!request.login().equals(currentUser.getLogin())) {
                if (userRepository.findByLogin(request.login()).isPresent()) {
                    log.warn("Profile update failed - username already exists: {}", request.login());
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "Логин уже используется");
                }
                log.debug("Updating username from '{}' to '{}' for userId={}",
                        currentUser.getLogin(), request.login(), currentUser.getId());
                currentUser.setLogin(request.login());
            }
        }

        if (request.firstName() != null && !request.firstName().isBlank()) {
            log.debug("Updating firstName from '{}' to '{}' for userId={}",
                    currentUser.getFirstName(), request.firstName(), currentUser.getId());
            currentUser.setFirstName(request.firstName());
        }

        if (request.secondName() != null && !request.secondName().isBlank()) {
            log.debug("Updating secondName from '{}' to '{}' for userId={}",
                    currentUser.getSecondName(), request.secondName(), currentUser.getId());
            currentUser.setSecondName(request.secondName());
        }
        if (request.avatarUrl() != null && !request.avatarUrl().isBlank()) {
            s3Service.useKey(currentUser.getId(), request.avatarUrl());
            currentUser.setAvatarUrl(request.avatarUrl());
        }

        currentUser.setUpdatedAt(LocalDateTime.now());
        userRepository.save(currentUser);

        log.info("User profile updated successfully for userId={}", currentUser.getId());
        return mapToUserProfileDto(currentUser);
    }

    private User getCurrentUser() {
        log.debug("Retrieving current authenticated user");

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            log.warn("Authentication failed - no authenticated user found");
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Не выполнена аутентификация");
        }

        Object principal = authentication.getPrincipal();
        if (!(principal instanceof User)) {
            log.error("Invalid principal type: expected User but got {}",
                    principal != null ? principal.getClass().getSimpleName() : "null");
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Неверные данные пользователя");
        }

        User user = (User) principal;
        log.debug("Current user retrieved: userId={}, login={}", user.getId(), user.getLogin());
        return user;
    }

    private UserProfileDto mapToUserProfileDto(User user) {
        return new UserProfileDto(
                user.getId(),
                user.getLogin(),
                user.getFirstName(),
                user.getSecondName(),
                user.getAvatarUrl(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }
}
