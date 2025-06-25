package com.backend.app.dto;

import lombok.Data;

@Data
public class CheckoutItemDto {

    private Long productId;
    private int quantity;

}