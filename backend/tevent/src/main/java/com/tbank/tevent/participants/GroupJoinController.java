package com.tbank.tevent.participants;

import com.tbank.tevent.participants.dto.JoinGroupRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/groups")
@RequiredArgsConstructor
@Tag(name = "Participants", description = "Управление участниками событий, приглашения и членство")
public class GroupJoinController {

    private final ParticipantsService participantsService;

    @PostMapping("/join")
    @Operation(summary = "Подать заявку на вступление в группу", description = "Пользователь может подать заявку на вступление в группу по инвайт-коду. Заявка требует подтверждения от владельца группы.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "202", description = "Заявка принята и ожидает рассмотрения владельцем"),
            @ApiResponse(responseCode = "404", description = "Инвайт-код не найден"),
            @ApiResponse(responseCode = "409", description = "Вы уже подали заявку в эту группу"),
            @ApiResponse(responseCode = "410", description = "Ссылка просрочена (прошло > 48 часов)")
    })
    public ResponseEntity<Void> joinGroup(@RequestBody JoinGroupRequest request) {
        participantsService.joinGroup(request);
        return ResponseEntity.status(HttpStatus.ACCEPTED).build();
    }
}