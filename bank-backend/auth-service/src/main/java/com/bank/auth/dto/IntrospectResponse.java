package com.bank.auth.dto;

public class IntrospectResponse {
  private boolean valid;
  private String email;
  private String role;

  public IntrospectResponse() {}
  public IntrospectResponse(boolean valid, String email, String role) {
    this.valid = valid; this.email = email; this.role = role;
  }
  public boolean isValid() { return valid; }
  public void setValid(boolean valid) { this.valid = valid; }
  public String getEmail() { return email; }
  public void setEmail(String email) { this.email = email; }
  public String getRole() { return role; }
  public void setRole(String role) { this.role = role; }
}
