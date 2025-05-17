package com.backend.app.service;

import com.backend.app.model.OrderData;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface OrderDataService {

    Optional<OrderData> getOrderById(Long id);
    List<OrderData> getAllOrders();
    OrderData saveOrder(OrderData orderData);
    OrderData updateOrder(OrderData orderData);
    void deleteOrderById(Long id);
    List<OrderData> getOrdersByDate(LocalDate date);
}
