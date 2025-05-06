package com.backend.app.service;

import com.backend.app.dto.LoginDto;
import com.backend.app.dto.RegisterDto;
import com.backend.app.model.Customer;

public interface AuthService {

    Customer login(LoginDto loginDto);
    Customer register(RegisterDto registerDto);
}
