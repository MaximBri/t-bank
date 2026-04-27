package com.tbank.tevent.domain.model;

/**
 * Статус приглашения.
 */
public enum InvitationStatus {
    PENDING_APPROVAL,  // вы постучались, ждете овнера
    INVITED,           // овнер сам вас позвал, ждет вашего "Да"
    REJECTED           // овнер отклонил вашу заявку
}