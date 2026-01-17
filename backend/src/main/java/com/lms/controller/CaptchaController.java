package com.lms.controller;

import com.lms.service.CaptchaService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/public")
public class CaptchaController {

    private final CaptchaService captchaService;

    public CaptchaController(CaptchaService captchaService) {
        this.captchaService = captchaService;
    }

    @GetMapping("/captcha")
    public Map<String, String> getCaptcha() {
        return captchaService.generateCaptcha();
    }
}