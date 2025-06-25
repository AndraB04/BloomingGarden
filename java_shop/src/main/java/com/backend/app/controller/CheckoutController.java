package com.backend.app.controller;

import com.backend.app.dto.CheckoutRequest;
import com.backend.app.model.Order; // Importă entitatea Order - asigură-te că este com.backend.app.model.Order
import com.backend.app.service.OrderService; // Importă serviciul - asigură-te că este com.backend.app.service.OrderService
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map; // Asigură-te că ai import pentru Map

@CrossOrigin(origins = "http://localhost:4200") // Ajustează portul dacă e diferit
@RestController
@RequestMapping("/api/checkout") // Endpoint-ul pentru checkout
public class CheckoutController {

    private OrderService orderService;

    @Autowired // Folosește constructor injection
    public CheckoutController(OrderService orderService) { // Aici se injectează OrderService
        this.orderService = orderService;
    }

    @PostMapping("/purchase") // Metoda care gestionează cererea POST către /api/checkout/purchase
    public ResponseEntity<Map<String, String>> placeOrder(@RequestBody CheckoutRequest checkoutRequest) {

        // Apelează metoda din Service pentru a plasa comanda
        Order order = orderService.placeOrder(checkoutRequest);

        // Construiește răspunsul pentru Angular
        // Poți returna ID-ul comenzii, numărul de tracking sau un mesaj de succes
        Map<String, String> response = Map.of(
                "orderTrackingNumber", order.getOrderTrackingNumber(),
                "message", "Order placed successfully!" // Adaugă un mesaj
        );

        return new ResponseEntity<>(response, HttpStatus.CREATED); // Returnează 201 Created
    }

    // Poți adăuga alte endpoint-uri aici dacă e necesar, ex: pentru a obține metode de plată disponibile etc.
}