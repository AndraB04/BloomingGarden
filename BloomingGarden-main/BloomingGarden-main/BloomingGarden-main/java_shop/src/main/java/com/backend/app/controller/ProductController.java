package com.backend.app.controller;


import com.backend.app.exception.ResourceNotFoundException;
import com.backend.app.model.Product;
import com.backend.app.service.ProductService;
import com.backend.app.utils.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RequiredArgsConstructor
@RestController
@CrossOrigin("http://localhost:4200")
@RequestMapping("/api/products")
public class ProductController {
    private final ProductService productService;

    @GetMapping
    public ResponseEntity<ApiResponse> getAllProducts() {
        List<Product> productList = productService.readAllProducts();

        return ResponseEntity.ok(ApiResponse.success("All product list", productList));
    }

    @GetMapping("/productById/{id}")
    public ResponseEntity<ApiResponse> getProductById(@PathVariable Long id) {
        Optional<Product> productById = productService.getProductById(id);
        productById.orElseThrow(() ->
                new ResourceNotFoundException("Product with id: " + id + " doesn't exist in DB"));
        return ResponseEntity.ok(ApiResponse.success("Product by id", productById.get()));
    }

    @PostMapping("/addProduct")
    public ResponseEntity<ApiResponse> saveProduct(@RequestBody Product product) {
        Product newProduct = productService.saveProduct(product);

        return ResponseEntity.ok(ApiResponse.success("Add new product with success!", newProduct));
    }

    @PutMapping("/updateProduct")
    public ResponseEntity<ApiResponse> updateProduct(@RequestBody Product product) {
        if (product.getId() == null) {
            throw new ResourceNotFoundException("Product id is not valid");
        }
        Optional<Product> roomOptional = productService.getProductById(product.getId());
        roomOptional.orElseThrow(() ->
                new ResourceNotFoundException("Product with id: " + product.getId() + " doesn't exist in DB"));

        return ResponseEntity.ok(ApiResponse.success("Update product with success!", productService.updateProduct(product)));
    }

    @DeleteMapping("/deleteProduct/{id}")
    public ResponseEntity<ApiResponse> deleteProductById(@PathVariable Long id) {
        Optional<Product> productOptional = productService.getProductById(id);

        productOptional.orElseThrow(() ->
                new ResourceNotFoundException("Product with id: " + id + " doesn't exist in DB"));

        productService.deleteProductById(id);

        return ResponseEntity.ok(ApiResponse.success("Delete product", null));
    }

}
