package com.tbank.tevent.auth;

import com.tbank.tevent.user.User;
import com.tbank.tevent.user.UserRepository;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    private final JwtService jwtService;
    private final UserRepository userRepository;

    public JwtAuthenticationFilter(JwtService jwtService, UserRepository userRepository) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull FilterChain filterChain) throws ServletException, IOException {

        String token = resolveAccessToken(request);

        if (token == null) {
            filterChain.doFilter(request, response);
            return;
        }

        if (!jwtService.isAccessToken(token)) {
            log.debug("JWT authentication skipped: invalid access token");
            filterChain.doFilter(request, response);
            return;
        }

        String login = jwtService.extractLogin(token);

        User user = userRepository.findByLogin(login).orElse(null);

        if (user == null) {
            log.debug("JWT authentication skipped: token subject has no matching user, login={}", login);
            filterChain.doFilter(request, response);
            return;
        }

        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(
                        user.getLogin(),
                        null,
                        List.of()
                );

        authentication.setDetails( new WebAuthenticationDetailsSource().buildDetails(request) );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        log.debug("JWT authentication completed, userId={}, login={}", user.getId(), user.getLogin());

        filterChain.doFilter(request, response);
    }

    private String resolveAccessToken(HttpServletRequest request) {
        if (request.getCookies() == null) {
            return null;
        }

        for (Cookie cookie : request.getCookies()) {
            if (AuthCookieService.ACCESS_TOKEN_COOKIE.equals(cookie.getName())) {
                return cookie.getValue();
            }
        }

        return null;
    }
}
