package com.tbank.tevent.expense;

import lombok.Data;
import java.util.List;

@Data
public class SettlementsResponse {
    private EventHeaderDTO eventHeader;
    private List<SettlementDTO> settlements;
}
