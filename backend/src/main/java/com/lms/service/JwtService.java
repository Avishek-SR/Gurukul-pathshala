package com.lms.service;

import com.lms.model.User;
import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class JwtService {

    private static final Logger logger = LoggerFactory.getLogger(JwtService.class);

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration}")
    private Long jwtExpiration;

    private SecretKey getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(jwtSecret);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    // Generate token from Authentication object
    public String generateToken(Authentication authentication) {
        User userPrincipal = (User) authentication.getPrincipal();

        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", userPrincipal.getUserId());
        claims.put("name", userPrincipal.getName());

        String role = userPrincipal.getRole() != null ? userPrincipal.getRole().name() : "STUDENT";
        claims.put("role", role);

        claims.put("authorities", authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList()));

        return Jwts.builder()
                .claims(claims)
                .subject(userPrincipal.getEmail())
                .issuedAt(new Date())
                .expiration(new Date((new Date()).getTime() + jwtExpiration))
                .signWith(getSigningKey(), Jwts.SIG.HS256)
                .compact();
    }

    // Generate token from User entity directly
    public String generateToken(User user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", user.getUserId());
        claims.put("name", user.getName());

        // FIX: Handle Null Role safely
        String role = user.getRole() != null ? user.getRole().name() : "STUDENT";
        claims.put("role", role);

        // Add default authority based on role
        claims.put("authorities", java.util.Collections.singletonList("ROLE_" + role));

        return Jwts.builder()
                .claims(claims)
                .subject(user.getEmail())
                .issuedAt(new Date())
                .expiration(new Date((new Date()).getTime() + jwtExpiration))
                .signWith(getSigningKey(), Jwts.SIG.HS256)
                .compact();
    }

    // Generate refresh token
    public String generateRefreshToken(Authentication authentication) {
        User userPrincipal = (User) authentication.getPrincipal();

        return Jwts.builder()
                .subject(userPrincipal.getEmail())
                .issuedAt(new Date())
                .expiration(new Date((new Date()).getTime() + jwtExpiration * 7)) // 7 days
                .signWith(getSigningKey(), Jwts.SIG.HS256)
                .compact();
    }

    // Extract username (email) from token
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    // Extract user ID from token
    public String extractUserId(String token) {
        return extractClaim(token, claims -> claims.get("userId", String.class));
    }

    // Extract role from token
    public String extractRole(String token) {
        return extractClaim(token, claims -> claims.get("role", String.class));
    }

    // Extract authorities from token with robust handling
    public java.util.List<String> extractAuthorities(String token) {
        return extractClaim(token, claims -> {
            // 1. Try "authorities" claim (List<String> or List<Map>)
            Object authoritiesClaim = claims.get("authorities");

            if (authoritiesClaim instanceof java.util.List<?>) {
                java.util.List<?> list = (java.util.List<?>) authoritiesClaim;
                if (!list.isEmpty()) {
                    // Case A: List of Strings ["ROLE_ADMIN"]
                    if (list.get(0) instanceof String) {
                        @SuppressWarnings("unchecked")
                        java.util.List<String> strList = (java.util.List<String>) list;
                        return strList;
                    }
                    // Case B: List of Maps/Objects (if serialized as objects)
                    else if (list.get(0) instanceof java.util.Map) {
                        return list.stream()
                                .map(item -> ((java.util.Map<?, ?>) item).get("authority").toString())
                                .collect(Collectors.toList());
                    }
                }
            }

            // 2. Fallback to "role" claim (String) - e.g. "ADMIN"
            String role = claims.get("role", String.class);
            if (role != null) {
                // Return as singleton list, ensuring ROLE_ prefix
                return java.util.Collections.singletonList(role.startsWith("ROLE_") ? role : "ROLE_" + role);
            }

            return java.util.Collections.emptyList();
        });
    }

    // Extract expiration date from token
    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    // Generic method to extract claims
    public <T> T extractClaim(String token, java.util.function.Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    // Extract all claims from token
    private Claims extractAllClaims(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (ExpiredJwtException e) {
            logger.warn("JWT token expired: {}", e.getMessage());
            throw e;
        } catch (UnsupportedJwtException e) {
            logger.error("Unsupported JWT token: {}", e.getMessage());
            throw e;
        } catch (MalformedJwtException e) {
            logger.error("Invalid JWT token: {}", e.getMessage());
            throw e;
        } catch (SecurityException e) {
            logger.error("Invalid JWT signature: {}", e.getMessage());
            throw e;
        } catch (IllegalArgumentException e) {
            logger.error("JWT claims string is empty: {}", e.getMessage());
            throw e;
        }
    }

    // Validate token
    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            logger.error("Invalid JWT token: {}", e.getMessage());
            return false;
        }
    }

    // Check if token is expired
    public boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    // Get remaining time until expiration
    public Long getRemainingTimeMs(String token) {
        Date expiration = extractExpiration(token);
        Date now = new Date();
        return expiration.getTime() - now.getTime();
    }
}