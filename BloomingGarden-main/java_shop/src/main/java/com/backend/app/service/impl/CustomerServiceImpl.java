package com.backend.app.service.impl;


import com.backend.app.model.Customer;
import com.backend.app.repository.CustomerRepository;
import com.backend.app.service.CustomerService;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CustomerServiceImpl implements CustomerService {
    private CustomerRepository customerRepository;

    public CustomerServiceImpl(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
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

        return customerRepository.save(customer);
    }

    @Override
    public Customer updateCustomer(Customer customer) {
        String password = BCrypt.hashpw(customer.getPassword(), BCrypt.gensalt());
        customer.setPassword(password);

        return customerRepository.save(customer);
    }

    @Override
    public void deleteCustomerById(Long id) {
        customerRepository.deleteById(id);
    }

    @Override
    public List<Customer> getCustomersByName(String name) {
        return customerRepository.getCustomersByName(name);
    }
}
