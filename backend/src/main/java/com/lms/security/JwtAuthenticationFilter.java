package com.lms.security;

import com.lms.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    private final JwtService jwtService;

    public JwtAuthenticationFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        try {
            final String authHeader = request.getHeader("Authorization");

            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                filterChain.doFilter(request, response);
                return;
            }

            final String jwt = authHeader.substring(7);

            if (jwtService.validateToken(jwt)) {
                String userId = jwtService.extractUserId(jwt); // Use userId as principal
                java.util.List<String> roles = jwtService.extractAuthorities(jwt);

                logger.debug("Processing JWT for UserID: {}", userId);
                logger.debug("Extracted Roles from JWT: {}", roles);

                if (userId != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    // Create authorities from token
                    java.util.List<org.springframework.security.core.authority.SimpleGrantedAuthority> authorities;

                    if (roles != null) {
                        authorities = roles.stream()
                                .map(role -> {
                                    // Ensure ROLE_ prefix if missing (safety check)
                                    String authRole = role.startsWith("ROLE_") ? role : "ROLE_" + role;
                                    return new org.springframework.security.core.authority.SimpleGrantedAuthority(
                                            authRole);
                                })
                                .collect(java.util.stream.Collectors.toList());
                    } else {
                        authorities = java.util.Collections.emptyList();
                    }

                    // Create authentication token with userId (String) as principal
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userId,
                            null,
                            authorities);

                    logger.info("Setting authentication for user: {}", userId);
                    logger.info("Final Authorities set in SecurityContext: {}", authorities);

                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);

                    logger.debug("Authenticated user: {}, Authorities: {}", userId, authorities);
                }
            } else {
                logger.warn("JWT validation failed for token: {}...", jwt.substring(0, Math.min(jwt.length(), 10)));
            }
        } catch (Exception e) {
            logger.error("Cannot set user authentication: {}", e.getMessage());
        }

        filterChain.doFilter(request, response);
    }
}