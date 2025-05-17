package com.backend.app.controller;

import com.backend.app.exception.ResourceNotFoundException;
import com.backend.app.model.PaymentStatus;
import com.backend.app.model.OrderData;
import com.backend.app.service.impl.OrderDataServiceImpl;
import com.backend.app.utils.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RestController
@CrossOrigin("http://localhost:4200")
@RequestMapping("/api/orders")
public class OrderController {
    public final OrderDataServiceImpl orderService;

    public OrderController(OrderDataServiceImpl orderService) {
        this.orderService = orderService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse> getAllOrders() {
        List<OrderData> orderDataList = orderService.getAllOrders();

        return ResponseEntity.ok(ApiResponse.success("Orders list", orderDataList));
    }

    @GetMapping("/orderById/{id}")
    public ResponseEntity<ApiResponse> getAllOrdersById(@PathVariable Long id) {
        Optional<OrderData> orderOptional = orderService.getOrderById(id);
        orderOptional.orElseThrow(() ->
                new ResourceNotFoundException("The order with id: " + id + " doesn't exist in DB"));

        return ResponseEntity.ok(ApiResponse.success("Order by id", orderOptional.get()));
    }

    @GetMapping("/ordersByDate/{date}")
    public ResponseEntity<ApiResponse> getAllOrdersByDate(@PathVariable LocalDate date) {
        List<OrderData> ordersByDateList = orderService.getOrdersByDate(date);

        return ResponseEntity.ok(ApiResponse.success("Orders by date", ordersByDateList));
    }

    @PostMapping("/addOrder")
    public ResponseEntity<ApiResponse> saveOrder(@RequestBody OrderData orderData) {
        return ResponseEntity.ok(ApiResponse.success("Add order with success.", orderService.saveOrder(orderData)));
    }

    @PutMapping("/updateOrder")
    public ResponseEntity<ApiResponse> updateOrder(@RequestBody OrderData orderData) {
        if(orderData.getId() == null){
            throw new ResourceNotFoundException("Order id is not valid");
        }
        Optional<OrderData> orderOptional = orderService.getOrderById(orderData.getId());

        orderOptional.orElseThrow(()->
                new ResourceNotFoundException("Order with id: " + orderData.getId() + " doesn't exist in DB"));

        return ResponseEntity.ok(ApiResponse.success("Update order with success.", orderService.updateOrder(orderData)));
    }

    @DeleteMapping("/deleteOrderById/{id}")
    public ResponseEntity<ApiResponse> deleteOrderById(@PathVariable Long id) {
        Optional<OrderData> orderOptional = orderService.getOrderById(id);

        orderOptional.orElseThrow(() ->
                new ResourceNotFoundException("The order with id: " + id + " doesn't exist in DB"));

        orderService.deleteOrderById(id);

        return ResponseEntity.ok(ApiResponse.success("order with id: " + id + " was deleted successfully",null));
    }

    @PostMapping("/confirmOrderById/{id}")
    public ResponseEntity<ApiResponse> confirmOrderById(@PathVariable Long id) {
        Optional<OrderData> orderOptional = orderService.getOrderById(id);

        orderOptional.orElseThrow(() ->
                new ResourceNotFoundException("The order with id: " + id + " doesn't exist in DB"));

        OrderData orderData = orderOptional.get();
        orderData.setPaymentStatus(PaymentStatus.CONFIRMED);

        orderService.saveOrder(orderData);

        return ResponseEntity.ok(ApiResponse.success("Order with id: " + id + " was confirmed successfully",null));
    }

    @PostMapping("/cancelOrderById/{id}")
    public ResponseEntity<ApiResponse> cancelOrderById(@PathVariable Long id) {
        Optional<OrderData> orderOptional = orderService.getOrderById(id);

        orderOptional.orElseThrow(() ->
                new ResourceNotFoundException("The order with id: " + id + " doesn't exist in DB"));

        OrderData orderData = orderOptional.get();
        orderData.setPaymentStatus(PaymentStatus.CANCELED);

        orderService.saveOrder(orderData);

        return ResponseEntity.ok(ApiResponse.success("Order with id: " + id + " was canceled successfully",null));
    }

}
