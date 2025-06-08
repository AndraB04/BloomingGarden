package com.backend.app.controller;

import com.backend.app.dto.LoginDto;
import com.backend.app.dto.RegisterDto;
import com.backend.app.model.Customer;
import com.backend.app.service.AuthService;
import com.backend.app.utils.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map; // Import the Map interface

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse> login(@RequestBody LoginDto loginDto) {
        try {
            // --- CORRECTED LOGIC ---
            // 1. The login method now returns a Map<String, Object>
            Map<String, Object> responseData = authService.login(loginDto);

            // 2. We wrap this map in our standard success response.
            //    The 'data' field of our ApiResponse will contain the user and the token.
            return ResponseEntity.ok(ApiResponse.success("Login successful", responseData));

        } catch (Exception e) {
            // If login fails (bad password, etc.), the service throws an exception.
            // We catch it and return a 401 Unauthorized response.
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error(HttpStatus.UNAUTHORIZED.value(), "Invalid email or password"));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse> register(@RequestBody RegisterDto registerDto) {
        try {
            System.out.println("Received registration request for email: " + registerDto.getEmail());
            Customer customer = authService.register(registerDto);
            System.out.println("Successfully registered user with ID: " + customer.getId());
            return ResponseEntity.ok(ApiResponse.success("Registered successfully", customer));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(HttpStatus.BAD_REQUEST.value(), e.getMessage()));
        }
    }
}