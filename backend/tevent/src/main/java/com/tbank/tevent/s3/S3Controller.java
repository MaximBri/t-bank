package com.tbank.tevent.s3;

import com.tbank.tevent.repo.entity.User;
import com.tbank.tevent.s3.dto.CreateImageUploadUrlRequest;
import com.tbank.tevent.s3.dto.DownloadUrlResponse;
import com.tbank.tevent.s3.dto.UploadUrlResponse;
import com.tbank.tevent.s3.exception.ImageUnauthorizedException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/s3")
@RequiredArgsConstructor
public class S3Controller {

    private final S3Service s3Service;

    @PostMapping("/upload")
    public ResponseEntity<UploadUrlResponse> createUploadUrl(
            @Valid @RequestBody CreateImageUploadUrlRequest request,
            Authentication authentication
    ) {
        UUID userId = authenticatedUserId(authentication);
        S3Service.PresignedUpload upload = s3Service.generateUploadUrl(
                userId,
                request.fileName(),
                request.contentType(),
                request.fileSizeBytes()
        );
        return ResponseEntity.ok(new UploadUrlResponse(upload.imageKey(), upload.uploadUrl(), upload.expiresInSeconds()));
    }

    @GetMapping("/download")
    public ResponseEntity<DownloadUrlResponse> createDownloadUrl(
            @RequestParam("key") String imageKey,
            Authentication authentication
    ) {
        UUID userId = authenticatedUserId(authentication);
        String downloadUrl = s3Service.generateDownloadUrl(userId, imageKey);
        return ResponseEntity.ok(new DownloadUrlResponse(downloadUrl));
    }

    @DeleteMapping("/delete")
    public ResponseEntity<Void> deleteImage(
            @RequestParam("key") String imageKey,
            Authentication authentication
    ) {
        UUID userId = authenticatedUserId(authentication);
        s3Service.deleteFile(userId, imageKey);
        return ResponseEntity.noContent().build();
    }

    private UUID authenticatedUserId(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof User user)) {
            throw new ImageUnauthorizedException();
        }
        return user.getId();
    }
}
