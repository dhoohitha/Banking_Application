package com.bank.accountservice.service;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Component
public class CustomerClient {

    private final RestTemplate restTemplate;

    // adjust to your customer-service base URL/port
    private final String customerServiceBase = "http://localhost:8081";

    public CustomerClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public String getKycStatus(Long customerId) {
        String url = customerServiceBase + "/customers/" + customerId;
        ResponseEntity<Map> resp = restTemplate.getForEntity(url, Map.class);
        if (!resp.getStatusCode().is2xxSuccessful() || resp.getBody() == null) {
            throw new RuntimeException("Unable to fetch customer details");
        }
        Object status = resp.getBody().get("kycStatus");
        return status == null ? null : status.toString();
    }
}
