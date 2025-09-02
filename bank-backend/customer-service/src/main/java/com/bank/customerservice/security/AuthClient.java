package com.bank.customerservice.security;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import java.util.Map;

@Component

public class AuthClient {
  private final RestTemplate rt = new RestTemplate();
  public String requireRole(String token, String requiredRole) {
    if (token == null || !token.startsWith("Bearer ")) throw new RuntimeException("Unauthorized");
    String t = token.substring(7);
    ResponseEntity<Map> resp = rt.getForEntity("http://localhost:8080/auth/introspect?token={t}", Map.class, t);
    Map body = resp.getBody();
    boolean valid = body != null && Boolean.TRUE.equals(body.get("valid"));
    String role = body != null ? (String) body.get("role") : null;
    if (!valid || role == null || !role.equals(requiredRole)) throw new RuntimeException("Forbidden");
    return (String) body.get("email");
  }
}
