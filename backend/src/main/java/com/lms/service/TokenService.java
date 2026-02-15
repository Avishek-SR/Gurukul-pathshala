package com.lms.service;

import org.springframework.stereotype.Service;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.Map;
import java.time.Instant;

@Service
public class TokenService {
    // Map to store tokens, their associated courseId, and expiration time
    private final Map<String, TokenData> tokenMap = new ConcurrentHashMap<>();

    private static class TokenData {
        Long courseId;
        Instant expiry;

        TokenData(Long courseId, Instant expiry) {
            this.courseId = courseId;
            this.expiry = expiry;
        }
    }

    public String generateToken(Long courseId) {
        String token = UUID.randomUUID().toString();
        // Token valid for 70 seconds (to give some buffer over the 60s UI refresh)
        tokenMap.put(token, new TokenData(courseId, Instant.now().plusSeconds(70)));

        // Periodic cleanup would be good, but for now we'll just remove during
        // validation
        cleanupExpiredTokens();

        return token;
    }

    public Long validateToken(String token) {
        TokenData data = tokenMap.get(token);
        if (data == null)
            return null;

        if (Instant.now().isAfter(data.expiry)) {
            tokenMap.remove(token);
            return null;
        }

        // We don't remove it here because multiple students might scan the same QR
        // until the next refresh. Tokens are regenerated every 60s by faculty.
        return data.courseId;
    }

    private void cleanupExpiredTokens() {
        tokenMap.entrySet().removeIf(entry -> Instant.now().isAfter(entry.getValue().expiry));
    }
}
