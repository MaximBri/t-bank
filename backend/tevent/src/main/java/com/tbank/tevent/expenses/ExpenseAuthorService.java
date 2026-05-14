package com.tbank.tevent.expenses;

import com.tbank.tevent.SecurityUtils;
import com.tbank.tevent.category.CategoryRepository;
import com.tbank.tevent.repo.*;
import com.tbank.tevent.repo.entity.*;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExpenseAuthorService {
    private final ExpenseRepository expenseRepository;
    private final EventRepository eventRepository;
    private final ExpenseSplitRepository splitRepository;
    private final ExpenseCategoryRepository expenseCategoryRepository;
    private final CategoryRepository categoryRepository;

    private static final List<String> VISIBLE_STATUSES = List.of("PENDING", "CONFIRMED", "REJECTED");

    @Transactional
    public UUID createExpense(UUID eventId, CreateExpenseRequest request) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EntityNotFoundException("Event not found"));

        if (request.participantIds() != null && request.participantIds().contains(currentUserId)) {
            throw new IllegalArgumentException("Вы не можете добавить себя в список должников.");
        }

        Expense expense = Expense.builder()
                .eventId(eventId)
                .payerId(currentUserId)
                .title(request.title())
                .description(request.description())
                .amount(request.totalAmount())
                .imageUrl(request.imageUrl())
                .status("PENDING")
                .createdAt(LocalDateTime.now())
                .build();

        Expense saved = expenseRepository.saveAndFlush(expense);
        syncCategories(saved.getId(), request.categories());
        processSplits(saved.getId(), request.totalAmount(), request.participantIds());
        return saved.getId();
    }

    @Transactional(readOnly = true)
    public EventExpensesResponse getEventExpenses(UUID eventId) {
        // Показываем только те, что прошли стадию планирования или уже подтверждены
        List<Expense> expenses = expenseRepository.findAllByEventIdAndStatusInOrderByCreatedAtDesc(eventId, VISIBLE_STATUSES);

        if (expenses.isEmpty()) return new EventExpensesResponse(List.of(), BigDecimal.ZERO);

        List<UUID> ids = expenses.stream().map(Expense::getId).toList();

        Map<UUID, List<String>> catMap = loadCategories(ids);
        Map<UUID, List<UUID>> participantMap = loadParticipants(ids);

        List<ExpenseResponse> items = expenses.stream().map(e -> {
            List<UUID> debtors = participantMap.getOrDefault(e.getId(), List.of());
            return new ExpenseResponse(
                    e.getId(),
                    e.getTitle(),
                    e.getDescription(),
                    e.getAmount(),
                    e.getPayerId(),
                    e.getStatus(),
                    catMap.getOrDefault(e.getId(), List.of()),
                    debtors.stream().limit(10).toList(),
                    debtors.size(),
                    e.getCreatedAt()
            );
        }).toList();

        BigDecimal total = items.stream()
                .map(ExpenseResponse::totalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new EventExpensesResponse(items, total);
    }

    @Transactional
    public void updateExpense(UUID eventId, UUID expenseId, CreateExpenseRequest request) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        Expense expense = expenseRepository.findById(expenseId).orElseThrow();

        if (!expense.getPayerId().equals(currentUserId)) {
            throw new AccessDeniedException("Только плательщик может редактировать расход.");
        }

        expense.setDescription(request.description());
        expense.setAmount(request.totalAmount());
        expense.setImageUrl(request.imageUrl());
        expense.setStatus("PLANNED");
        expenseRepository.save(expense);

        expenseCategoryRepository.deleteAllByExpenseId(expenseId);
        syncCategories(expenseId, request.categories());

        splitRepository.deleteAllByExpenseId(expenseId);
        processSplits(expenseId, request.totalAmount(), request.participantIds());
    }

    @Transactional
    public void deleteExpense(UUID eventId, UUID expenseId) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new EntityNotFoundException("Expense not found"));

        // 1. Проверка прав: Удалить может только плательщик
        if (!expense.getPayerId().equals(currentUserId)) {
            throw new AccessDeniedException("Только плательщик может удалить расход");
        }

        expenseCategoryRepository.deleteAllByExpenseId(expenseId);
        splitRepository.deleteAllByExpenseId(expenseId);
        expenseRepository.delete(expense);
    }

    private void processSplits(UUID expenseId, BigDecimal total, List<UUID> participants) {
        if (participants.isEmpty()) return;

        int totalPeople = participants.size() + 1;
        BigDecimal share = total.divide(BigDecimal.valueOf(totalPeople), 2, RoundingMode.HALF_UP);

        List<ExpenseSplit> splits = participants.stream()
                .map(userId -> ExpenseSplit.builder()
                        .expenseId(expenseId)
                        .userId(userId)
                        .amount(share)
                        .isConfirmed(false)
                        .build())
                .toList();

        splitRepository.saveAll(splits);
    }

    private void syncCategories(UUID expenseId, List<String> names) {
        if (names == null || names.isEmpty()) return;
        for (String name : names) {
            Category category = categoryRepository.findByName(name)
                    .orElseGet(() -> categoryRepository.save(Category.builder().name(name).build()));

            ExpenseCategory ec = new ExpenseCategory();
            ec.setExpenseId(expenseId);
            ec.setCategoryId(category.getId());
            expenseCategoryRepository.save(ec);
        }
    }

    private Map<UUID, List<String>> loadCategories(List<UUID> expenseIds) {
        return expenseCategoryRepository.findAllCategoryNamesByExpenseIds(expenseIds).stream()
                .collect(Collectors.groupingBy(
                        ExpenseCategoryNameView::getExpenseId,
                        Collectors.mapping(ExpenseCategoryNameView::getCategoryName, Collectors.toList())
                ));
    }

    private Map<UUID, List<UUID>> loadParticipants(List<UUID> expenseIds) {
        return splitRepository.findAllByExpenseIdIn(expenseIds).stream()
                .collect(Collectors.groupingBy(
                        ExpenseSplit::getExpenseId,
                        Collectors.mapping(ExpenseSplit::getUserId, Collectors.toList())
                ));
    }

    private void updateEventVersion(UUID eventId) {
        eventRepository.findById(eventId).ifPresent(e -> {
            e.setUpdatedAt(LocalDateTime.now());
            eventRepository.save(e);
        });
    }

    @Transactional
    public void approveExpense(UUID eventId, UUID expenseId) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();


        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EntityNotFoundException("Event not found"));

        if (!event.getOwnerId().equals(currentUserId)) {
            throw new AccessDeniedException("Только организатор может подтверждать расходы.");
        }


        Expense expense = expenseRepository.findByIdAndEventId(expenseId, eventId)
                .orElseThrow(() -> new EntityNotFoundException("Expense not found in this event"));

        if (!"PENDING".equals(expense.getStatus())) {
            throw new IllegalStateException("Можно подтвердить только расходы в статусе PENDING.");
        }


        expense.setStatus("CONFIRMED");
        expenseRepository.save(expense);

    }

    @Transactional
    public void rejectExpense(UUID eventId, UUID expenseId) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EntityNotFoundException("Event not found"));

        if (!event.getOwnerId().equals(currentUserId)) {
            throw new AccessDeniedException("Только организатор может отклонять расходы.");
        }

        Expense expense = expenseRepository.findByIdAndEventId(expenseId, eventId)
                .orElseThrow(() -> new EntityNotFoundException("Expense not found"));

        expense.setStatus("REJECTED");
        expenseRepository.save(expense);
    }
}
