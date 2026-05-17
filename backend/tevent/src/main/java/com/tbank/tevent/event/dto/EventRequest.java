package com.tbank.tevent.event.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
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
    @JsonProperty("image_key") @JsonAlias({"imageUrl", "image_url"}) String imageKey,
    @JsonProperty("category") @JsonAlias("categories")
    List<String> categories
){}
