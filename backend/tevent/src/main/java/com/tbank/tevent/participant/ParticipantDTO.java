package com.tbank.tevent.participant;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ParticipantDTO {
    private UUID id;
    private String fullName;
    private String email;
    private String avatarUrl;
    private String initials;
    private String role;
    private String status;
}
