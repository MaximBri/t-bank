package com.tbank.tevent.event.dto;

import java.util.List;

public record ParticipantsResponse(
   List<ParticipantResponse> participants
){}
