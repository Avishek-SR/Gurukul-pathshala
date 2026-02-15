package com.lms.dto;

public class LoginRequest {

    @com.fasterxml.jackson.annotation.JsonProperty("userId")
    private String userId;
    @com.fasterxml.jackson.annotation.JsonProperty("password")
    private String password;

    // CAPTCHA fields (real LMS behavior)
    @com.fasterxml.jackson.annotation.JsonProperty("captchaId")
    private String captchaId;
    @com.fasterxml.jackson.annotation.JsonProperty("captchaValue")
    private String captchaValue;

    // Constructors
    public LoginRequest() {
    }

    public LoginRequest(String userId, String password, String captchaId, String captchaValue) {
        this.userId = userId;
        this.password = password;
        this.captchaId = captchaId;
        this.captchaValue = captchaValue;
    }

    @Override
    public String toString() {
        return "LoginRequest{userId='" + userId + "'}";
    }

    // Getters and Setters
    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getCaptchaId() {
        return captchaId;
    }

    public void setCaptchaId(String captchaId) {
        this.captchaId = captchaId;
    }

    public String getCaptchaValue() {
        return captchaValue;
    }

    public void setCaptchaValue(String captchaValue) {
        this.captchaValue = captchaValue;
    }
}