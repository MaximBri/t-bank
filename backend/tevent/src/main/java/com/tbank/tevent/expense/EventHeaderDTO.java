package com.tbank.tevent.expense;

import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
public class EventHeaderDTO {
    private String title;
    private LocalDate startDate;
    private LocalDate endDate;
    private String status;
    private Integer participantsCount;
    private List<String> participantAvatars;
}
