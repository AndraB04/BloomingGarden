package com.backend.app.service.impl;

import com.backend.app.dto.LoginDto;
import com.backend.app.dto.RegisterDto;
import com.backend.app.exception.BadRequestException;
import com.backend.app.exception.ResourceNotFoundException;
import com.backend.app.model.Customer;
import com.backend.app.model.UserRole;
import com.backend.app.repository.CustomerRepository;
import com.backend.app.service.AuthService;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthServiceImpl implements AuthService {
    private final CustomerRepository customerRepository;

    public AuthServiceImpl(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    @Override
    public Customer login(LoginDto loginDto) {
        if (loginDto.getEmail() == null || loginDto.getEmail().isBlank()) {
            throw new BadRequestException("The email is not valid");
        }
        if (loginDto.getPassword() == null || loginDto.getPassword().isBlank()) {
            throw new BadRequestException("The password is not valid");
        }
        Optional<Customer> customerOptional = customerRepository.getCustomerByEmail(loginDto.getEmail());
        customerOptional.orElseThrow(() ->
                new ResourceNotFoundException("The email is not registered"));

        boolean isMatch = BCrypt.checkpw(loginDto.getPassword(), customerOptional.get().getPassword());
        if (!isMatch) {
            throw new BadRequestException("Credentials not match");
        }

        return customerOptional.get();
    }

    @Override
    public Customer register(RegisterDto registerDto) {
        if (registerDto.getUsername() == null || registerDto.getUsername().isBlank()) {
            throw new BadRequestException("The username is invalid");
        }
        if (registerDto.getEmail() == null || registerDto.getEmail().isBlank()) {
            throw new BadRequestException("The email is invalid");
        }
        if (registerDto.getPassword() == null || registerDto.getPassword().isBlank()) {
            throw new BadRequestException("The password is invalid");
        }
        if (!registerDto.getPassword().equals(registerDto.getPassword())) {
            throw new BadRequestException("Passwords not match");
        }

        Optional<Customer> customerOptional = customerRepository.getCustomerByEmail(registerDto.getEmail());
        if (customerOptional.isPresent()) {
            throw new BadRequestException("Email already exist in db");
        }

        Customer customer = new Customer();
        customer.setName(registerDto.getUsername());
        customer.setEmail(registerDto.getEmail());

        String password = BCrypt.hashpw(registerDto.getPassword(), BCrypt.gensalt());
        customer.setPassword(password);
        customer.setUserRole(UserRole.CUSTOMER);

        return customerRepository.save(customer);
    }
}
