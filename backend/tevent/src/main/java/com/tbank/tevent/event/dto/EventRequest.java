package com.tbank.tevent.event.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;
import java.util.List;

public record EventRequest(
    @NotBlank
    String title,
    String description,
    @NotNull
    LocalDateTime startDate,
    @NotNull
    LocalDateTime endDate,
    String imageKey,
    List<String> categories
){}
