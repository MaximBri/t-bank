package com.tbank.tevent.s3;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tbank.tevent.exception.GlobalExceptionHandler;
import com.tbank.tevent.repo.entity.User;
import com.tbank.tevent.s3.dto.CreateImageUploadUrlRequest;
import com.tbank.tevent.s3.dto.PresignedUpload;
import com.tbank.tevent.s3.exception.ImageAccessDeniedException;
import com.tbank.tevent.s3.exception.ImageNotFoundException;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.Map;
import java.util.UUID;

import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class S3IntegrationTest {

    @Mock
    private S3Service s3Service;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        S3Controller controller = new S3Controller(s3Service);
        this.mockMvc = MockMvcBuilders.standaloneSetup(controller)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
        this.objectMapper = new ObjectMapper();
    }

    @AfterEach
    void clearSecurity() {
        SecurityContextHolder.clearContext();
    }

    private void authenticate(UUID userId) {
        User principal = User.builder().id(userId).build();
        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(principal, null, java.util.List.of());
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    @Test
    // Проверка: upload endpoint возвращает 401 при отсутствии авторизации
    void uploadWithoutAuthReturnsUnauthorized() throws Exception {
        String payload = objectMapper.writeValueAsString(Map.of(
                "content_type", "image/png",
                "file_size_bytes", 1024
        ));

        mockMvc.perform(post("/s3/upload")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("User is not authenticated"));

        verifyNoInteractions(s3Service);
    }

    @Test
    // Проверка: успешный upload возвращает image_key, upload_url и expires_in_seconds
    void uploadReturnsPresignedPayloadForAuthorizedUser() throws Exception {
        UUID userId = UUID.randomUUID();
        String imageKey = "receipts/" + userId + "/file.png";

        when(s3Service.generateUploadUrl(userId, "image/png", 2048L))
                .thenReturn(new PresignedUpload(imageKey, "https://example.com/upload", 900));

        String payload = objectMapper.writeValueAsString(Map.of(
                "content_type", "image/png",
                "file_size_bytes", 2048
        ));

        authenticate(userId);

        mockMvc.perform(post("/s3/upload")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.image_key").value(imageKey))
                .andExpect(jsonPath("$.upload_url").value("https://example.com/upload"))
                .andExpect(jsonPath("$.expires_in_seconds").value(900));

        verify(s3Service).generateUploadUrl(userId, "image/png", 2048L);
    }

    @Test
    // Проверка: upload с невалидным body возвращает 400
    void uploadWithInvalidPayloadReturnsBadRequest() throws Exception {
        String payload = objectMapper.writeValueAsString(Map.of(
                "content_type", "",
                "file_size_bytes", 2048
        ));

        authenticate(UUID.randomUUID());

        mockMvc.perform(post("/s3/upload")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isBadRequest());

        verifyNoInteractions(s3Service);
    }

    @Test
    // Проверка: download возвращает presigned ссылку для авторизованного пользователя
    void downloadReturnsPresignedUrlForAuthorizedUser() throws Exception {
        UUID userId = UUID.randomUUID();
        String imageKey = "receipts/" + userId + "/file.png";

        when(s3Service.generateDownloadUrl(imageKey)).thenReturn("https://example.com/download");

        authenticate(userId);

        mockMvc.perform(get("/s3/download")
                        .param("key", imageKey))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.download_url").value("https://example.com/download"));

        verify(s3Service).generateDownloadUrl(imageKey);
    }

    @Test
    // Проверка: download возвращает 404, когда сервис сообщает об отсутствии файла
    void downloadReturnsNotFoundWhenFileMissing() throws Exception {
        UUID userId = UUID.randomUUID();
        String imageKey = "receipts/" + userId + "/missing.png";

        when(s3Service.generateDownloadUrl(imageKey)).thenThrow(new ImageNotFoundException());

        authenticate(userId);

        mockMvc.perform(get("/s3/download")
                        .param("key", imageKey))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Image not found"));
    }

    @Test
    // Проверка: delete удаляет файл текущего пользователя и возвращает 204
    void deleteReturnsNoContentForAuthorizedUser() throws Exception {
        UUID userId = UUID.randomUUID();
        String imageKey = "receipts/" + userId + "/delete.png";

        authenticate(userId);

        mockMvc.perform(delete("/s3/delete")
                        .param("key", imageKey))
                .andExpect(status().isNoContent());

        verify(s3Service).deleteFile(userId, imageKey);
    }

    @Test
    // Проверка: delete возвращает 403 при попытке удалить чужой файл
    void deleteReturnsForbiddenWhenOwnershipMismatch() throws Exception {
        UUID userId = UUID.randomUUID();
        String foreignKey = "receipts/another-user/file.png";

        doThrow(new ImageAccessDeniedException()).when(s3Service).deleteFile(userId, foreignKey);

        authenticate(userId);

        mockMvc.perform(delete("/s3/delete")
                        .param("key", foreignKey))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value("Access to image is denied"));
    }

    @Test
    // Проверка: download endpoint возвращает 401 при отсутствии авторизации
    void downloadWithoutAuthReturnsUnauthorized() throws Exception {
        mockMvc.perform(get("/s3/download")
                        .param("key", "receipts/u/file.png"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("User is not authenticated"));

        verifyNoInteractions(s3Service);
    }
}
