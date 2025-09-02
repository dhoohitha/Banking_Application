package com.bank.transactionservice.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

@Entity
@Table(name = "transactions", indexes = {
        @Index(name = "idx_tx_external", columnList = "externalId", unique = true),
        @Index(name = "idx_tx_from_to", columnList = "fromAccountId,toAccountId")
})
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // client-supplied idempotency key (e.g., UUID)
    @Column(nullable = false, unique = true, length = 64)
    private String externalId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransactionType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransactionStatus status = TransactionStatus.PENDING;

    // internal
    private Long fromAccountId;
    private Long toAccountId;

    // external (beneficiary info etc.) - keep optional for now
    private String externalBeneficiary; // e.g., IFSC+acc or UPI id for later

    @CreationTimestamp
    private Instant createdAt;

    // --- getters/setters ---
    public Long getId() { return id; }
    public String getExternalId() { return externalId; }
    public void setExternalId(String externalId) { this.externalId = externalId; }
    public TransactionType getType() { return type; }
    public void setType(TransactionType type) { this.type = type; }
    public TransactionStatus getStatus() { return status; }
    public void setStatus(TransactionStatus status) { this.status = status; }
    public Long getFromAccountId() { return fromAccountId; }
    public void setFromAccountId(Long fromAccountId) { this.fromAccountId = fromAccountId; }
    public Long getToAccountId() { return toAccountId; }
    public void setToAccountId(Long toAccountId) { this.toAccountId = toAccountId; }
    public String getExternalBeneficiary() { return externalBeneficiary; }
    public void setExternalBeneficiary(String externalBeneficiary) { this.externalBeneficiary = externalBeneficiary; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
