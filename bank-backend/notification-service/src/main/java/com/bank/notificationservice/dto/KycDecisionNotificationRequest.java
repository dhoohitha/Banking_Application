package com.bank.notificationservice.dto;

import com.bank.notificationservice.entity.Channel;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class KycDecisionNotificationRequest {
    @NotNull private Long customerId;
    @NotBlank private String decision;     // APPROVED / REJECTED
    private String reason;                 // optional if rejected
    @NotNull private Channel channel;
    @NotBlank private String recipient;    // email/phone

    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }
    public String getDecision() { return decision; }
    public void setDecision(String decision) { this.decision = decision; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    public Channel getChannel() { return channel; }
    public void setChannel(Channel channel) { this.channel = channel; }
    public String getRecipient() { return recipient; }
    public void setRecipient(String recipient) { this.recipient = recipient; }
}
