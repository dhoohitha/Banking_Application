package com.bank.transactionservice.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.Map;

@Component
public class PaymentsClient {

    private final RestTemplate restTemplate;
    private final String baseUrl;

    public PaymentsClient(RestTemplate restTemplate,
                          @Value("${payments.service.base-url:http://localhost:8084}") String baseUrl) {
        this.restTemplate = restTemplate;
        this.baseUrl = baseUrl;
    }

    public boolean send(String externalId, Long fromAccountId, String name, String bankCode,
                        String acctNo, BigDecimal amount) {
        String url = baseUrl + "/payments/transfer";
        HttpHeaders h = new HttpHeaders(); h.setContentType(MediaType.APPLICATION_JSON);
        Map<String,Object> body = Map.of(
                "externalId", externalId,
                "fromAccountId", fromAccountId,
                "beneficiaryName", name,
                "beneficiaryBankCode", bankCode,
                "beneficiaryAccountNo", acctNo,
                "amount", amount
        );
        var res = restTemplate.postForEntity(url, new HttpEntity<>(body, h), Map.class);
        if (!res.getStatusCode().is2xxSuccessful() || res.getBody()==null) return false;
        Object status = res.getBody().get("status");
        return status != null && "SUCCESS".equalsIgnoreCase(status.toString());
    }
}
