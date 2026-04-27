package com.tbank.tevent.domain.model;

import java.time.LocalDateTime;

/**
 * Участник события.
 */
public class Participant {

    private Integer id;
    private User user;
    private Event event;
    private ParticipantRole role;
    private ParticipantStatus status;
    private LocalDateTime joinedAt;
    private LocalDateTime invitedAt;
    private String invitationToken;

    public Participant() {
    }

    public Participant(User user, Event event, ParticipantRole role, ParticipantStatus status) {
        this.user = user;
        this.event = event;
        this.role = role;
        this.status = status;
        this.joinedAt = LocalDateTime.now();
        this.invitedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Event getEvent() {
        return event;
    }

    public void setEvent(Event event) {
        this.event = event;
    }

    public ParticipantRole getRole() {
        return role;
    }

    public void setRole(ParticipantRole role) {
        this.role = role;
    }

    public ParticipantStatus getStatus() {
        return status;
    }

    public void setStatus(ParticipantStatus status) {
        this.status = status;
    }

    public LocalDateTime getJoinedAt() {
        return joinedAt;
    }

    public void setJoinedAt(LocalDateTime joinedAt) {
        this.joinedAt = joinedAt;
    }

    public LocalDateTime getInvitedAt() {
        return invitedAt;
    }

    public void setInvitedAt(LocalDateTime invitedAt) {
        this.invitedAt = invitedAt;
    }

    public String getInvitationToken() {
        return invitationToken;
    }

    public void setInvitationToken(String invitationToken) {
        this.invitationToken = invitationToken;
    }

    /**
     * Проверяет, является ли участник владельцем события.
     */
    public boolean isOwner() {
        return ParticipantRole.OWNER.equals(role);
    }

    /**
     * Проверяет, принял ли участник приглашение.
     */
    public boolean isAccepted() {
        return ParticipantStatus.ACCEPTED.equals(status);
    }

    /**
     * Принимает приглашение.
     */
    public void acceptInvitation() {
        this.status = ParticipantStatus.ACCEPTED;
        this.joinedAt = LocalDateTime.now();
    }

    /**
     * Отклоняет приглашение.
     */
    public void rejectInvitation() {
        this.status = ParticipantStatus.INVITED; // или можно добавить статус REJECTED
    }

    @Override
    public String toString() {
        return "Participant{" +
                "id=" + id +
                ", user=" + (user != null ? user.getId() : null) +
                ", event=" + (event != null ? event.getId() : null) +
                ", role=" + role +
                ", status=" + status +
                ", joinedAt=" + joinedAt +
                '}';
    }
}