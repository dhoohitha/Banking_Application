package com.bank.transactionservice.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "ledger_entries", indexes = {
        @Index(name = "idx_ledger_account", columnList = "accountId,createdAt")
})
public class LedgerEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable=false)
    private Long accountId;

    @Column(nullable=false)
    private Long transactionId;

    @Enumerated(EnumType.STRING)
    @Column(nullable=false)
    private EntrySide side; // DEBIT/CREDIT (from account POV)

    @Column(nullable=false, precision = 18, scale = 2)
    private BigDecimal amount;

    @CreationTimestamp
    private Instant createdAt;

    // --- getters/setters ---
    public Long getId() { return id; }
    public Long getAccountId() { return accountId; }
    public void setAccountId(Long accountId) { this.accountId = accountId; }
    public Long getTransactionId() { return transactionId; }
    public void setTransactionId(Long transactionId) { this.transactionId = transactionId; }
    public EntrySide getSide() { return side; }
    public void setSide(EntrySide side) { this.side = side; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
