package com.tbank.tevent.expense;

import com.tbank.tevent.SecurityUtils;
import com.tbank.tevent.event.EventNotFoundException;
import com.tbank.tevent.event.EventStatusCalculator;
import com.tbank.tevent.repo.*;
import com.tbank.tevent.repo.entity.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final ExpenseParticipantRepository expenseParticipantRepository;
    private final EventRepository eventRepository;
    private final EventUserRepository eventUserRepository;
    private final UserRepository userRepository;
    private final SettlementRepository settlementRepository;

    @Transactional(readOnly = true)
    public ExpensesResponse getExpenses(UUID eventId) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        Event event = getEventAndCheckAccess(eventId, currentUserId);


        EventHeaderDTO header = buildEventHeader(event);


        List<Expense> expenses = expenseRepository.findAllByEventIdOrderByCreatedAtDesc(eventId);
        List<ExpenseDTO> expenseDTOs = expenses.stream()
                .map(exp -> mapToExpenseDTO(exp, currentUserId))
                .toList();

        ExpensesResponse response = new ExpensesResponse();
        response.setEventHeader(header);
        response.setExpenses(expenseDTOs);
        return response;
    }

    @Transactional
    public ExpenseDTO createExpense(UUID eventId, CreateExpenseRequest request) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        Event event = getEventAndCheckAccess(eventId, currentUserId);


        List<UUID> participantIds = request.getParticipantIds();
        for (UUID participantId : participantIds) {
            if (!eventUserRepository.existsByEventIdAndUserId(eventId, participantId)) {
                throw new IllegalArgumentException("User " + participantId + " is not a participant of this event");
            }
        }


        Expense expense = Expense.builder()
                .eventId(eventId)
                .title(request.getTitle())
                .amount(request.getAmount())
                .category(request.getCategory())
                .payerId(currentUserId)
                .approvalStatus("PENDING")
                .imageKey(request.getImageKey())
                .build();
        expense = expenseRepository.save(expense);


        int splitCount = participantIds.size();
        BigDecimal shareAmount = request.getAmount()
                .divide(BigDecimal.valueOf(splitCount), 2, RoundingMode.HALF_UP);


        for (UUID participantId : participantIds) {
            ExpenseParticipant ep = ExpenseParticipant.builder()
                    .expenseId(expense.getId())
                    .userId(participantId)
                    .shareAmount(shareAmount)
                    .build();
            expenseParticipantRepository.save(ep);
        }


        ExpenseParticipant payerEp = ExpenseParticipant.builder()
                .expenseId(expense.getId())
                .userId(currentUserId)
                .shareAmount(BigDecimal.ZERO)
                .build();
        expenseParticipantRepository.save(payerEp);


        recalculateSettlements(eventId);

        return mapToExpenseDTO(expense, currentUserId);
    }

    @Transactional
    public void updateStatus(UUID expenseId, ExpenseUpdateStatusRequest request) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();

        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new IllegalArgumentException("Expense not found"));

        Event event = getEventAndCheckAccess(expense.getEventId(), currentUserId);


        List<ExpenseParticipant> participants = expenseParticipantRepository.findAllByExpenseId(expenseId);
        boolean isParticipant = participants.stream()
                .anyMatch(ep -> ep.getUserId().equals(currentUserId));
        if (!isParticipant) {
            throw new AccessDeniedException("Only expense participants can change status");
        }

        expense.setApprovalStatus(request.getStatus());
        expenseRepository.save(expense);


        recalculateSettlements(expense.getEventId());
    }

    private ExpenseDTO mapToExpenseDTO(Expense expense, UUID currentUserId) {
        List<ExpenseParticipant> participants = expenseParticipantRepository.findAllByExpenseId(expense.getId());
        User payer = userRepository.findById(expense.getPayerId()).orElseThrow();


        BigDecimal perPersonAmount = participants.stream()
                .filter(ep -> ep.getUserId().equals(currentUserId))
                .findFirst()
                .map(ExpenseParticipant::getShareAmount)
                .orElse(BigDecimal.ZERO);

        ExpenseDTO dto = new ExpenseDTO();
        dto.setId(expense.getId());
        dto.setTitle(expense.getTitle());
        dto.setCategory(expense.getCategory());
        dto.setApprovalStatus(expense.getApprovalStatus());
        dto.setPayerName(payer.getFirstName() + " " + payer.getLastName());
        dto.setSplitBetweenCount(participants.size());
        dto.setCreatedAt(expense.getCreatedAt());
        dto.setTotalAmount(expense.getAmount());
        dto.setPerPersonAmount(perPersonAmount);
        dto.setImageUrl(null);
        return dto;
    }

    @Transactional
    public void recalculateSettlements(UUID eventId) {

        settlementRepository.deleteAllByEventId(eventId);


        List<EventUser> eventUsers = eventUserRepository.findAllByEventId(eventId);
        List<UUID> userIds = eventUsers.stream().map(EventUser::getUserId).toList();

        if (userIds.isEmpty()) return;


        List<Expense> expenses = expenseRepository.findAllByEventIdOrderByCreatedAtDesc(eventId)
                .stream()
                .filter(e -> !"DISPUTED".equals(e.getApprovalStatus()))
                .toList();


        Map<UUID, BigDecimal> balances = new HashMap<>();
        for (UUID userId : userIds) {
            balances.put(userId, BigDecimal.ZERO);
        }

        for (Expense expense : expenses) {
            List<ExpenseParticipant> participants = expenseParticipantRepository.findAllByExpenseId(expense.getId());


            balances.merge(expense.getPayerId(), expense.getAmount(), BigDecimal::add);


            for (ExpenseParticipant ep : participants) {
                balances.merge(ep.getUserId(), ep.getShareAmount().negate(), BigDecimal::add);
            }
        }


        List<Map.Entry<UUID, BigDecimal>> debtors = new ArrayList<>();
        List<Map.Entry<UUID, BigDecimal>> creditors = new ArrayList<>();

        for (Map.Entry<UUID, BigDecimal> entry : balances.entrySet()) {
            if (entry.getValue().compareTo(BigDecimal.ZERO) < 0) {
                debtors.add(entry);
            } else if (entry.getValue().compareTo(BigDecimal.ZERO) > 0) {
                creditors.add(entry);
            }
        }


        debtors.sort((a, b) -> a.getValue().compareTo(b.getValue()));
        creditors.sort((a, b) -> b.getValue().compareTo(a.getValue()));


        while (!debtors.isEmpty() && !creditors.isEmpty()) {
            Map.Entry<UUID, BigDecimal> debtor = debtors.getFirst();
            Map.Entry<UUID, BigDecimal> creditor = creditors.getFirst();

            BigDecimal debt = debtor.getValue().abs();
            BigDecimal credit = creditor.getValue();
            BigDecimal transferAmount = debt.min(credit);

            if (transferAmount.compareTo(BigDecimal.ZERO) > 0) {
                Settlement settlement = Settlement.builder()
                        .eventId(eventId)
                        .fromUserId(debtor.getKey())
                        .toUserId(creditor.getKey())
                        .amount(transferAmount)
                        .status("PENDING")
                        .build();
                settlementRepository.save(settlement);
            }


            BigDecimal newDebt = debtor.getValue().add(transferAmount);
            BigDecimal newCredit = creditor.getValue().subtract(transferAmount);

            if (newDebt.abs().compareTo(BigDecimal.valueOf(0.01)) < 0) {
                debtors.removeFirst();
            } else {
                debtor.setValue(newDebt);
            }

            if (newCredit.abs().compareTo(BigDecimal.valueOf(0.01)) < 0) {
                creditors.removeFirst();
            } else {
                creditor.setValue(newCredit);
            }
        }
    }

    @Transactional(readOnly = true)
    public SettlementsResponse getSettlements(UUID eventId) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        Event event = getEventAndCheckAccess(eventId, currentUserId);

        EventHeaderDTO header = buildEventHeader(event);

        List<Settlement> settlements = settlementRepository.findAllByEventId(eventId);
        List<SettlementDTO> settlementDTOs = settlements.stream()
                .map(this::mapToSettlementDTO)
                .toList();

        SettlementsResponse response = new SettlementsResponse();
        response.setEventHeader(header);
        response.setSettlements(settlementDTOs);
        return response;
    }

    @Transactional
    public void pay(UUID settlementId) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();

        Settlement settlement = settlementRepository.findById(settlementId)
                .orElseThrow(() -> new IllegalArgumentException("Settlement not found"));

        if (!settlement.getFromUserId().equals(currentUserId)) {
            throw new AccessDeniedException("Only debtor can mark as paid");
        }

        if (!"PENDING".equals(settlement.getStatus())) {
            throw new IllegalArgumentException("Settlement is not in PENDING status");
        }

        settlement.setStatus("WAITING_CONFIRMATION");
        settlementRepository.save(settlement);
    }

    @Transactional
    public void confirm(UUID settlementId) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();

        Settlement settlement = settlementRepository.findById(settlementId)
                .orElseThrow(() -> new IllegalArgumentException("Settlement not found"));

        if (!settlement.getToUserId().equals(currentUserId)) {
            throw new AccessDeniedException("Only creditor can confirm payment");
        }

        if (!"WAITING_CONFIRMATION".equals(settlement.getStatus())) {
            throw new IllegalArgumentException("Settlement is not in WAITING_CONFIRMATION status");
        }

        settlement.setStatus("COMPLETED");
        settlementRepository.save(settlement);
    }

    private SettlementDTO mapToSettlementDTO(Settlement settlement) {
        User fromUser = userRepository.findById(settlement.getFromUserId()).orElseThrow();
        User toUser = userRepository.findById(settlement.getToUserId()).orElseThrow();

        SettlementDTO dto = new SettlementDTO();
        dto.setId(settlement.getId());
        dto.setFromUser(mapToUserShortDTO(fromUser));
        dto.setToUser(mapToUserShortDTO(toUser));
        dto.setAmount(settlement.getAmount());
        dto.setStatus(settlement.getStatus());
        return dto;
    }

    private UserShortDTO mapToUserShortDTO(User user) {
        UserShortDTO dto = new UserShortDTO();
        dto.setId(user.getId());
        dto.setFullName(user.getFirstName() + " " + user.getLastName());
        dto.setAvatarUrl(null);
        dto.setInitials(getInitials(user.getFirstName(), user.getLastName()));
        return dto;
    }

    private EventHeaderDTO buildEventHeader(Event event) {
        Long participantsCount = eventUserRepository.countByEventId(event.getId());

        EventHeaderDTO header = new EventHeaderDTO();
        header.setTitle(event.getTitle());
        header.setStartDate(event.getStartDate().toLocalDate());
        header.setEndDate(event.getEndDate().toLocalDate());
        header.setStatus(EventStatusCalculator.calculate(event.getStartDate(), event.getEndDate()));
        header.setParticipantsCount(participantsCount.intValue());
        header.setParticipantAvatars(new ArrayList<>()); // без MinIO
        return header;
    }

    private Event getEventAndCheckAccess(UUID eventId, UUID userId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EventNotFoundException("Event not found"));

        boolean isParticipant = eventUserRepository.existsByEventIdAndUserId(eventId, userId);
        if (!isParticipant && !event.getOwnerId().equals(userId)) {
            throw new AccessDeniedException("Access denied: you are not a participant");
        }
        return event;
    }

    private String getInitials(String firstName, String lastName) {
        String first = firstName != null && !firstName.isEmpty() ? firstName.substring(0, 1).toUpperCase() : "";
        String last = lastName != null && !lastName.isEmpty() ? lastName.substring(0, 1).toUpperCase() : "";
        return first + last;
    }
}
