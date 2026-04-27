package com.tbank.tevent.domain.model;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

/**
 * Расход в событии.
 */
public class Expense {

    private Integer id;
    private String title;
    private Double amount;
    private ExpenseCategory category;
    private ExpenseApprovalStatus approvalStatus;
    private User payer;
    private Event event;
    private Set<Participant> splitBetween = new HashSet<>();
    private String imageKey;
    private String disputeReason;
    private LocalDateTime disputedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Expense() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.approvalStatus = ExpenseApprovalStatus.PENDING;
    }

    public Expense(String title, Double amount, ExpenseCategory category, User payer, Event event) {
        this();
        this.title = title;
        this.amount = amount;
        this.category = category;
        this.payer = payer;
        this.event = event;
    }

    // Getters and Setters
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public ExpenseCategory getCategory() {
        return category;
    }

    public void setCategory(ExpenseCategory category) {
        this.category = category;
    }

    public ExpenseApprovalStatus getApprovalStatus() {
        return approvalStatus;
    }

    public void setApprovalStatus(ExpenseApprovalStatus approvalStatus) {
        this.approvalStatus = approvalStatus;
        this.updatedAt = LocalDateTime.now();
    }

    public User getPayer() {
        return payer;
    }

    public void setPayer(User payer) {
        this.payer = payer;
    }

    public Event getEvent() {
        return event;
    }

    public void setEvent(Event event) {
        this.event = event;
    }

    public Set<Participant> getSplitBetween() {
        return splitBetween;
    }

    public void setSplitBetween(Set<Participant> splitBetween) {
        this.splitBetween = splitBetween;
    }

    public String getImageKey() {
        return imageKey;
    }

    public void setImageKey(String imageKey) {
        this.imageKey = imageKey;
    }

    public String getDisputeReason() {
        return disputeReason;
    }

    public void setDisputeReason(String disputeReason) {
        this.disputeReason = disputeReason;
    }

    public LocalDateTime getDisputedAt() {
        return disputedAt;
    }

    public void setDisputedAt(LocalDateTime disputedAt) {
        this.disputedAt = disputedAt;
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

    /**
     * Добавить участника для разделения расхода.
     */
    public void addParticipant(Participant participant) {
        this.splitBetween.add(participant);
    }

    /**
     * Удалить участника из разделения расхода.
     */
    public void removeParticipant(Participant participant) {
        this.splitBetween.remove(participant);
    }

    /**
     * Рассчитать сумму на одного участника.
     */
    public Double getPerPersonAmount() {
        if (splitBetween.isEmpty()) {
            return amount;
        }
        return amount / splitBetween.size();
    }

    /**
     * Оспорить расход.
     */
    public void dispute(String reason) {
        this.approvalStatus = ExpenseApprovalStatus.DISPUTED;
        this.disputeReason = reason;
        this.disputedAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * Подтвердить расход.
     */
    public void confirm() {
        this.approvalStatus = ExpenseApprovalStatus.CONFIRMED;
        this.disputeReason = null;
        this.disputedAt = null;
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * Проверить, оспорен ли расход.
     */
    public boolean isDisputed() {
        return ExpenseApprovalStatus.DISPUTED.equals(approvalStatus);
    }

    /**
     * Проверить, подтвержден ли расход.
     */
    public boolean isConfirmed() {
        return ExpenseApprovalStatus.CONFIRMED.equals(approvalStatus);
    }

    @Override
    public String toString() {
        return "Expense{" +
                "id=" + id +
                ", title='" + title + '\'' +
                ", amount=" + amount +
                ", category=" + category +
                ", approvalStatus=" + approvalStatus +
                ", payer=" + (payer != null ? payer.getId() : null) +
                ", event=" + (event != null ? event.getId() : null) +
                ", splitBetweenCount=" + splitBetween.size() +
                ", createdAt=" + createdAt +
                '}';
    }
}