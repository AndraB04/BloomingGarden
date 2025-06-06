package com.backend.app.service;

public interface EmailService {
    void sendNewsletter(String subject, String content, String[] recipients);
    void sendEmail(String to, String subject, String content);
    void subscribeToNewsletter(String email, String name, boolean isCustomer);
    void unsubscribeFromNewsletter(String email);
    java.util.List<String> getAllSubscribers();
}
