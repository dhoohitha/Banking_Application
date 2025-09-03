// FILE: src/main/java/com/bank/transactionservice/outbox/OutboxEvent.java
package com.bank.transactionservice.outbox;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "outbox_events", indexes = {
    @Index(name = "idx_outbox_status_created", columnList = "status,createdAt")
})
public class OutboxEvent {

    public enum Status { NEW, SENT, FAILED }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, updatable = false)
    private String aggregateType; // "Transaction"

    @Column(nullable = false, updatable = false)
    private String aggregateId;   // tx id as string

    @Column(nullable = false, updatable = false)
    private String eventType;     // "TransferCompleted"

    @Lob
    @Column(nullable = false, updatable = false)
    private String payload;       // JSON

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status = Status.NEW;

    private String lastError;
    private Integer attempts = 0;

    // Factory
    public static OutboxEvent forTransferCompleted(Long txId, String externalId, String kind,
                                                   Long from, Long to, java.math.BigDecimal amount, Instant at) {
        OutboxEvent e = new OutboxEvent();
        e.aggregateType = "Transaction";
        e.aggregateId = String.valueOf(txId);
        e.eventType = "TransferCompleted";
        // very simple JSON; feel free to use Jackson ObjectMapper if you prefer
        e.payload = String.format(
          "{\"eventId\":\"%s\",\"type\":\"%s\",\"externalId\":\"%s\",\"kind\":\"%s\",\"txId\":%d,\"fromAccountId\":%s,\"toAccountId\":%s,\"amount\":%s,\"createdAt\":\"%s\"}",
          UUID.randomUUID(), "TransferCompleted", externalId, kind, txId,
          from==null? "null" : from.toString(),
          to==null? "null" : to.toString(),
          amount.toPlainString(), at.toString()
        );
        e.status = Status.NEW;
        e.attempts = 0;
        return e;
    }

    public void markSent() {
        this.status = Status.SENT;
        this.lastError = null;
    }

    public void markFailed(String msg) {
        this.status = Status.FAILED;
        this.lastError = msg;
        this.attempts = (this.attempts == null ? 1 : this.attempts + 1);
    }

    // getters/setters omitted for brevity
    public Long getId() { return id; }
    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }
    public String getPayload() { return payload; }
    public String getAggregateId() { return aggregateId; }
    public String getEventType() { return eventType; }
    public Integer getAttempts() { return attempts; }
    public void setAttempts(Integer attempts) { this.attempts = attempts; }
    public String getLastError() { return lastError; }
    public void setLastError(String lastError) { this.lastError = lastError; }
}
