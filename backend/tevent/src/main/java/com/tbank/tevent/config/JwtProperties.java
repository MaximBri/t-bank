package com.tbank.tevent.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Setter
@Getter
@ConfigurationProperties(prefix = "app.security.jwt")
public class JwtProperties {

    private String secret;
    private long accessTokenExpirationMinutes;
    private long refreshTokenExpirationDays;
    private boolean cookieSecure;

}
