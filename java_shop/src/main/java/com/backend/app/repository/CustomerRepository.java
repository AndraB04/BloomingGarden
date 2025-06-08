package com.backend.app.repository;

import com.backend.app.model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {

    // Your existing methods
    List<Customer> getCustomersByName(String name);
    Optional<Customer> getCustomerByEmail(String email);

    // --- ADD THIS METHOD ---
    // Spring Data JPA will automatically create the query for you
    // It will look for all customers where the 'subscribed' field is true.
    List<Customer> findBySubscribedTrue();
}