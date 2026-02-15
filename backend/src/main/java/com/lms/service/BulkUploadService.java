package com.lms.service;

import com.lms.model.User;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

public interface BulkUploadService {
    List<User> uploadUsers(MultipartFile file, String role);
}
