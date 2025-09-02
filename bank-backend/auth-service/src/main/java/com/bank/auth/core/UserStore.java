package com.bank.auth.core;

import org.springframework.stereotype.Component;
import java.util.*;

@Component
public class UserStore {
  private final Map<String, User> users = new HashMap<>();

  public UserStore() {
    // single admin
    users.put("admin@bank.test", new User("admin@bank.test", "admin123", "ADMIN"));
    // you can pre-seed some demo users if you like:
    // users.put("user@bank.test", new User("user@bank.test","user123","USER"));
  }

  public Optional<User> findByEmail(String email) {
    return Optional.ofNullable(users.get(email));
  }

  public boolean exists(String email) {
    return users.containsKey(email);
  }

  public User addUser(String email, String password) {
    User u = new User(email, password, "USER");
    users.put(email, u);
    return u;
  }
}
