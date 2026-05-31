package com.tbank.tevent.s3;

import com.tbank.tevent.SecurityUtils;
import com.tbank.tevent.s3.dto.CreateImageUploadUrlRequest;
import com.tbank.tevent.s3.dto.DownloadUrlResponse;
import com.tbank.tevent.s3.dto.PresignedUpload;
import com.tbank.tevent.s3.dto.UploadUrlResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/s3")
@RequiredArgsConstructor
@Tag(name = "S3", description = "Работа с загрузкой и выдачей ссылок на файлы")
public class S3Controller {

    private final S3Service s3Service;

    @PostMapping("/upload")
    @Operation(summary = "Получить presigned URL для загрузки файла")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Ссылка на загрузку создана"),
            @ApiResponse(responseCode = "400", description = "Некорректный запрос"),
            @ApiResponse(responseCode = "401", description = "Пользователь не аутентифицирован")
    })
    public ResponseEntity<UploadUrlResponse> createUploadUrl(
            @Valid @RequestBody CreateImageUploadUrlRequest request
    ) {
        UUID userId = SecurityUtils.getCurrentUserId();
        PresignedUpload upload = s3Service.generateUploadUrl(
                userId,
                request.contentType(),
                request.fileSizeBytes()
        );
        return ResponseEntity.ok(new UploadUrlResponse(upload.imageKey(), upload.uploadUrl(), upload.expiresInSeconds()));
    }

    @GetMapping("/download")
    @Operation(summary = "Получить presigned URL для скачивания файла")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Ссылка на скачивание создана"),
            @ApiResponse(responseCode = "401", description = "Пользователь не аутентифицирован"),
            @ApiResponse(responseCode = "404", description = "Файл не найден")
    })
    public ResponseEntity<DownloadUrlResponse> createDownloadUrl(
            @RequestParam("key") String imageKey
    ) {
        SecurityUtils.getCurrentUserId();
        String downloadUrl = s3Service.generateDownloadUrl(imageKey);
        return ResponseEntity.ok(new DownloadUrlResponse(downloadUrl));
    }

    @DeleteMapping("/delete")
    @Operation(summary = "Удалить файл по ключу")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Файл удален"),
            @ApiResponse(responseCode = "401", description = "Пользователь не аутентифицирован")
    })
    public ResponseEntity<Void> deleteImage(
            @RequestParam("key") String imageKey
    ) {
        UUID userId = SecurityUtils.getCurrentUserId();
        s3Service.deleteFile(userId, imageKey);
        return ResponseEntity.noContent().build();
    }
}
