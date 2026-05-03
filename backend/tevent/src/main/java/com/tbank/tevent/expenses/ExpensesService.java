package com.tbank.tevent.expenses;

import com.tbank.tevent.category.Category;
import com.tbank.tevent.category.CategoryRepository;
import com.tbank.tevent.repo.entity.Event;
import com.tbank.tevent.repo.EventRepository;
import com.tbank.tevent.expenses.dto.CreateExpenseRequest;
import com.tbank.tevent.expenses.dto.ExpenseDto;
import com.tbank.tevent.expenses.exception.CategoryNotFoundException;
import com.tbank.tevent.expenses.exception.EventNotFoundException;
import com.tbank.tevent.expenses.exception.ExpenseNotFoundException;
import com.tbank.tevent.expenses.exception.ExpenseParticipantNotFoundException;
import com.tbank.tevent.expenses.exception.InvalidExpenseStatusException;
import com.tbank.tevent.expenses.exception.MissingConflictReasonException;
import com.tbank.tevent.expenses.exception.ParticipantNotFoundException;
import com.tbank.tevent.expenses.exception.UserNotFoundException;
import com.tbank.tevent.repo.entity.User;
import com.tbank.tevent.repo.UserRepository;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
public class ExpensesService {

    private static final Logger log = LoggerFactory.getLogger(ExpensesService.class);

    private final ExpenseRepository expenseRepository;
    private final ExpenseParticipantRepository expenseParticipantRepository;
    private final CategoryRepository categoryRepository;
    private final EventRepository eventRepository;
    private final UserRepository userRepository;
    private final EntityManager entityManager;

    public ExpensesService(
            ExpenseRepository expenseRepository,
            ExpenseParticipantRepository expenseParticipantRepository,
            CategoryRepository categoryRepository,
            EventRepository eventRepository,
            UserRepository userRepository,
            EntityManager entityManager
    ) {
        this.expenseRepository = expenseRepository;
        this.expenseParticipantRepository = expenseParticipantRepository;
        this.categoryRepository = categoryRepository;
        this.eventRepository = eventRepository;
        this.userRepository = userRepository;
        this.entityManager = entityManager;
    }

    @Transactional
    public List<ExpenseDto> getAllExpenses(UUID eventId) {
        List<ExpenseDto> expenses = expenseRepository.findByEventIdOrderByCreatedAtDesc(eventId).stream()
                .map(expense -> toDto(expense, expenseParticipantRepository.countByExpenseId(expense.getId())))
                .toList();

        log.info("Fetched {} expenses for eventId={}", expenses.size(), eventId);
        return expenses;
    }

    @Transactional
    public ExpenseDto createExpense(UUID eventId, CreateExpenseRequest request) {
        if (!eventRepository.existsById(eventId)) {
            throw new EventNotFoundException();
        }

        String normalizedCategoryName = request.category().trim();
        Category category = categoryRepository.findByEventIdAndNameIgnoreCase(eventId, normalizedCategoryName)
                .or(() -> categoryRepository.findByEventIsNullAndNameIgnoreCase(normalizedCategoryName))
                .orElseThrow(CategoryNotFoundException::new);

        User payer = resolveCurrentUser();

        Set<UUID> uniqueParticipantIds = new LinkedHashSet<>(request.participantIds());
        List<User> participants = userRepository.findAllById(uniqueParticipantIds);
        if (participants.size() != uniqueParticipantIds.size()) {
            throw new ParticipantNotFoundException();
        }

        Expense expense = new Expense();
        expense.setEvent(entityManager.getReference(Event.class, eventId));
        expense.setCategory(category);
        expense.setPayer(payer);
        expense.setAmount(request.amount());
        expense.setComment(request.title().trim());
        expense.setCheckUrl(request.imageKey().trim());
        expense.setExpenseDate(LocalDateTime.now());
        expense.setStatus(ExpenseStatus.PENDING);
        expense.setConflictReason(null);

        Expense savedExpense = expenseRepository.save(expense);

        for (User participant : participants) {
            ExpenseParticipant expenseParticipant = new ExpenseParticipant();
            expenseParticipant.setExpense(savedExpense);
            expenseParticipant.setUser(participant);
            expenseParticipant.setHasResponded(false);
            expenseParticipantRepository.save(expenseParticipant);
        }

        log.info("Expense created, expenseId={}, eventId={}, participants={}",
                savedExpense.getId(), eventId, participants.size());

        return toDto(savedExpense, participants.size());
    }

    @Transactional
    public void approveExpenseByParticipant(UUID expenseId, String status, String reason) {
        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(ExpenseNotFoundException::new);

        User currentUser = resolveCurrentUser();

        ExpenseParticipant participant = expenseParticipantRepository
                .findByExpenseIdAndUserId(expenseId, currentUser.getId())
                .orElseThrow(ExpenseParticipantNotFoundException::new);

        ExpenseStatus newStatus;
        try {
            newStatus = ExpenseStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new InvalidExpenseStatusException(status);
        }

        if (newStatus == ExpenseStatus.DISPUTED) {
            if (reason == null || reason.isBlank()) {
                throw new MissingConflictReasonException();
            }

            participant.setHasResponded(true);
            expenseParticipantRepository.save(participant);

            expense.setStatus(ExpenseStatus.DISPUTED);
            expense.setConflictReason(reason.trim());
            expenseRepository.save(expense);
            return;
        }

        if (newStatus != ExpenseStatus.CONFIRMED) {
            throw new InvalidExpenseStatusException(status);
        }

        participant.setHasResponded(true);
        expenseParticipantRepository.save(participant);

        if (isAllConfirmed(expense.getId())) {
            expense.setStatus(ExpenseStatus.CONFIRMED);
            expense.setConflictReason(null);
            expenseRepository.save(expense);
        }
    }

    public boolean isAllConfirmed(UUID expenseId) {
        int totalParticipants = expenseParticipantRepository.countByExpenseId(expenseId);
        int respondedCount = expenseParticipantRepository.countByExpenseIdAndHasResponded(expenseId, true);
        return totalParticipants > 0 && totalParticipants == respondedCount;
    }

    private User resolveCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) {
            throw new UserNotFoundException();
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof User user) {
            return user;
        }

        String login = authentication.getName();
        if (login == null || login.isBlank() || "anonymousUser".equals(login)) {
            throw new UserNotFoundException();
        }

        return userRepository.findByLogin(login).orElseThrow(UserNotFoundException::new);
    }

    private ExpenseDto toDto(Expense expense, int splitCount) {
        Double perPersonAmount = null;
        if (splitCount > 0) {
            perPersonAmount = expense.getAmount()
                    .divide(BigDecimal.valueOf(splitCount), 2, RoundingMode.HALF_UP)
                    .doubleValue();
        }

        return new ExpenseDto(
                expense.getId(),
                expense.getComment(),
                expense.getCategory().getName(),
                expense.getStatus(),
                expense.getPayer().getId(),
                splitCount,
                expense.getCreatedAt(),
                expense.getAmount().doubleValue(),
                perPersonAmount,
                expense.getConflictReason(),
                expense.getCheckUrl()
        );
    }
}
