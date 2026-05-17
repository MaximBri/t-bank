package com.tbank.tevent.event.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
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
    @JsonAlias({"imageUrl", "image_url"}) String imageKey,
    List<String> categories
){}
