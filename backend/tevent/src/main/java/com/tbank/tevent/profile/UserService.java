package com.tbank.tevent.profile;

import com.tbank.tevent.repo.UserRepository;
import com.tbank.tevent.repo.entity.User;
import com.tbank.tevent.profile.dto.PasswordChangeRequest;
import com.tbank.tevent.profile.dto.UpdateProfileRequest;
import com.tbank.tevent.profile.dto.UserProfileDto;
import com.tbank.tevent.s3.S3Service;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final S3Service s3Service;

    // Change current password
    @Transactional
    public void updateUserPassword(UUID userId, PasswordChangeRequest request) {
        log.debug("Attempt to update password for authenticated user");
        User currentUser = getUserById(userId);
        log.debug("User found: userId={}", currentUser.getId());

        if (!passwordEncoder.matches(request.currentPassword(), currentUser.getPasswordHash())) {
            log.warn("Password update failed - invalid current password for userId={}", currentUser.getId());
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Incorrect current password");
        }

        if (passwordEncoder.matches(request.newPassword(), currentUser.getPasswordHash())) {
            log.warn("Password update failed - new password matches old password for userId={}", currentUser.getId());
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "The new password must be different from the current one");
        }

        currentUser.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        currentUser.setUpdatedAt(LocalDateTime.now());
        userRepository.save(currentUser);

        log.info("Password updated successfully for userId={}", currentUser.getId());
    }

    // Update user data
    @Transactional
    public UserProfileDto updateUser(UUID userId, UpdateProfileRequest request) {
        log.debug("Attempt to update user profile");
        User currentUser = getUserById(userId);
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
            s3Service.useKey(request.avatarUrl());
            currentUser.setAvatarUrl(request.avatarUrl());
        }

        currentUser.setUpdatedAt(LocalDateTime.now());
        userRepository.save(currentUser);

        log.info("User profile updated successfully for userId={}", currentUser.getId());
        return mapToUserProfileDto(currentUser);
    }

    private User getUserById(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    // entity -> DTO
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
