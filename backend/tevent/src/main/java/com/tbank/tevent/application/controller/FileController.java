package com.tbank.tevent.application.controller;

import com.tbank.tevent.application.service.FileStorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

/**
 * Контроллер для работы с файловым хранилищем.
 */
@RestController
@RequestMapping("/api/v1/files")
@Tag(name = "Files", description = "Загрузка и управление файлами в MinIO")
public class FileController {

    private final FileStorageService fileStorageService;

    public FileController(FileStorageService fileStorageService) {
        this.fileStorageService = fileStorageService;
    }

    @PostMapping("/upload")
    @Operation(summary = "Загрузить файл в хранилище")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Файл загружен"),
            @ApiResponse(responseCode = "400", description = "Некорректный файл"),
            @ApiResponse(responseCode = "413", description = "Файл слишком большой"),
            @ApiResponse(responseCode = "500", description = "Ошибка загрузки")
    })
    public ResponseEntity<String> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("bucket") @Parameter(description = "Имя бакета") String bucketName,
            @RequestParam(value = "objectName", required = false) 
            @Parameter(description = "Имя объекта (ключа)") String objectName) throws IOException {
        
        String key = objectName != null ? objectName : file.getOriginalFilename();
        String contentType = file.getContentType();
        byte[] fileData = file.getBytes();
        
        String uploadedKey = fileStorageService.uploadFile(bucketName, key, fileData, contentType);
        return ResponseEntity.ok(uploadedKey);
    }

    @GetMapping("/url")
    @Operation(summary = "Получить временную ссылку для доступа к файлу")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Ссылка получена"),
            @ApiResponse(responseCode = "404", description = "Файл не найден")
    })
    public ResponseEntity<String> getPresignedUrl(
            @RequestParam("bucket") @Parameter(description = "Имя бакета") String bucketName,
            @RequestParam("object") @Parameter(description = "Имя объекта") String objectName,
            @RequestParam(value = "expiration", defaultValue = "3600") 
            @Parameter(description = "Время жизни ссылки в секундах") Integer expirationInSeconds) {
        
        String url = fileStorageService.getPresignedUrl(bucketName, objectName, expirationInSeconds);
        return ResponseEntity.ok(url);
    }

    @DeleteMapping
    @Operation(summary = "Удалить файл из хранилища")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Файл удален"),
            @ApiResponse(responseCode = "404", description = "Файл не найден")
    })
    public ResponseEntity<Void> deleteFile(
            @RequestParam("bucket") @Parameter(description = "Имя бакета") String bucketName,
            @RequestParam("object") @Parameter(description = "Имя объекта") String objectName) {
        
        fileStorageService.deleteFile(bucketName, objectName);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    @PostMapping("/events/{eventId}/image")
    @Operation(summary = "Загрузить изображение события")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Изображение загружено"),
            @ApiResponse(responseCode = "400", description = "Некорректный файл"),
            @ApiResponse(responseCode = "404", description = "Событие не найдено"),
            @ApiResponse(responseCode = "403", description = "Недостаточно прав")
    })
    public ResponseEntity<String> uploadEventImage(
            @PathVariable @Parameter(description = "ID события") Integer eventId,
            @RequestParam("file") MultipartFile file) throws IOException {
        
        String contentType = file.getContentType();
        byte[] fileData = file.getBytes();
        
        String imageKey = fileStorageService.uploadEventImage(eventId, fileData, contentType);
        return ResponseEntity.ok(imageKey);
    }

    @PostMapping("/expenses/{expenseId}/receipt")
    @Operation(summary = "Загрузить чек расхода")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Чек загружен"),
            @ApiResponse(responseCode = "400", description = "Некорректный файл"),
            @ApiResponse(responseCode = "404", description = "Расход не найден"),
            @ApiResponse(responseCode = "403", description = "Недостаточно прав")
    })
    public ResponseEntity<String> uploadExpenseReceipt(
            @PathVariable @Parameter(description = "ID расхода") Integer expenseId,
            @RequestParam("file") MultipartFile file) throws IOException {
        
        String contentType = file.getContentType();
        byte[] fileData = file.getBytes();
        
        String receiptKey = fileStorageService.uploadExpenseReceipt(expenseId, fileData, contentType);
        return ResponseEntity.ok(receiptKey);
    }

    @PostMapping("/users/{userId}/avatar")
    @Operation(summary = "Загрузить аватар пользователя")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Аватар загружен"),
            @ApiResponse(responseCode = "400", description = "Некорректный файл"),
            @ApiResponse(responseCode = "404", description = "Пользователь не найден"),
            @ApiResponse(responseCode = "403", description = "Недостаточно прав")
    })
    public ResponseEntity<String> uploadUserAvatar(
            @PathVariable @Parameter(description = "ID пользователя") Integer userId,
            @RequestParam("file") MultipartFile file) throws IOException {
        
        String contentType = file.getContentType();
        byte[] fileData = file.getBytes();
        
        String avatarKey = fileStorageService.uploadUserAvatar(userId, fileData, contentType);
        return ResponseEntity.ok(avatarKey);
    }
}