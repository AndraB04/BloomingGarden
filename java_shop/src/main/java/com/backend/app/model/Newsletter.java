package com.backend.app.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "newsletter_subscriptions")
public class Newsletter {
    @Id
    @GeneratedValue
    private Long id;
    
    @Column(unique = true)
    private String email;
    
    private String name;
    
    @Column(name = "is_customer")
    private boolean isCustomer;
    
    private boolean active = true;
}
