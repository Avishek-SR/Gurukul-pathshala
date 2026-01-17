package com.lms.config;

import java.util.Arrays;
import java.util.List;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

@Configuration
public class CorsConfig {

  @Bean
  public CorsFilter corsFilter() {
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    CorsConfiguration config = new CorsConfiguration();

    // Allow credentials
    config.setAllowCredentials(true);

    // FIX: Use setAllowedOrigins instead of setAllowedOriginPatterns
    config.setAllowedOrigins(
        Arrays.asList("http://localhost:3000")); // Remove patterns, use exact origins

    // Allow specific headers - ADD Authorization header explicitly
    config.setAllowedHeaders(
        Arrays.asList(
            "Origin",
            "Content-Type",
            "Accept",
            "Authorization", // This is CRITICAL for JWT
            "X-Requested-With",
            "Access-Control-Request-Method",
            "Access-Control-Request-Headers"));

    // Allow specific methods
    config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));

    // Expose headers
    config.setExposedHeaders(Arrays.asList("Authorization", "Content-Type", "Content-Disposition"));

    // Set max age
    config.setMaxAge(3600L);

    source.registerCorsConfiguration("/**", config);
    return new CorsFilter(source);
  }
}