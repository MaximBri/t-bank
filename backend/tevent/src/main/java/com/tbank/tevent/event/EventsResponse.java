package com.tbank.tevent.event;

import com.tbank.tevent.event.dto.EventRequest;

import java.util.List;

public record EventsResponse(
   List<EventResponse> events
) {}
