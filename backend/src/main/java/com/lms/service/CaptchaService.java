package com.lms.service;

import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class CaptchaService {

    private final Map<String, String> store = new HashMap<>();

    public Map<String, String> generateCaptcha() {
        String id = UUID.randomUUID().toString();
        String code = randomCode();

        store.put(id, code);

        Map<String, String> res = new HashMap<>();
        res.put("id", id);
        res.put("code", code); // later you can send image instead
        return res;
    }

    public boolean validate(String id, String input) {
        String real = store.get(id);
        return real != null && real.equalsIgnoreCase(input);
    }

    private String randomCode() {
        String chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 5; i++) {
            sb.append(chars.charAt((int)(Math.random() * chars.length())));
        }
        return sb.toString();
    }
}