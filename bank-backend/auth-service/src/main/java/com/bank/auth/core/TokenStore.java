package com.bank.auth.core;

import org.springframework.stereotype.Component;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class TokenStore {
  // token -> User
  private final Map<String, User> tokens = new ConcurrentHashMap<>();

  public String issue(User u) {
    String token = UUID.randomUUID().toString();
    tokens.put(token, u);
    return token;
  }

  public Optional<User> introspect(String token) {
    return Optional.ofNullable(tokens.get(token));
  }

  public void revoke(String token) {
    tokens.remove(token);
  }
}
