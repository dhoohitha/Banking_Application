package com.bank.transactionservice.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.Map;

@Component
public class AccountClient {

    private final RestTemplate restTemplate;
    private final String baseUrl;

    public AccountClient(RestTemplate restTemplate,
                         @Value("${account.service.base-url:http://localhost:8082}") String baseUrl) {
        this.restTemplate = restTemplate;
        this.baseUrl = baseUrl;
    }

    public void debit(Long accountId, BigDecimal amount) {
        callAmountEndpoint(accountId, amount, "/debit");
    }

    public void credit(Long accountId, BigDecimal amount) {
        callAmountEndpoint(accountId, amount, "/credit");
    }

    private void callAmountEndpoint(Long id, BigDecimal amount, String path) {
        String url = baseUrl + "/accounts/" + id + path;
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        Map<String,Object> body = Map.of("amount", amount);
        HttpEntity<Map<String,Object>> req = new HttpEntity<>(body, headers);
        ResponseEntity<Void> resp = restTemplate.postForEntity(url, req, Void.class);
        if (!resp.getStatusCode().is2xxSuccessful()) {
            throw new IllegalStateException("Account service call failed: " + path);
        }
    }
}
