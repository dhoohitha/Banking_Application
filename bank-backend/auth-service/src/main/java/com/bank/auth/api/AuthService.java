package com.bank.auth.api;

import org.springframework.stereotype.Service;
import java.util.concurrent.ConcurrentHashMap;
import com.bank.auth.core.*;

@Service
public class AuthService {
  private final ConcurrentHashMap<String, User> users = new ConcurrentHashMap<>();

  public AuthService() {
    users.put("admin@bank.test", new User("admin@bank.test", "admin123", "ADMIN"));
  }

  public User login(String email, String password) {
    User u = users.get(email);
    if (u == null || !u.getPassword().equals(password)) {
      throw new RuntimeException("Bad credentials");
    }
    return u;
  }

  public void register(String email, String password, String role) {
    users.put(email, new User(email, password, role));
  }
}
