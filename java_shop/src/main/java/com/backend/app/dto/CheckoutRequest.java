package com.backend.app.dto;

import lombok.Data;

import java.util.List;

@Data
public class CheckoutRequest {

    private String firstName;
    private String lastName;
    private String email;

    private String shippingStreet;
    private String shippingCity;
    private String shippingState;
    private String shippingZipCode;
    private String shippingCountry;

    private String billingStreet;
    private String billingCity;
    private String billingState;
    private String billingZipCode;
    private String billingCountry;

    private List<CheckoutItemDto> orderItems;

}