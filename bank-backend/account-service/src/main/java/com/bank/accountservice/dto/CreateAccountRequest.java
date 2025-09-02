package com.bank.accountservice.dto;

import com.bank.accountservice.entity.AccountType;
import jakarta.validation.constraints.NotNull;

public class CreateAccountRequest {
    @NotNull
    private Long customerId;

    @NotNull
    private AccountType type;

    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }

    public AccountType getType() { return type; }
    public void setType(AccountType type) { this.type = type; }
}
