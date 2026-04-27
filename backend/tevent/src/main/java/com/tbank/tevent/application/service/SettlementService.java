package com.tbank.tevent.application.service;

import com.tbank.tevent.application.dto.response.SettlementDTO;
import com.tbank.tevent.domain.model.SettlementStatus;

import java.util.List;

/**
 * Сервис для управления взаиморасчетами.
 */
public interface SettlementService {

    /**
     * Получить список взаиморасчетов для события.
     *
     * @param eventId ID события
     * @return список DTO взаиморасчетов
     */
    List<SettlementDTO> getEventSettlements(Integer eventId);

    /**
     * Получить список долгов текущего пользователя в событии.
     *
     * @param eventId ID события
     * @return список DTO взаиморасчетов, где текущий пользователь является должником
     */
    List<SettlementDTO> getUserDebts(Integer eventId);

    /**
     * Инициировать оплату долга.
     *
     * @param settlementId ID взаиморасчета
     */
    void initiatePayment(Integer settlementId);

    /**
     * Подтвердить получение оплаты.
     *
     * @param settlementId ID взаиморасчета
     */
    void confirmPayment(Integer settlementId);

    /**
     * Отменить взаиморасчет.
     *
     * @param settlementId ID взаиморасчета
     */
    void cancelSettlement(Integer settlementId);

    /**
     * Обновить статус взаиморасчета.
     *
     * @param settlementId ID взаиморасчета
     * @param status новый статус
     */
    void updateSettlementStatus(Integer settlementId, SettlementStatus status);

    /**
     * Пересчитать взаиморасчеты для события.
     * Этот метод запускает асинхронный расчет через Jobrunr.
     *
     * @param eventId ID события
     */
    void recalculateSettlements(Integer eventId);

    /**
     * Получить общую сумму долгов пользователя в событии.
     *
     * @param eventId ID события
     * @param userId ID пользователя
     * @return общая сумма долгов
     */
    Double getTotalUserDebt(Integer eventId, Integer userId);

    /**
     * Проверить, есть ли у пользователя долги в событии.
     *
     * @param eventId ID события
     * @param userId ID пользователя
     * @return true, если есть долги
     */
    boolean hasUserDebts(Integer eventId, Integer userId);

    /**
     * Получить взаиморасчет по ID.
     *
     * @param settlementId ID взаиморасчета
     * @return DTO взаиморасчета
     */
    SettlementDTO getSettlement(Integer settlementId);
}