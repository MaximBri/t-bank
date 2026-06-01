package com.tbank.tevent.expenses.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public record ListInboxItemDTO(
        @JsonProperty("list_inbox") List<InboxItemDTO> listInbox
) {}
