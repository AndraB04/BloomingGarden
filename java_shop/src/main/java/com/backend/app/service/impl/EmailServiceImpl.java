package com.backend.app.service.impl;

import com.backend.app.model.Newsletter;
import com.backend.app.repository.NewsletterRepository;
import com.backend.app.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class EmailServiceImpl implements EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private NewsletterRepository newsletterRepository;

    @Value("${newsletter.sender.email}")
    private String senderEmail;

    @Value("${newsletter.sender.name}")
    private String senderName;

    private static final Pattern EMAIL_PATTERN = Pattern.compile(
        "^[A-Za-z0-9+_.-]+@(.+)$"
    );

    private boolean isValidEmail(String email) {
        return email != null && EMAIL_PATTERN.matcher(email).matches();
    }

    @Override
    public void sendNewsletter(String subject, String content, String[] recipients) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(String.format("%s <%s>", senderName, senderEmail));
        message.setTo(recipients);
        message.setSubject(subject);
        
        // Add unsubscribe footer
        String fullContent = content + "\n\n---\n" +
            "To unsubscribe from our newsletter, click here: " +
            "http://localhost:4200/unsubscribe?email=${recipient}";
        
        message.setText(fullContent);
        mailSender.send(message);
    }

    @Override
    public void sendEmail(String to, String subject, String content) {
        if (!isValidEmail(to)) {
            throw new IllegalArgumentException("Invalid email address");
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(String.format("%s <%s>", senderName, senderEmail));
        message.setTo(to);
        message.setSubject(subject);
        message.setText(content);
        mailSender.send(message);
    }

    @Override
    public void subscribeToNewsletter(String email, String name, boolean isCustomer) {
        if (!isValidEmail(email)) {
            throw new IllegalArgumentException("Invalid email address");
        }

        // Check for existing subscription
        newsletterRepository.findByEmail(email).ifPresent(subscription -> {
            if (subscription.isActive()) {
                throw new IllegalStateException("Email is already subscribed to the newsletter");
            }
            // If found but inactive, reactivate it
            subscription.setActive(true);
            subscription.setName(name);
            subscription.setCustomer(isCustomer);
            newsletterRepository.save(subscription);
            return;
        });

        // Create new subscription
        Newsletter subscription = new Newsletter();
        subscription.setEmail(email);
        subscription.setName(name);
        subscription.setCustomer(isCustomer);
        newsletterRepository.save(subscription);
        
        // Send welcome email
        String welcomeContent = String.format(
            "Dear %s,\n\n" +
            "Thank you for subscribing to our newsletter! You'll receive updates about our latest products and offers.\n\n" +
            "To unsubscribe at any time, click here: http://localhost:4200/unsubscribe?email=%s\n\n" +
            "Best regards,\n%s",
            name, email, senderName
        );
        
        sendEmail(email, "Welcome to Our Newsletter!", welcomeContent);
    }

    @Override
    public void unsubscribeFromNewsletter(String email) {
        if (!isValidEmail(email)) {
            throw new IllegalArgumentException("Invalid email address");
        }

        Newsletter subscription = newsletterRepository.findByEmail(email)
            .orElseThrow(() -> new IllegalArgumentException("Email is not subscribed to the newsletter"));
            
        subscription.setActive(false);
        newsletterRepository.save(subscription);
        
        // Send confirmation email
        String confirmationContent = String.format(
            "Dear %s,\n\n" +
            "You have been successfully unsubscribed from our newsletter.\n\n" +
            "If this was a mistake, you can resubscribe at any time by visiting our website.\n\n" +
            "Best regards,\n%s",
            subscription.getName(), senderName
        );
        
        sendEmail(email, "Newsletter Unsubscription Confirmed", confirmationContent);
    }

    @Override
    public List<String> getAllSubscribers() {
        return newsletterRepository.findByActiveTrue()
            .stream()
            .map(Newsletter::getEmail)
            .collect(Collectors.toList());
    }
}
