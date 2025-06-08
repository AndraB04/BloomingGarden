package com.backend.app.service.impl;

import com.backend.app.model.Newsletter;
import com.backend.app.repository.NewsletterRepository;
import com.backend.app.service.EmailService;
import com.backend.app.config.EmailConfig;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import java.util.Arrays;

@Service
public class EmailServiceImpl implements EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private NewsletterRepository newsletterRepository;

    @Autowired
    private EmailConfig emailConfig;

    @Value("${newsletter.sender.email}")
    private String senderEmail;

    @Value("${newsletter.sender.name}")
    private String senderName;

    private final Map<String, Integer> hourlyEmailCount = new ConcurrentHashMap<>();

    private static final Pattern EMAIL_PATTERN = Pattern.compile(
        "^[a-zA-Z0-9_!#$%&'*+/=?`{|}~^.-]+@[a-zA-Z0-9.-]+$"
    );

    private boolean isValidEmail(String email) {
        return email != null && EMAIL_PATTERN.matcher(email).matches();
    }

    private void checkRateLimit(String email) {
        String hourKey = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHH"));
        int count = hourlyEmailCount.getOrDefault(hourKey, 0);
        if (count >= emailConfig.getMaxEmailsPerHour()) {
            throw new RuntimeException("Email rate limit exceeded. Please try again in the next hour.");
        }
        hourlyEmailCount.put(hourKey, count + 1);
    }

    private void cleanupOldRateLimits() {
        String currentHour = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHH"));
        hourlyEmailCount.keySet().removeIf(key -> !key.equals(currentHour));
    }

    @Override
    public void sendNewsletter(String subject, String content, String[] recipients) {
        if (recipients == null || recipients.length == 0) {
            throw new IllegalArgumentException("No recipients provided for newsletter");
        }

        cleanupOldRateLimits();

        try {
            // Split recipients into batches to avoid exceeding email server limits
            int batchSize = emailConfig.getMaxRecipientsPerEmail();
            for (int i = 0; i < recipients.length; i += batchSize) {
                String[] batch = Arrays.copyOfRange(
                    recipients, i, 
                    Math.min(i + batchSize, recipients.length)
                );

                checkRateLimit("newsletter");
                
                SimpleMailMessage message = new SimpleMailMessage();
                message.setFrom(String.format("%s <%s>", senderName, senderEmail));
                message.setBcc(batch); // Use BCC for privacy
                message.setSubject(subject);
                
                // Add unsubscribe footer with proper URL
                String unsubscribeUrl = emailConfig.getBaseUrl() + "/unsubscribe";
                String fullContent = content + "\n\n---\n" +
                    "To unsubscribe from our newsletter, click here: " +
                    unsubscribeUrl + "?email=${recipient}";
                
                message.setText(fullContent);
                mailSender.send(message);
                
                // Add small delay between batches to prevent overwhelming the mail server
                if (i + batchSize < recipients.length) {
                    Thread.sleep(1000);
                }
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to send newsletter: " + e.getMessage(), e);
        }
    };

    @Override
    public void sendEmail(String to, String subject, String content) {
        if (!isValidEmail(to)) {
            throw new IllegalArgumentException("Invalid email address");
        }

        cleanupOldRateLimits();
        checkRateLimit(to);

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(String.format("%s <%s>", senderName, senderEmail));
            message.setTo(to);
            message.setSubject(subject);
            message.setText(content);
            mailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("Failed to send email: " + e.getMessage(), e);
        }
    }

    @Override
    public void subscribeToNewsletter(String email, String name, boolean isCustomer) {
        if (!isValidEmail(email)) {
            throw new IllegalArgumentException("Invalid email address");
        }

        try {
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
            });

            // Create new subscription if not found
            Newsletter subscription = new Newsletter();
            subscription.setEmail(email);
            subscription.setName(name);
            subscription.setCustomer(isCustomer);
            newsletterRepository.save(subscription);
            
            // Send welcome email
            String welcomeContent = String.format(
                "Dear %s,\n\n" +
                "Thank you for subscribing to our newsletter! You'll receive updates about our latest products and offers.\n\n" +
                "To unsubscribe at any time, click here: %s/unsubscribe?email=%s\n\n" +
                "Best regards,\n%s",
                name.isEmpty() ? "Valued Customer" : name,
                emailConfig.getBaseUrl(),
                email,
                senderName
            );
            
            sendEmail(email, "Welcome to Our Newsletter!", welcomeContent);
        } catch (Exception e) {
            throw new RuntimeException("Failed to subscribe to newsletter: " + e.getMessage(), e);
        }
    }

    @Override
    public void unsubscribeFromNewsletter(String email) {
        if (!isValidEmail(email)) {
            throw new IllegalArgumentException("Invalid email address");
        }

        try {
            Newsletter subscription = newsletterRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Email is not subscribed to the newsletter"));
                
            subscription.setActive(false);
            newsletterRepository.save(subscription);
            
            // Send confirmation email
            String confirmationContent = String.format(
                "Dear %s,\n\n" +
                "You have been successfully unsubscribed from our newsletter.\n\n" +
                "If this was a mistake, you can resubscribe at any time by visiting:\n" +
                "%s/subscribe\n\n" +
                "Best regards,\n%s",
                subscription.getName() != null && !subscription.getName().isEmpty() 
                    ? subscription.getName() 
                    : "Valued Customer",
                emailConfig.getBaseUrl(),
                senderName
            );
            
            sendEmail(email, "Newsletter Unsubscription Confirmed", confirmationContent);
        } catch (Exception e) {
            throw new RuntimeException("Failed to unsubscribe from newsletter: " + e.getMessage(), e);
        }
    }

    @Override
    public List<String> getAllSubscribers() {
        try {
            return newsletterRepository.findByActiveTrue()
                .stream()
                .map(Newsletter::getEmail)
                .collect(Collectors.toList());
        } catch (Exception e) {
            throw new RuntimeException("Failed to get subscribers: " + e.getMessage(), e);
        }
    }
}
