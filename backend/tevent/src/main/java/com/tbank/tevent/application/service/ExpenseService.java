package com.tbank.tevent.application.service;

import com.tbank.tevent.application.dto.request.CreateExpenseRequest;
import com.tbank.tevent.application.dto.response.ExpenseDTO;
import com.tbank.tevent.domain.model.ExpenseApprovalStatus;

import java.util.List;

/**
 * Сервис для управления расходами.
 */
public interface ExpenseService {

    /**
     * Создать новый расход.
     *
     * @param eventId ID события
     * @param request данные для создания расхода
     * @return созданный расход
     */
    ExpenseDTO createExpense(Integer eventId, CreateExpenseRequest request);

    /**
     * Получить список расходов события.
     *
     * @param eventId ID события
     * @return список DTO расходов
     */
    List<ExpenseDTO> getEventExpenses(Integer eventId);

    /**
     * Получить расход по ID.
     *
     * @param expenseId ID расхода
     * @return DTO расхода
     */
    ExpenseDTO getExpense(Integer expenseId);

    /**
     * Обновить статус подтверждения расхода.
     *
     * @param expenseId ID расхода
     * @param status новый статус
     */
    void updateExpenseStatus(Integer expenseId, ExpenseApprovalStatus status);

    /**
     * Оспорить расход.
     *
     * @param expenseId ID расхода
     * @param reason причина оспаривания
     */
    void disputeExpense(Integer expenseId, String reason);

    /**
     * Удалить расход.
     *
     * @param expenseId ID расхода
     */
    void deleteExpense(Integer expenseId);

    /**
     * Получить общую сумму расходов события.
     *
     * @param eventId ID события
     * @return общая сумма
     */
    Double getTotalExpensesAmount(Integer eventId);

    /**
     * Получить среднюю сумму на участника.
     *
     * @param eventId ID события
     * @return средняя сумма на участника
     */
    Double getAveragePerParticipant(Integer eventId);

    /**
     * Получить расходы, требующие подтверждения.
     *
     * @param eventId ID события
     * @return список расходов со статусом PENDING
     */
    List<ExpenseDTO> getPendingExpenses(Integer eventId);
}