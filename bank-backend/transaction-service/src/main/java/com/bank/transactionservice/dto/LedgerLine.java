package com.bank.transactionservice.dto;

import com.bank.transactionservice.entity.EntrySide;

import java.math.BigDecimal;
import java.time.Instant;

public class LedgerLine {
    private Instant at;
    private Long transactionId;
    private EntrySide side;      // DEBIT/CREDIT
    private BigDecimal amount;
    private BigDecimal runningBalance;

    public LedgerLine(Instant at, Long transactionId, EntrySide side, BigDecimal amount, BigDecimal runningBalance) {
        this.at = at; this.transactionId = transactionId; this.side = side; this.amount = amount; this.runningBalance = runningBalance;
    }

    public Instant getAt() { return at; }
    public Long getTransactionId() { return transactionId; }
    public EntrySide getSide() { return side; }
    public BigDecimal getAmount() { return amount; }
    public BigDecimal getRunningBalance() { return runningBalance; }
}
