package com.backend.app.service.impl;


import com.backend.app.model.Customer;
import com.backend.app.repository.CustomerRepository;
import com.backend.app.service.CustomerService;
import com.backend.app.service.EmailService;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CustomerServiceImpl implements CustomerService {
    private final CustomerRepository customerRepository;
    private final EmailService emailService;

    public CustomerServiceImpl(CustomerRepository customerRepository, EmailService emailService) {
        this.customerRepository = customerRepository;
        this.emailService = emailService;
    }

    private void syncSubscription(Customer customer) {
        if (customer.isSubscribed()) {
            try {
                emailService.subscribeToNewsletter(customer.getEmail(), customer.getName(), true);
            } catch (Exception e) {
                System.err.println("Failed to sync newsletter subscription: " + e.getMessage());
            }
        }
    }

    @Override
    public List<Customer> getAllCustomers() {
        return customerRepository.findAll();
    }

    @Override
    public Optional<Customer> getCustomerById(Long id) {
        return customerRepository.findById(id);
    }

    @Override
    public Customer saveCustomer(Customer customer) {
        String password = BCrypt.hashpw(customer.getPassword(), BCrypt.gensalt());
        customer.setPassword(password);

        // Save customer first
        Customer savedCustomer = customerRepository.save(customer);
        
        // Sync subscription status
        syncSubscription(savedCustomer);

        return savedCustomer;
    }

    @Override
    public Customer updateCustomer(Customer customer) {
        // Get the existing customer to check if subscription status changed
        Optional<Customer> existingCustomer = customerRepository.findById(customer.getId());
        if (existingCustomer.isPresent()) {
            Customer existing = existingCustomer.get();
            
            // Handle newsletter subscription changes
            if (customer.isSubscribed() != existing.isSubscribed()) {
                try {
                    if (customer.isSubscribed()) {
                        emailService.subscribeToNewsletter(customer.getEmail(), customer.getName(), true);
                    } else {
                        emailService.unsubscribeFromNewsletter(customer.getEmail());
                    }
                } catch (Exception e) {
                    System.err.println("Failed to update newsletter subscription: " + e.getMessage());
                }
            }

            // Only hash password if it's not empty (meaning it was changed)
            if (customer.getPassword() != null && !customer.getPassword().isEmpty()) {
                String password = BCrypt.hashpw(customer.getPassword(), BCrypt.gensalt());
                customer.setPassword(password);
            } else {
                // If password is empty, keep the existing one
                customer.setPassword(existing.getPassword());
            }
        }

        return customerRepository.save(customer);
    }

    @Override
    public void deleteCustomerById(Long id) {
        // Unsubscribe from newsletter before deleting
        Optional<Customer> customer = customerRepository.findById(id);
        if (customer.isPresent() && customer.get().isSubscribed()) {
            try {
                emailService.unsubscribeFromNewsletter(customer.get().getEmail());
            } catch (Exception e) {
                // Log error but don't fail deletion
                System.err.println("Failed to unsubscribe customer from newsletter: " + e.getMessage());
            }
        }
        
        customerRepository.deleteById(id);
    }

    @Override
    public List<Customer> getCustomersByName(String name) {
        return customerRepository.getCustomersByName(name);
    }
}
