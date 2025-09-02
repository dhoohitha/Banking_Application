package com.bank.transactionservice.dto;

import com.bank.transactionservice.entity.TransactionStatus;
import com.bank.transactionservice.entity.TransactionType;

import java.math.BigDecimal;
import java.time.Instant;

public class TransactionListItem {
    private Long id;
    private String externalId;
    private TransactionType type;
    private TransactionStatus status;
    private Long fromAccountId;
    private Long toAccountId;
    private BigDecimal amount;      // computed from ledger for the account POV
    private String direction;       // "DEBIT" or "CREDIT" w.r.t. the queried account
    private Instant createdAt;

    public TransactionListItem(Long id, String externalId, TransactionType type, TransactionStatus status,
                               Long fromAccountId, Long toAccountId, BigDecimal amount, String direction,
                               Instant createdAt) {
        this.id = id; this.externalId = externalId; this.type = type; this.status = status;
        this.fromAccountId = fromAccountId; this.toAccountId = toAccountId;
        this.amount = amount; this.direction = direction; this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public String getExternalId() { return externalId; }
    public TransactionType getType() { return type; }
    public TransactionStatus getStatus() { return status; }
    public Long getFromAccountId() { return fromAccountId; }
    public Long getToAccountId() { return toAccountId; }
    public BigDecimal getAmount() { return amount; }
    public String getDirection() { return direction; }
    public Instant getCreatedAt() { return createdAt; }
}
