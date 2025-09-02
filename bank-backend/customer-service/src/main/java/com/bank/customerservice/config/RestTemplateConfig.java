// customer-service/config/RestTemplateConfig.java
package com.bank.customerservice.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class RestTemplateConfig {
    @Bean RestTemplate restTemplate() { return new RestTemplate(); }
}
