package com.tbank.tevent.event;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Setter
@Getter
public class UserEventResponse {
    private UUID id;
    private String title;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer participantsCount;
    private String status;
    private String imageUrl;
}