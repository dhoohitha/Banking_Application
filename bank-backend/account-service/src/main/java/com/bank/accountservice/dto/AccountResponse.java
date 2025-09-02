package com.bank.accountservice.dto;

import com.bank.accountservice.entity.AccountStatus;
import com.bank.accountservice.entity.AccountType;

import java.math.BigDecimal;
import java.time.Instant;

public class AccountResponse {
    private Long id;
    private Long customerId;
    private AccountType type;
    private String accountNo;
    private BigDecimal balance;
    private AccountStatus status;
    private Instant createdAt;

    public AccountResponse(Long id, Long customerId, AccountType type, String accountNo,
                           BigDecimal balance, AccountStatus status, Instant createdAt) {
        this.id = id; this.customerId = customerId; this.type = type; this.accountNo = accountNo;
        this.balance = balance; this.status = status; this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public Long getCustomerId() { return customerId; }
    public AccountType getType() { return type; }
    public String getAccountNo() { return accountNo; }
    public BigDecimal getBalance() { return balance; }
    public AccountStatus getStatus() { return status; }
    public Instant getCreatedAt() { return createdAt; }
}
