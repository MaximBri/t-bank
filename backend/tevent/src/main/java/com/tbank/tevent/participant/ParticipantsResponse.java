package com.tbank.tevent.participant;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ParticipantsResponse {
    private List<ParticipantDTO> participants;
    private Integer totalCount;
}
