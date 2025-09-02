package com.bank.notificationservice.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.Instant;

@Entity
@Table(name = "delivery_logs", indexes = {
        @Index(name = "idx_delivery_recipient", columnList = "recipient,createdAt")
})
public class DeliveryLog {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING) @Column(nullable=false)
    private Channel channel;

    @Enumerated(EnumType.STRING) @Column(nullable=false)
    private DeliveryStatus status;

    @Column(nullable=false)
    private String recipient; // phone or email

    @Column(nullable=false, length = 160)
    private String subject;   // for SMS we’ll keep it short (title)

    @Lob
    private String body;

    private String error;     // if failed

    @CreationTimestamp
    private Instant createdAt;

    public DeliveryLog() {}

    // getters/setters
    public Long getId() { return id; }
    public Channel getChannel() { return channel; }
    public void setChannel(Channel channel) { this.channel = channel; }
    public DeliveryStatus getStatus() { return status; }
    public void setStatus(DeliveryStatus status) { this.status = status; }
    public String getRecipient() { return recipient; }
    public void setRecipient(String recipient) { this.recipient = recipient; }
    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }
    public String getBody() { return body; }
    public void setBody(String body) { this.body = body; }
    public String getError() { return error; }
    public void setError(String error) { this.error = error; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
