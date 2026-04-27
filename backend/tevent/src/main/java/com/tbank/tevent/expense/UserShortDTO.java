package com.tbank.tevent.expense;

import lombok.Data;
import java.util.UUID;

@Data
public class UserShortDTO {
    private UUID id;
    private String fullName;
    private String avatarUrl;
    private String initials;
}
