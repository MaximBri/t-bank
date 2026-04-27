package com.tbank.tevent.application.service;

/**
 * Сервис для работы с файловым хранилищем (MinIO).
 */
public interface FileStorageService {

    /**
     * Загрузить файл в хранилище.
     *
     * @param bucketName имя бакета
     * @param objectName имя объекта (ключа)
     * @param fileData данные файла
     * @param contentType MIME-тип файла
     * @return ключ загруженного файла
     */
    String uploadFile(String bucketName, String objectName, byte[] fileData, String contentType);

    /**
     * Получить временную (pre-signed) ссылку для доступа к файлу.
     *
     * @param bucketName имя бакета
     * @param objectName имя объекта
     * @param expirationInSeconds время жизни ссылки в секундах
     * @return временная ссылка
     */
    String getPresignedUrl(String bucketName, String objectName, Integer expirationInSeconds);

    /**
     * Удалить файл из хранилища.
     *
     * @param bucketName имя бакета
     * @param objectName имя объекта
     */
    void deleteFile(String bucketName, String objectName);

    /**
     * Проверить существование файла.
     *
     * @param bucketName имя бакета
     * @param objectName имя объекта
     * @return true, если файл существует
     */
    boolean fileExists(String bucketName, String objectName);

    /**
     * Получить размер файла.
     *
     * @param bucketName имя бакета
     * @param objectName имя объекта
     * @return размер файла в байтах
     */
    Long getFileSize(String bucketName, String objectName);

    /**
     * Загрузить изображение события.
     *
     * @param eventId ID события
     * @param fileData данные файла
     * @param contentType MIME-тип
     * @return ключ загруженного изображения
     */
    String uploadEventImage(Integer eventId, byte[] fileData, String contentType);

    /**
     * Загрузить чек расхода.
     *
     * @param expenseId ID расхода
     * @param fileData данные файла
     * @param contentType MIME-тип
     * @return ключ загруженного чека
     */
    String uploadExpenseReceipt(Integer expenseId, byte[] fileData, String contentType);

    /**
     * Загрузить аватар пользователя.
     *
     * @param userId ID пользователя
     * @param fileData данные файла
     * @param contentType MIME-тип
     * @return ключ загруженного аватара
     */
    String uploadUserAvatar(Integer userId, byte[] fileData, String contentType);

    /**
     * Получить временную ссылку на изображение события.
     *
     * @param imageKey ключ изображения
     * @return временная ссылка
     */
    String getEventImageUrl(String imageKey);

    /**
     * Получить временную ссылку на чек расхода.
     *
     * @param receiptKey ключ чека
     * @return временная ссылка
     */
    String getExpenseReceiptUrl(String receiptKey);

    /**
     * Получить временную ссылку на аватар пользователя.
     *
     * @param avatarKey ключ аватара
     * @return временная ссылка
     */
    String getUserAvatarUrl(String avatarKey);
}