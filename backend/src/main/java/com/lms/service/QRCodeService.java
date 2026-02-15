package com.lms.service;

import io.jsonwebtoken.Jwts;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Service
public class QRCodeService {

    private final SecretKey key = Jwts.SIG.HS256.key().build(); // Using random key for simplicity
    private static final long EXPIRATION_TIME = 60 * 1000; // 1 minute

    public String generateToken(Long courseId, String facultyId) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("courseId", courseId);
        claims.put("facultyId", facultyId);
        claims.put("type", "attendance_qr");

        return Jwts.builder()
                .claims(claims)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(key)
                .compact();
    }

    public Long validateToken(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload()
                    .get("courseId", Long.class);
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid or expired QR token");
        }
    }
}
