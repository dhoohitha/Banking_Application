package com.bank.paymentsservice.dto;

public class PaymentResponse {
    private String status; // SUCCESS / FAILED
    private String message;

    public PaymentResponse() {}
    public PaymentResponse(String status, String message) {
        this.status = status; this.message = message;
    }
    public String getStatus() { return status; }
    public String getMessage() { return message; }
    public void setStatus(String status) { this.status = status; }
    public void setMessage(String message) { this.message = message; }
}
