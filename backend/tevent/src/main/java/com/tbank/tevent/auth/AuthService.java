package com.tbank.tevent.auth;

import com.tbank.tevent.auth.dto.CurrentUserResponse;
import com.tbank.tevent.auth.dto.LoginRequest;
import com.tbank.tevent.auth.dto.RegisterRequest;
import com.tbank.tevent.auth.exception.InvalidCredentialsException;
import com.tbank.tevent.auth.exception.UserAlreadyExistsException;
import com.tbank.tevent.user.User;
import com.tbank.tevent.user.UserRepository;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;


    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }


    @Transactional
    public AuthTokens register(RegisterRequest request) {
        String login = request.login().trim();

        if (userRepository.existsByLogin(login)) {
            log.info("Registration rejected: login already exists, login={}", login);
            throw new UserAlreadyExistsException();
        }

        try {
            User user = new User();
            user.setLogin(login);
            user.setPasswordHash(passwordEncoder.encode(request.password()));
            User savedUser = userRepository.save(user);
            log.info("User registered successfully, userId={}, login={}", savedUser.getId(), savedUser.getLogin());
            return generateTokens(savedUser);
        } catch (DataIntegrityViolationException ex) {
            log.info("Registration rejected by database constraint, login={}", login);
            throw new UserAlreadyExistsException();
        }
    }

    @Transactional
    public AuthTokens login(LoginRequest request) {
        String login = request.login().trim();
        User user = userRepository.findByLogin(login).orElseThrow(() -> {
            log.info("Login rejected: user not found, login={}", login);
            return new InvalidCredentialsException();
        });

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            log.info("Login rejected: invalid password, login={}", login);
            throw new InvalidCredentialsException();
        }

        log.info("User logged in successfully, userId={}, login={}", user.getId(), user.getLogin());

        return generateTokens(user);
    }

    @Transactional
    public String refresh(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank() || !jwtService.isRefreshToken(refreshToken)) {
            log.info("Refresh rejected: missing or invalid refresh token");
            throw new InvalidCredentialsException();
        }

        String login = jwtService.extractLogin(refreshToken);
        User user = userRepository.findByLogin(login).orElseThrow(() -> {
            log.info("Refresh rejected: token subject has no matching user, login={}", login);
            return new InvalidCredentialsException();
        });

        String accessToken = jwtService.generateAccessToken(user);
        log.info("Access token refreshed successfully, userId={}, login={}", user.getId(), user.getLogin());

        return accessToken;
    }

    @Transactional
    public CurrentUserResponse me(String login) {
        User user = userRepository.findByLogin(login)
                .orElseThrow(() -> {
                    log.info("Current session rejected: user not found, login={}", login);
                    return new InvalidCredentialsException();
                });

        return new CurrentUserResponse(user.getLogin(), user.getId());
    }

    private AuthTokens generateTokens(User user) {
        return new AuthTokens(jwtService.generateAccessToken(user), jwtService.generateRefreshToken(user), user.getId());
    }

}
