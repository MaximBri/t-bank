package com.tbank.tevent.expenses;

import com.tbank.tevent.notifications.NotificationService;
import com.tbank.tevent.repo.ExpenseSplitRepository;
import com.tbank.tevent.repo.entity.Expense;
import com.tbank.tevent.repo.entity.ExpenseSplit;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Service
@RequiredArgsConstructor
@Transactional
public class ExpenseSplitService {

    private final ExpenseSplitRepository splitRepository;
    private final NotificationService notificationService;

    public void createEqualSplits(UUID expenseId, List<UUID> participantIds, BigDecimal totalAmount) {
        validateParticipants(participantIds);

        Map<UUID, BigDecimal> calculatedAmounts = calculateEqualAmountsMap(participantIds, totalAmount);

        List<ExpenseSplit> splits = calculatedAmounts.entrySet().stream()
                .map(entry -> ExpenseSplit.builder()
                        .expenseId(expenseId)
                        .userId(entry.getKey())
                        .amount(entry.getValue())
                        .isConfirmed(false)
                        .build())
                .toList();

        splitRepository.saveAll(splits);
    }

    public void processEqualSplitsDelta(Expense expense, List<UUID> newParticipantIds, BigDecimal newTotalAmount) {
        validateParticipants(newParticipantIds);

        List<ExpenseSplit> oldSplits = splitRepository.findAllByExpenseId(expense.getId());
        Map<UUID, ExpenseSplit> oldSplitsMap = oldSplits.stream()
                .collect(Collectors.toMap(ExpenseSplit::getUserId, Function.identity()));

        Map<UUID, BigDecimal> targetAmountsMap = calculateEqualAmountsMap(newParticipantIds, newTotalAmount);


        executeRemovals(expense, oldSplitsMap, targetAmountsMap.keySet());
        executeAdditions(expense.getId(), oldSplitsMap.keySet(), targetAmountsMap);
        executeUpdates(oldSplitsMap, targetAmountsMap);
    }

    public void confirm(UUID expenseId, UUID userId) {
        ExpenseSplit split = splitRepository.findByExpenseIdAndUserId(expenseId, userId)
                .orElseThrow(() -> new EntityNotFoundException("Доля в расходе для данного пользователя не найдена"));

        split.setIsConfirmed(true);
        splitRepository.save(split);
    }

    @Transactional(readOnly = true)
    public boolean areAllSplitsConfirmed(UUID expenseId) {
        List<ExpenseSplit> splits = splitRepository.findAllByExpenseId(expenseId);
        return !splits.isEmpty() && splits.stream()
                .allMatch(split -> Boolean.TRUE.equals(split.getIsConfirmed()));
    }

    public void deleteSplitsByExpense(UUID expenseId) {
        splitRepository.deleteByExpenseId(expenseId);
    }

    @Transactional(readOnly = true)
    public void notifyParticipantsAboutDeletion(Expense expense) {
        List<UUID> participantIds = splitRepository.findAllByExpenseId(expense.getId()).stream()
                .map(ExpenseSplit::getUserId)
                .filter(userId -> !userId.equals(expense.getPayerId()))
                .toList();

        if (participantIds.isEmpty()) return;

        notificationService.createNotifications(
                participantIds,
                expense.getEventId(),
                expense.getId(),
                "Удаление расхода",
                String.format("Расход '%s' был удален автором.", expense.getTitle())
        );
    }

    private void validateParticipants(List<UUID> participantIds) {
        if (participantIds == null || participantIds.isEmpty()) {
            throw new IllegalArgumentException("Список участников чека не может быть пустым");
        }
    }

    private Map<UUID, BigDecimal> calculateEqualAmountsMap(List<UUID> participantIds, BigDecimal totalAmount) {
        int size = participantIds.size();
        BigDecimal baseAmount = totalAmount.divide(BigDecimal.valueOf(size), 2, RoundingMode.HALF_UP);
        BigDecimal remainder = totalAmount.subtract(baseAmount.multiply(BigDecimal.valueOf(size)));

        return IntStream.range(0, size).boxed()
                .collect(Collectors.toMap(
                        participantIds::get,
                        i -> (i == 0) ? baseAmount.add(remainder) : baseAmount
                ));
    }

    private void executeRemovals(Expense expense, Map<UUID, ExpenseSplit> oldSplitsMap, Set<UUID> targetUserIds) {
        List<ExpenseSplit> splitsToDelete = oldSplitsMap.keySet().stream()
                .filter(userId -> !targetUserIds.contains(userId))
                .map(oldSplitsMap::get)
                .toList();

        if (splitsToDelete.isEmpty()) return;

        splitRepository.deleteAll(splitsToDelete);

        List<UUID> removedUserIds = splitsToDelete.stream()
                .map(ExpenseSplit::getUserId)
                .toList();

        notificationService.createNotifications(
                removedUserIds,
                expense.getEventId(),
                expense.getId(),
                "Исключение из расхода",
                String.format("Вы были удалены из расхода '%s'", expense.getTitle())
        );
    }

    private void executeAdditions(UUID expenseId, Set<UUID> oldUserIds, Map<UUID, BigDecimal> targetAmountsMap) {
        targetAmountsMap.entrySet().stream()
                .filter(entry -> !oldUserIds.contains(entry.getKey()))
                .map(entry -> ExpenseSplit.builder()
                        .expenseId(expenseId)
                        .userId(entry.getKey())
                        .amount(entry.getValue())
                        .isConfirmed(false)
                        .build())
                .forEach(splitRepository::save);
    }

    private void executeUpdates(Map<UUID, ExpenseSplit> oldSplitsMap, Map<UUID, BigDecimal> targetAmountsMap) {
        targetAmountsMap.entrySet().stream()
                .filter(entry -> oldSplitsMap.containsKey(entry.getKey()))
                .forEach(entry -> {
                    UUID userId = entry.getKey();
                    BigDecimal newAmount = entry.getValue();
                    ExpenseSplit existingSplit = oldSplitsMap.get(userId);


                    if (existingSplit.getAmount().compareTo(newAmount) != 0) {
                        existingSplit.setAmount(newAmount);
                        existingSplit.setIsConfirmed(false);
                        splitRepository.save(existingSplit);
                    }

                });
    }
}
