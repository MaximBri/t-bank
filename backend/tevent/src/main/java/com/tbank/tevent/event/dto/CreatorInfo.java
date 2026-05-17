package com.tbank.tevent.event.dto;

public record CreatorInfo(
    String firstName,
    String secondName,
    String login,
    String avatarUrl
) {
    public static CreatorInfo from(String firstName, String secondName, String login, String avatarUrl) {
        return new CreatorInfo(
            firstName != null ? firstName : "",
            secondName != null ? secondName : "",
            login != null ? login : "",
            avatarUrl != null ? avatarUrl : ""
        );
    }
}