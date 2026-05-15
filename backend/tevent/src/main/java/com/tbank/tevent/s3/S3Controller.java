package com.tbank.tevent.s3;

import com.tbank.tevent.repo.entity.User;
import com.tbank.tevent.s3.dto.CreateImageUploadUrlRequest;
import com.tbank.tevent.s3.dto.DownloadUrlResponse;
import com.tbank.tevent.s3.dto.UploadUrlResponse;
import com.tbank.tevent.s3.exception.ImageUnauthorizedException;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/s3")
public class S3Controller {

    private final S3Service s3Service;

    public S3Controller(S3Service s3Service) {
        this.s3Service = s3Service;
    }

    @PostMapping("/images/upload-url")
    public ResponseEntity<UploadUrlResponse> createUploadUrl(
            @Valid @RequestBody CreateImageUploadUrlRequest request,
            Authentication authentication
    ) {
        UUID userId = authenticatedUserId(authentication);
        S3Service.PresignedUpload upload = s3Service.generateUploadUrl(userId, request.fileName(), request.contentType());
        return ResponseEntity.ok(new UploadUrlResponse(upload.imageKey(), upload.uploadUrl(), upload.expiresInSeconds()));
    }

    @GetMapping("/images/download-url")
    public ResponseEntity<DownloadUrlResponse> createDownloadUrl(
            @RequestParam("key") String imageKey,
            Authentication authentication
    ) {
        UUID userId = authenticatedUserId(authentication);
        String downloadUrl = s3Service.generateDownloadUrl(userId, imageKey);
        return ResponseEntity.ok(new DownloadUrlResponse(downloadUrl));
    }

    private UUID authenticatedUserId(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof User user)) {
            throw new ImageUnauthorizedException();
        }
        return user.getId();
    }
}
