package com.tbank.tevent.expenses;

import java.util.List;

public record ListInboxItemDTO(
        List<InboxItemDTO> listInbox
) {
}
