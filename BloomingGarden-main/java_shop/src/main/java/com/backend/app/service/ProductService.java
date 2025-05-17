package com.backend.app.service;

import com.backend.app.model.Product;

import java.util.List;
import java.util.Optional;

public interface ProductService {
    List<Product> readAllProducts();

    Optional<Product> getProductById(Long id);

    Product saveProduct(Product product);

    void deleteProductById(Long id);

    Product updateProduct(Product product);
}
