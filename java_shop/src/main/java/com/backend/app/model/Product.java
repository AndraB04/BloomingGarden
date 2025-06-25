package com.backend.app.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

import java.util.List;
import java.math.BigDecimal;

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

    // --- MODIFICARE AICI: Schimbă 'double price' cu 'BigDecimal unitPrice' ---
    @Column(name = "product_price", nullable = false) // Poți păstra numele coloanei dacă vrei
    private BigDecimal unitPrice; // <-- Schimbă tipul și numele

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

    // Constructors
    public Product() {
    }

    public Product(Long id, String name, String description, BigDecimal unitPrice, // <-- Schimbă tipul în constructor
                   String image1, String image2, String image3, String image4,
                   ProductType productType) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.unitPrice = unitPrice;
        this.image1 = image1;
        this.image2 = image2;
        this.image3 = image3;
        this.image4 = image4;
        this.productType = productType;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    // --- MODIFICARE AICI: Getter și Setter pentru unitPrice (era price) ---
    public BigDecimal getUnitPrice() { // <-- Schimbă numele metodei și tipul returnat
        return unitPrice;
    }

    public void setUnitPrice(BigDecimal unitPrice) { // <-- Schimbă numele metodei și tipul parametrului
        this.unitPrice = unitPrice;
    }

    public String getImage1() {
        return image1;
    }

    public void setImage1(String image1) {
        this.image1 = image1;
    }

    public String getImage2() {
        return image2;
    }

    public void setImage2(String image2) {
        this.image2 = image2;
    }

    public String getImage3() {
        return image3;
    }

    public void setImage3(String image3) {
        this.image3 = image3;
    }

    public String getImage4() {
        return image4;
    }

    public void setImage4(String image4) {
        this.image4 = image4;
    }

    // --- ADĂUGARE AICI: Getter pentru imageUrl ---
    // OrderService așteaptă o metodă getImageUrl(). Putem returna image1.
    public String getImageUrl() {
        return this.image1; // Returnează URL-ul primei imagini
    }


    public ProductType getProductType() {
        return productType;
    }

    public void setProductType(ProductType productType) {
        this.productType = productType;
    }

    public List<OrderData> getOrderDataList() {
        return orderDataList;
    }

    public void setOrderDataList(List<OrderData> orderDataList) {
        this.orderDataList = orderDataList;
    }
}