package com.tbank.tevent.event.dto;

import java.util.List;

public record EventsResponse(
   List<EventResponse> events
) {}
