package com.backend.app.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;

import java.util.List;

@Data
@Entity
@Table(name = "products")
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;
    @Column(name = "product_name", nullable = false)
    private String name;
    @Column(name = "product_description", columnDefinition = "text", nullable = false)
    private String description;
    @Column(name = "product_price", nullable = false)
    private double price;
    @Column(name = "product_image_1")
    private String image1;
    @Column(name = "product_image_2")
    private String image2;
    @Column(name = "product_image_3")
    private String image3;
    @Column(name = "product_image_4")
    private String image4;
    @Column(name = "product_category")
    @Enumerated(value = EnumType.STRING)
    private ProductType productType;

    @ManyToMany(mappedBy = "productList", fetch = FetchType.LAZY)
    @JsonIgnoreProperties("productList")
    private List<OrderData> orderDataList;


}
