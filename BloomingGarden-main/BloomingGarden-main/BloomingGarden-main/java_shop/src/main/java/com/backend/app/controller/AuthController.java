package com.backend.app.controller;

import com.backend.app.dto.LoginDto;
import com.backend.app.dto.RegisterDto;
import com.backend.app.model.Customer;
import com.backend.app.service.AuthService;
import com.backend.app.utils.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin("http://localhost:4200")
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse> login(@RequestBody LoginDto loginDto) {
        Customer customer = authService.login(loginDto);

        return ResponseEntity.ok(ApiResponse.success("Welcome " + customer.getName(), customer));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse> register(@RequestBody RegisterDto registerDto) {
        authService.register(registerDto);

        return ResponseEntity.ok(ApiResponse.success("Registered with success", null));
    }
}
