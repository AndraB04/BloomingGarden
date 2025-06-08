package com.backend.app.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

import java.util.List;

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

    // Constructors
    public Product() {
    }

    public Product(Long id, String name, String description, double price, 
                  String image1, String image2, String image3, String image4, 
                  ProductType productType) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.price = price;
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

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
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
