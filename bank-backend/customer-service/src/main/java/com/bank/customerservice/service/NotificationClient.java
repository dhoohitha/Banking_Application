package com.bank.customerservice.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Component
public class NotificationClient {

    private final RestTemplate rest;
    private final String baseUrl;

    public NotificationClient(RestTemplate rest,
                              @Value("${notification.service.base-url:http://localhost:8085}") String baseUrl) {
        this.rest = rest;
        this.baseUrl = baseUrl;
    }

    public void notifyKycDecision(Long customerId, String decision, String reason,
                                  String channel, String recipient) {
        String url = baseUrl + "/notify/kyc-decision";
        HttpHeaders h = new HttpHeaders(); h.setContentType(MediaType.APPLICATION_JSON);
        Map<String,Object> body = Map.of(
                "customerId", customerId,
                "decision", decision,
                "reason", reason == null ? "" : reason,
                "channel", channel,           // "SMS" or "EMAIL"
                "recipient", recipient
        );
        rest.postForEntity(url, new HttpEntity<>(body, h), Map.class);
    }
}
