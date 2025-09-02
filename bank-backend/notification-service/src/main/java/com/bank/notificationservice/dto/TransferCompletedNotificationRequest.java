package com.bank.notificationservice.dto;

import com.bank.notificationservice.entity.Channel;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class TransferCompletedNotificationRequest {
    @NotNull private Long customerId;   // optional in template now
    @NotNull private Long accountId;
    @NotNull private Long transactionId;
    @NotNull @DecimalMin("0.01") private BigDecimal amount;

    @NotNull private Channel channel;   // SMS or EMAIL
    @NotBlank private String recipient; // phone/email

    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }
    public Long getAccountId() { return accountId; }
    public void setAccountId(Long accountId) { this.accountId = accountId; }
    public Long getTransactionId() { return transactionId; }
    public void setTransactionId(Long transactionId) { this.transactionId = transactionId; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public Channel getChannel() { return channel; }
    public void setChannel(Channel channel) { this.channel = channel; }
    public String getRecipient() { return recipient; }
    public void setRecipient(String recipient) { this.recipient = recipient; }
}
