package com.backend.app.service;

import com.backend.app.dto.LoginDto;
import com.backend.app.dto.RegisterDto;
import com.backend.app.model.Customer;
import java.util.Map; // Import Map

public interface AuthService {
    Map<String, Object> login(LoginDto loginDto); // <-- CHANGE RETURN TYPE HERE
    Customer register(RegisterDto registerDto);
}