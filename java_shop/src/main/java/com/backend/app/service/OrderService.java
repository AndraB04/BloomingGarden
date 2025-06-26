package com.backend.app.service;

import com.backend.app.dto.CheckoutRequest;
import com.backend.app.dto.CheckoutItemDto;
import com.backend.app.model.*;
import com.backend.app.repository.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;
import java.util.List;
import java.util.Optional;
import java.util.ArrayList;

@Service
public class OrderService {

    private CustomerRepository customerRepository;
    private ProductRepository productRepository;
    private OrderRepository orderRepository;
    private OrderDataRepository orderDataRepository;

    @Autowired
    public OrderService(CustomerRepository customerRepository,
                        ProductRepository productRepository,
                        OrderRepository orderRepository,
                        OrderDataRepository orderDataRepository) {
        this.customerRepository = customerRepository;
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
        this.orderDataRepository = orderDataRepository;
    }

    @Transactional
    public Order placeOrder(CheckoutRequest checkoutRequest) {

        Order order = new Order();

        String orderTrackingNumber = generateOrderTrackingNumber();
        order.setOrderTrackingNumber(orderTrackingNumber);

        order.setDateCreated(LocalDateTime.now());
        order.setLastUpdated(LocalDateTime.now());
        order.setStatus("PENDING");

        BigDecimal totalAmount = BigDecimal.ZERO;
        int totalQuantity = 0;

        List<CheckoutItemDto> orderItemsDto = checkoutRequest.getOrderItems();

        if (orderItemsDto != null && !orderItemsDto.isEmpty()) {
            for (CheckoutItemDto itemDto : orderItemsDto) {
                Product product = productRepository.findById(itemDto.getProductId())
                        .orElseThrow(() -> new RuntimeException("Product not found with id: " + itemDto.getProductId()));

                OrderItem orderItem = new OrderItem();
                orderItem.setQuantity(itemDto.getQuantity());
                orderItem.setUnitPrice(product.getUnitPrice());
                orderItem.setProduct(product);
                orderItem.setImageUrl(product.getImageUrl());

                order.add(orderItem);

                totalAmount = totalAmount.add(orderItem.getUnitPrice().multiply(BigDecimal.valueOf(orderItem.getQuantity())));
                totalQuantity += itemDto.getQuantity();
            }
        }

        order.setTotalAmount(totalAmount);
        order.setTotalQuantity(totalQuantity);

        order.setShippingStreet(checkoutRequest.getShippingStreet());
        order.setShippingCity(checkoutRequest.getShippingCity());
        order.setShippingState(checkoutRequest.getShippingState());
        order.setShippingZipCode(checkoutRequest.getShippingZipCode());
        order.setShippingCountry(checkoutRequest.getShippingCountry());

        order.setBillingStreet(checkoutRequest.getBillingStreet());
        order.setBillingCity(checkoutRequest.getBillingCity());
        order.setBillingState(checkoutRequest.getBillingState());
        order.setBillingZipCode(checkoutRequest.getBillingZipCode());
        order.setBillingCountry(checkoutRequest.getBillingCountry());


        Optional<Customer> optionalCustomer = customerRepository.getCustomerByEmail(checkoutRequest.getEmail());

        Customer customer;
        if (optionalCustomer.isPresent()) {
            customer = optionalCustomer.get();
        } else {
            customer = new Customer();
            customer.setFirstName(checkoutRequest.getFirstName());
            customer.setLastName(checkoutRequest.getLastName());
            customer.setName(checkoutRequest.getFirstName() + " " + checkoutRequest.getLastName());
            customer.setEmail(checkoutRequest.getEmail());
            customer.setPassword(""); // Set a default empty password for checkout customers
            customer.setUserRole(UserRole.CUSTOMER); // Need to import UserRole
            customer.setSubscribed(false);
            customerRepository.save(customer);
        }

        order.setCustomer(customer);
        customer.add(order);

        // Save the main order first
        Order savedOrder = orderRepository.save(order);

        // Create and save OrderData for dashboard compatibility
        createOrderDataFromOrder(savedOrder, checkoutRequest);

        return savedOrder;
    }

    private String generateOrderTrackingNumber() {
        return UUID.randomUUID().toString();
    }

    private void createOrderDataFromOrder(Order order, CheckoutRequest checkoutRequest) {
        OrderData orderData = new OrderData();
        
        // Set basic order information
        orderData.setDate(LocalDate.now());
        orderData.setTotal(order.getTotalAmount().doubleValue());
        
        // Create details string from shipping and checkout info
        String details = String.format("Order for %s %s - Shipping: %s, %s, %s %s", 
            checkoutRequest.getFirstName(), 
            checkoutRequest.getLastName(),
            checkoutRequest.getShippingStreet(),
            checkoutRequest.getShippingCity(),
            checkoutRequest.getShippingState(),
            checkoutRequest.getShippingZipCode());
        orderData.setDetails(details);
        
        // Set payment status as PENDING
        orderData.setPaymentStatus(PaymentStatus.PENDING);
        
        // Set customer
        orderData.setCustomer(order.getCustomer());
        
        // Convert OrderItems to Product list
        List<Product> productList = new ArrayList<>();
        if (order.getOrderItems() != null) {
            for (OrderItem orderItem : order.getOrderItems()) {
                productList.add(orderItem.getProduct());
            }
        }
        orderData.setProductList(productList);
        
        // Save OrderData
        orderDataRepository.save(orderData);
    }
}