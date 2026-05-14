package com.tbank.tevent.event;

import java.util.List;

public record ParticipantsResponse(
   List<ParticipantResponse> participants
){}
