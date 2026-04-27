package com.tbank.tevent.domain.model;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

/**
 * Доменная модель события
 */
public class Event {
    
    private Long id;
    private String title;
    private String description;
    private Instant startDate;
    private Instant endDate;
    private List<EventCategory> categories = new ArrayList<>();
    private EventStatus status;
    private String imageKey;
    private Long ownerId;
    private String inviteToken;
    private Instant createdAt;
    private Instant updatedAt;
    
    // Конструкторы
    
    public Event() {
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
        this.status = EventStatus.PLANNED;
    }
    
    public Event(String title, String description, Instant startDate, Instant endDate, 
                Long ownerId) {
        this();
        this.title = title;
        this.description = description;
        this.startDate = startDate;
        this.endDate = endDate;
        this.ownerId = ownerId;
    }
    
    // Бизнес-методы
    
    /**
     * Обновление статуса события на основе текущего времени
     */
    public void updateStatus() {
        this.status = EventStatus.calculateStatus(startDate, endDate);
        this.updatedAt = Instant.now();
    }
    
    /**
     * Проверка, является ли событие активным в данный момент
     */
    public boolean isActive() {
        return EventStatus.calculateStatus(startDate, endDate) == EventStatus.ACTIVE;
    }
    
    /**
     * Проверка, является ли событие завершенным
     */
    public boolean isCompleted() {
        return EventStatus.calculateStatus(startDate, endDate) == EventStatus.COMPLETED;
    }
    
    /**
     * Проверка, является ли событие запланированным
     */
    public boolean isPlanned() {
        return EventStatus.calculateStatus(startDate, endDate) == EventStatus.PLANNED;
    }
    
    /**
     * Добавление категории к событию
     */
    public void addCategory(EventCategory category) {
        if (category != null && !categories.contains(category)) {
            categories.add(category);
        }
    }
    
    /**
     * Удаление категории из события
     */
    public void removeCategory(EventCategory category) {
        categories.remove(category);
    }
    
    /**
     * Проверка, принадлежит ли событие указанной категории
     */
    public boolean hasCategory(EventCategory category) {
        return categories.contains(category);
    }
    
    /**
     * Генерация нового токена приглашения
     */
    public String generateInviteToken() {
        this.inviteToken = java.util.UUID.randomUUID().toString().replace("-", "").substring(0, 16);
        this.updatedAt = Instant.now();
        return this.inviteToken;
    }
    
    /**
     * Проверка валидности токена приглашения
     */
    public boolean isValidInviteToken(String token) {
        return Objects.equals(this.inviteToken, token);
    }
    
    // Геттеры и сеттеры
    
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
        this.updatedAt = Instant.now();
    }
    
    public String getTitle() {
        return title;
    }
    
    public void setTitle(String title) {
        this.title = title;
        this.updatedAt = Instant.now();
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
        this.updatedAt = Instant.now();
    }
    
    public Instant getStartDate() {
        return startDate;
    }
    
    public void setStartDate(Instant startDate) {
        this.startDate = startDate;
        this.updatedAt = Instant.now();
        updateStatus();
    }
    
    public Instant getEndDate() {
        return endDate;
    }
    
    public void setEndDate(Instant endDate) {
        this.endDate = endDate;
        this.updatedAt = Instant.now();
        updateStatus();
    }
    
    public List<EventCategory> getCategories() {
        return new ArrayList<>(categories);
    }
    
    public void setCategories(List<EventCategory> categories) {
        this.categories = new ArrayList<>(categories != null ? categories : List.of());
        this.updatedAt = Instant.now();
    }
    
    public EventStatus getStatus() {
        return status;
    }
    
    public void setStatus(EventStatus status) {
        this.status = status;
        this.updatedAt = Instant.now();
    }
    
    public String getImageKey() {
        return imageKey;
    }
    
    public void setImageKey(String imageKey) {
        this.imageKey = imageKey;
        this.updatedAt = Instant.now();
    }
    
    public Long getOwnerId() {
        return ownerId;
    }
    
    public void setOwnerId(Long ownerId) {
        this.ownerId = ownerId;
        this.updatedAt = Instant.now();
    }
    
    public String getInviteToken() {
        return inviteToken;
    }
    
    public void setInviteToken(String inviteToken) {
        this.inviteToken = inviteToken;
        this.updatedAt = Instant.now();
    }
    
    public Instant getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
    
    public Instant getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    // equals, hashCode, toString
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Event event = (Event) o;
        return Objects.equals(id, event.id);
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
    
    @Override
    public String toString() {
        return "Event{" +
                "id=" + id +
                ", title='" + title + '\'' +
                ", status=" + status +
                ", ownerId=" + ownerId +
                '}';
    }
}