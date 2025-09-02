package com.bank.auth.core;

public class User {
  private String email;
  private String password; // plain text (demo only)
  private String role;     // "USER" or "ADMIN"

  public User() {}
  public User(String email, String password, String role) {
    this.email=email; this.password=password; this.role=role;
  }
  public String getEmail() { return email; }
  public String getPassword() { return password; }
  public String getRole() { return role; }
}
