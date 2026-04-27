package com.tbank.tevent.domain.model;

import java.time.LocalDateTime;

/**
 * Взаиморасчет между участниками события.
 */
public class Settlement {

    private Integer id;
    private User fromUser;
    private User toUser;
    private Event event;
    private Double amount;
    private SettlementStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime paidAt;
    private LocalDateTime confirmedAt;
    private String paymentMethod;
    private String transactionId;

    public Settlement() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.status = SettlementStatus.PENDING;
    }

    public Settlement(User fromUser, User toUser, Event event, Double amount) {
        this();
        this.fromUser = fromUser;
        this.toUser = toUser;
        this.event = event;
        this.amount = amount;
    }

    // Getters and Setters
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public User getFromUser() {
        return fromUser;
    }

    public void setFromUser(User fromUser) {
        this.fromUser = fromUser;
    }

    public User getToUser() {
        return toUser;
    }

    public void setToUser(User toUser) {
        this.toUser = toUser;
    }

    public Event getEvent() {
        return event;
    }

    public void setEvent(Event event) {
        this.event = event;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public SettlementStatus getStatus() {
        return status;
    }

    public void setStatus(SettlementStatus status) {
        this.status = status;
        this.updatedAt = LocalDateTime.now();
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public LocalDateTime getPaidAt() {
        return paidAt;
    }

    public void setPaidAt(LocalDateTime paidAt) {
        this.paidAt = paidAt;
    }

    public LocalDateTime getConfirmedAt() {
        return confirmedAt;
    }

    public void setConfirmedAt(LocalDateTime confirmedAt) {
        this.confirmedAt = confirmedAt;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(String transactionId) {
        this.transactionId = transactionId;
    }

    /**
     * Инициировать оплату.
     */
    public void initiatePayment(String paymentMethod) {
        this.status = SettlementStatus.WAITING_CONFIRMATION;
        this.paymentMethod = paymentMethod;
        this.paidAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * Подтвердить получение оплаты.
     */
    public void confirmPayment() {
        this.status = SettlementStatus.COMPLETED;
        this.confirmedAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * Отменить взаиморасчет.
     */
    public void cancel() {
        this.status = SettlementStatus.PENDING;
        this.paidAt = null;
        this.confirmedAt = null;
        this.paymentMethod = null;
        this.transactionId = null;
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * Проверить, завершен ли взаиморасчет.
     */
    public boolean isCompleted() {
        return SettlementStatus.COMPLETED.equals(status);
    }

    /**
     * Проверить, ожидает ли подтверждения.
     */
    public boolean isWaitingConfirmation() {
        return SettlementStatus.WAITING_CONFIRMATION.equals(status);
    }

    /**
     * Проверить, является ли взаиморасчет ожидающим.
     */
    public boolean isPending() {
        return SettlementStatus.PENDING.equals(status);
    }

    /**
     * Получить описание взаиморасчета.
     */
    public String getDescription() {
        return String.format("%s должен %s %.2f руб.", 
                fromUser != null ? fromUser.getFullName() : "Unknown",
                toUser != null ? toUser.getFullName() : "Unknown",
                amount);
    }

    @Override
    public String toString() {
        return "Settlement{" +
                "id=" + id +
                ", fromUser=" + (fromUser != null ? fromUser.getId() : null) +
                ", toUser=" + (toUser != null ? toUser.getId() : null) +
                ", event=" + (event != null ? event.getId() : null) +
                ", amount=" + amount +
                ", status=" + status +
                ", createdAt=" + createdAt +
                '}';
    }
}