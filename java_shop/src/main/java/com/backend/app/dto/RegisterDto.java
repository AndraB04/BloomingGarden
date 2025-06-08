package com.backend.app.dto;

public class RegisterDto {
    private String username;
    private String email;
    private String password;
    private String reTypePassword;

    // Constructors
    public RegisterDto() {
    }

    public RegisterDto(String username, String email, String password, String reTypePassword) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.reTypePassword = reTypePassword;
    }

    // Getters and Setters
    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getReTypePassword() {
        return reTypePassword;
    }

    public void setReTypePassword(String reTypePassword) {
        this.reTypePassword = reTypePassword;
    }
}
