package com.lms.controller.common;

import com.lms.service.FileStorageService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/files")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class FileUploadController {

    private final FileStorageService fileStorageService;

    public FileUploadController(FileStorageService fileStorageService) {
        this.fileStorageService = fileStorageService;
    }

    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadFile(@RequestParam("file") MultipartFile file) {
        String fileUrl = fileStorageService.storeFile(file);

        // In a real production environment, you'd prepend the full domain here
        // e.g., String fullUrl =
        // ServletUriComponentsBuilder.fromCurrentContextPath().path(fileUrl).toUriString();
        // For this simple local setup, we'll return the relative path which the
        // frontend can use with the base URL.

        Map<String, String> response = new HashMap<>();
        response.put("fileUrl", fileUrl);

        return ResponseEntity.ok(response);
    }
}
