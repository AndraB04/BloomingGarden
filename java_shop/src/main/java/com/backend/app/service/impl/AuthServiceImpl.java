package com.backend.app.service.impl;

import com.backend.app.dto.LoginDto;
import com.backend.app.dto.RegisterDto;
import com.backend.app.exception.BadRequestException;
import com.backend.app.exception.ResourceNotFoundException;
import com.backend.app.model.Customer;
import com.backend.app.model.UserRole;
import com.backend.app.repository.CustomerRepository;
import com.backend.app.service.AuthService;
import com.backend.app.service.EmailService;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class AuthServiceImpl implements AuthService {

    private final CustomerRepository customerRepository;
    private final EmailService emailService;

    // The constructor now includes the EmailService.
    public AuthServiceImpl(CustomerRepository customerRepository, EmailService emailService) {
        this.customerRepository = customerRepository;
        this.emailService = emailService;
    }

    /**
     * SIMPLIFIED LOGIN: This method finds the user but does NOT check the password.
     * It returns a response similar to what the frontend expects, but with a FAKE token.
     */
    @Override
    public Map<String, Object> login(LoginDto loginDto) {
        Customer customer = customerRepository.getCustomerByEmail(loginDto.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + loginDto.getEmail()));

        // Add debug logging
        System.out.println("Login attempt for email: " + loginDto.getEmail());
        System.out.println("Stored hashed password: " + customer.getPassword());
        System.out.println("Attempting to verify password match...");

        // Check password
        boolean passwordMatch = BCrypt.checkpw(loginDto.getPassword(), customer.getPassword());
        System.out.println("Password match result: " + passwordMatch);

        if (!passwordMatch) {
            throw new BadRequestException("Invalid password");
        }

        // Generate JWT token (you can customize this token generation)
        String token = generateToken(customer);

        // Create the response
        Map<String, Object> userResponse = Map.of(
                "id", customer.getId(),
                "name", customer.getName(),
                "email", customer.getEmail(),
                "userRole", customer.getUserRole().name()
        );

        // Create data response with user info and token
        Map<String, Object> dataResponse = new HashMap<>();
        dataResponse.put("user", userResponse);
        dataResponse.put("token", token);

        return dataResponse;
    }

    @Override
    public Customer register(RegisterDto registerDto) {
        // Validate username
        if (registerDto.getUsername() == null || registerDto.getUsername().trim().isEmpty()) {
            throw new BadRequestException("Username is required");
        }

        // Validate email
        if (registerDto.getEmail() == null || !registerDto.getEmail().matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
            throw new BadRequestException("Valid email is required");
        }

        // Validate password
        if (registerDto.getPassword() == null || registerDto.getPassword().length() < 6) {
            throw new BadRequestException("Password must be at least 6 characters");
        }

        // Check password confirmation
        if (!registerDto.getPassword().equals(registerDto.getReTypePassword())) {
            throw new BadRequestException("Passwords do not match");
        }

        // Check if email already exists
        if (customerRepository.getCustomerByEmail(registerDto.getEmail()).isPresent()) {
            throw new BadRequestException("Email already exists");
        }

        // Create new customer
        Customer customer = new Customer();
        customer.setName(registerDto.getUsername());
        customer.setEmail(registerDto.getEmail());

        // Hash password before saving
        String hashedPassword = BCrypt.hashpw(registerDto.getPassword(), BCrypt.gensalt());
        customer.setPassword(hashedPassword);

        // Set default values
        customer.setUserRole(UserRole.CUSTOMER);
        customer.setSubscribed(true); // Set subscribed to true by default
        customer.setAddress("");
        customer.setPhone("");

        // Save customer
        Customer savedCustomer = customerRepository.save(customer);

        // Subscribe to newsletter
        try {
            emailService.subscribeToNewsletter(customer.getEmail(), customer.getName(), true);
        } catch (Exception e) {
            // Log error but don't fail registration
            System.err.println("Failed to subscribe customer to newsletter: " + e.getMessage());
        }

        return savedCustomer;
    }

    private String generateToken(Customer customer) {
        // For now, return a simple token. In production, use proper JWT implementation
        return customer.getId() + "_" + System.currentTimeMillis();
    }
}