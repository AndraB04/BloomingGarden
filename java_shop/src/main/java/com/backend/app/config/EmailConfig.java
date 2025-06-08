package com.backend.app.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class EmailConfig {
    @Value("${newsletter.ratelimit.max-per-hour:100}")
    private int maxEmailsPerHour;

    @Value("${newsletter.ratelimit.max-recipients-per-mail:50}")
    private int maxRecipientsPerEmail;

    @Value("${app.frontend.url:http://localhost:4200}")
    private String baseUrl;

    public int getMaxEmailsPerHour() {
        return maxEmailsPerHour;
    }

    public int getMaxRecipientsPerEmail() {
        return maxRecipientsPerEmail;
    }

    public String getBaseUrl() {
        return baseUrl;
    }
}
