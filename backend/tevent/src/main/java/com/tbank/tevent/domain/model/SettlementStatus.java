package com.tbank.tevent.domain.model;

/**
 * Статус взаиморасчета.
 */
public enum SettlementStatus {
    PENDING,               // долг висит (кнопка "Оплатить")
    WAITING_CONFIRMATION,  // должник нажал "Оплатить" (кнопка "Подтвердить" у получателя)
    COMPLETED              // деньги получены (кнопка исчезает)
}