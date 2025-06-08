package com.backend.app.controller;

import com.backend.app.service.EmailService;
import com.backend.app.utils.ApiResponse;
import org.springframework.http.HttpStatus; // <-- Import HttpStatus
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize; // <-- CRUCIAL IMPORT
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin("http://localhost:4200") // Note: For production, be more specific with security configs
@RequestMapping("/api/newsletter")
public class NewsletterController {

    private final EmailService emailService;

    public NewsletterController(EmailService emailService) {
        this.emailService = emailService;
    }

    @PostMapping("/subscribe")
    public ResponseEntity<ApiResponse> subscribe(@RequestBody Map<String, String> request) {
        try {
            emailService.subscribeToNewsletter(
                    request.get("email"),
                    request.get("name"),
                    Boolean.parseBoolean(request.get("isCustomer"))
            );
            return ResponseEntity.ok(ApiResponse.success("Successfully subscribed to newsletter", null));
        } catch (IllegalArgumentException e) {
            // FIX: Add the status code
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(HttpStatus.BAD_REQUEST.value(), "Invalid request: " + e.getMessage()));
        } catch (IllegalStateException e) {
            // FIX: Add the status code
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(HttpStatus.BAD_REQUEST.value(), e.getMessage()));
        } catch (Exception e) {
            // FIX: Add the status code
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR.value(), "Failed to subscribe to newsletter"));
        }
    }

    @PostMapping("/unsubscribe")
    public ResponseEntity<ApiResponse> unsubscribe(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        System.out.println("Received unsubscribe request for email: " + email);
        try {
            emailService.unsubscribeFromNewsletter(email);
            System.out.println("Successfully unsubscribed email: " + email);
            return ResponseEntity.ok(ApiResponse.success("Successfully unsubscribed from newsletter", null));
        } catch (IllegalArgumentException e) {
            // FIX: Add the status code
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(HttpStatus.BAD_REQUEST.value(), "Invalid request: " + e.getMessage()));
        } catch (Exception e) {
            // FIX: Add the status code
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR.value(), "Failed to unsubscribe from newsletter"));
        }
    }

    // --- ADD SECURITY TO THIS METHOD ---
    @PostMapping("/send")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> sendNewsletter(@RequestBody Map<String, String> request) {
        try {
            List<String> subscribers = emailService.getAllSubscribers();
            if (subscribers.isEmpty()) {
                // FIX: Add the status code
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error(HttpStatus.BAD_REQUEST.value(), "No active subscribers to send newsletter to"));
            }

            emailService.sendNewsletter(
                    request.get("subject"),
                    request.get("content"),
                    subscribers.toArray(new String[0])
            );
            return ResponseEntity.ok(ApiResponse.success("Newsletter sent successfully", null));
        } catch (Exception e) {
            // FIX: Add the status code
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR.value(), "Failed to send newsletter"));
        }
    }

    // --- ADD SECURITY TO THIS METHOD ---
    @GetMapping("/subscribers")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> getSubscribers() {
        try {
            List<String> subscribers = emailService.getAllSubscribers();
            return ResponseEntity.ok(ApiResponse.success(
                    String.format("Found %d subscribers", subscribers.size()),
                    subscribers
            ));
        } catch (Exception e) {
            // FIX: Add the status code
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR.value(), "Failed to fetch subscribers"));
        }
    }
}