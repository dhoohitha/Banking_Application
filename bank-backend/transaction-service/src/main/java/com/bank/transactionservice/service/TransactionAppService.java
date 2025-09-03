package com.bank.transactionservice.service;

import com.bank.transactionservice.dto.ExternalTransferRequest;
import com.bank.transactionservice.dto.InternalTransferRequest;
import com.bank.transactionservice.dto.LedgerLine;
import com.bank.transactionservice.dto.TransactionListItem;
import com.bank.transactionservice.dto.TransactionResponse;
import com.bank.transactionservice.entity.EntrySide;
import com.bank.transactionservice.entity.LedgerEntry;
import com.bank.transactionservice.entity.Transaction;
import com.bank.transactionservice.entity.TransactionStatus;
import com.bank.transactionservice.entity.TransactionType;
import com.bank.transactionservice.outbox.OutboxEvent;
import com.bank.transactionservice.outbox.OutboxEventRepository;
import com.bank.transactionservice.repository.LedgerEntryRepository;
import com.bank.transactionservice.repository.TransactionRepository;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class TransactionAppService {

    private final TransactionRepository txRepo;
    private final LedgerEntryRepository ledgerRepo;
    private final AccountClient accountClient;
    private final PaymentsClient paymentsClient;
    private final NotificationClient notificationClient;
    private final OutboxEventRepository outboxRepo; // NEW

    public TransactionAppService(TransactionRepository txRepo,
                                 LedgerEntryRepository ledgerRepo,
                                 AccountClient accountClient,
                                 PaymentsClient paymentsClient,
                                 NotificationClient notificationClient,
                                 OutboxEventRepository outboxRepo) {
        this.txRepo = txRepo;
        this.ledgerRepo = ledgerRepo;
        this.accountClient = accountClient;
        this.paymentsClient = paymentsClient;
        this.notificationClient = notificationClient;
        this.outboxRepo = outboxRepo;
    }

    /**
     * INTERNAL transfer (account -> account within our bank)
     * Safe flow:
     *  - Return existing txn if externalId seen (idempotent).
     *  - Debit source, then credit destination.
     *  - If credit fails, compensate source (credit back) and FAIL.
     *  - Only after both succeed: write ledger (DEBIT/CREDIT), mark COMPLETED, enqueue Outbox event.
     *  - Notifications are non-critical (never compensate on notify failure).
     */
    @Transactional
    public TransactionResponse internalTransfer(InternalTransferRequest req) {
        // Idempotency: if this externalId already processed, return existing txn
        Transaction existing = txRepo.findByExternalId(req.getExternalId()).orElse(null);
        if (existing != null) return toResponse(existing);

        // Basic validation
        if (req.getFromAccountId() == null || req.getToAccountId() == null || req.getAmount() == null) {
            throw new IllegalArgumentException("fromAccountId, toAccountId and amount are required");
        }
        if (Objects.equals(req.getFromAccountId(), req.getToAccountId())) {
            throw new IllegalArgumentException("fromAccountId and toAccountId must differ");
        }

        // Create PENDING transaction
        Transaction tx = new Transaction();
        tx.setExternalId(req.getExternalId());
        tx.setType(TransactionType.INTERNAL);
        tx.setStatus(TransactionStatus.PENDING);
        tx.setFromAccountId(req.getFromAccountId());
        tx.setToAccountId(req.getToAccountId());
        tx.setCreatedAt(Instant.now());
        tx = txRepo.save(tx);

        Long from = req.getFromAccountId();
        Long to = req.getToAccountId();
        BigDecimal amount = req.getAmount();

        // 1) DEBIT source
        try {
            accountClient.debit(from, amount);
        } catch (Exception e) {
            tx.setStatus(TransactionStatus.FAILED);
            txRepo.save(tx);
            throw new IllegalStateException("Debit failed: " + e.getMessage(), e);
        }

        // 2) CREDIT destination (compensate the prior debit if this fails)
        try {
            accountClient.credit(to, amount);
        } catch (Exception e) {
            try { accountClient.credit(from, amount); } catch (Exception ignore) {}
            tx.setStatus(TransactionStatus.FAILED);
            txRepo.save(tx);
            throw new IllegalStateException("Credit failed: " + e.getMessage(), e);
        }

        // 3) Ledger entries (only after both postings succeeded)
        writeLedger(tx.getId(), from, EntrySide.DEBIT, amount);
        writeLedger(tx.getId(), to,   EntrySide.CREDIT, amount);

        // 4) Mark COMPLETED and enqueue Outbox event (DB-atomic)
        tx.setStatus(TransactionStatus.COMPLETED);
        tx = txRepo.save(tx);

        outboxRepo.save(
            OutboxEvent.forTransferCompleted(
                tx.getId(), tx.getExternalId(), "INTERNAL",
                from, to, amount, Instant.now()
            )
        );

        // 5) Non-critical notification (do not compensate if this fails)
        try {
            notificationClient.notifyTransferCompleted(
                null, from, tx.getId(), amount, "EMAIL", "demo@bank.test"
            );
        } catch (Exception ignore) {}

        return toResponse(tx);
    }

    /**
     * EXTERNAL transfer (account -> outside bank via payments-service)
     * Safe flow mirrors internal:
     *  - Idempotent by externalId.
     *  - Debit local account.
     *  - If payment rail fails, compensate debit and FAIL.
     *  - Write ledger (DEBIT), mark COMPLETED, enqueue Outbox event.
     */
    @Transactional
    public TransactionResponse externalTransfer(ExternalTransferRequest req) {
        Transaction existing = txRepo.findByExternalId(req.getExternalId()).orElse(null);
        if (existing != null) return toResponse(existing);

        if (req.getFromAccountId() == null || req.getAmount() == null) {
            throw new IllegalArgumentException("fromAccountId and amount are required");
        }

        Transaction tx = new Transaction();
        tx.setExternalId(req.getExternalId());
        tx.setType(TransactionType.EXTERNAL);
        tx.setStatus(TransactionStatus.PENDING);
        tx.setFromAccountId(req.getFromAccountId());
        // Keep your beneficiary encoding
        tx.setExternalBeneficiary(req.getBeneficiaryBankCode() + ":" + req.getBeneficiaryAccountNo());
        tx.setCreatedAt(Instant.now());
        tx = txRepo.save(tx);

        Long from = req.getFromAccountId();
        BigDecimal amount = req.getAmount();

        // 1) Debit local account
        try {
            accountClient.debit(from, amount);
        } catch (Exception e) {
            tx.setStatus(TransactionStatus.FAILED);
            txRepo.save(tx);
            throw new IllegalStateException("Debit failed: " + e.getMessage(), e);
        }

        // 2) Send via payments-service
        boolean ok = false;
        try {
            ok = paymentsClient.send(
                req.getExternalId(),
                req.getFromAccountId(),
                req.getBeneficiaryName(),
                req.getBeneficiaryBankCode(),
                req.getBeneficiaryAccountNo(),
                req.getAmount()
            );
        } catch (Exception e) {
            ok = false;
        }

        if (!ok) {
            // Compensate the debit if the external payment failed
            try { accountClient.credit(from, amount); } catch (Exception ignore) {}
            tx.setStatus(TransactionStatus.FAILED);
            txRepo.save(tx);
            throw new IllegalStateException("External payment failed");
        }

        // 3) Ledger: money leaves the bank (DEBIT only)
        writeLedger(tx.getId(), from, EntrySide.DEBIT, amount);

        // 4) Mark COMPLETED and enqueue Outbox event
        tx.setStatus(TransactionStatus.COMPLETED);
        tx = txRepo.save(tx);

        outboxRepo.save(
            OutboxEvent.forTransferCompleted(
                tx.getId(), tx.getExternalId(), "EXTERNAL",
                from, null, amount, Instant.now()
            )
        );

        // 5) Non-critical notification
        try {
            notificationClient.notifyTransferCompleted(
                null, from, tx.getId(), amount, "EMAIL", "demo@bank.test"
            );
        } catch (Exception ignore) {}

        return toResponse(tx);
    }

    /**
     * Running-balance history (ledger-driven)
     */
    @Transactional
    public List<LedgerLine> historyWithRunningBalance(Long accountId) {
        var entries = ledgerRepo.findByAccountIdOrderByCreatedAtAscIdAsc(accountId);
        var lines = new ArrayList<LedgerLine>();
        var balance = BigDecimal.ZERO;

        for (var e : entries) {
            if (e.getSide() == EntrySide.CREDIT) {
                balance = balance.add(e.getAmount());
            } else {
                balance = balance.subtract(e.getAmount());
            }
            lines.add(new LedgerLine(e.getCreatedAt(), e.getTransactionId(), e.getSide(), e.getAmount(), balance));
        }
        return lines;
    }

    /**
     * Paginated & filterable statement view (account POV)
     */
    @Transactional
    public Page<TransactionListItem> searchStatements(Long accountId,
                                                      Instant from, Instant to,
                                                      TransactionType type, TransactionStatus status,
                                                      int page, int size) {
        var entries = ledgerRepo.findByAccountIdOrderByCreatedAtAscIdAsc(accountId);

        var txIds = entries.stream().map(LedgerEntry::getTransactionId).collect(Collectors.toSet());
        var txMap = txRepo.findAllById(txIds).stream()
                .collect(Collectors.toMap(Transaction::getId, t -> t));

        var items = entries.stream().map(e -> {
            var t = txMap.get(e.getTransactionId());
            if (t == null) return null;
            String direction = e.getSide().name(); // DEBIT/CREDIT
            return new TransactionListItem(
                    t.getId(),
                    t.getExternalId(),
                    t.getType(),
                    t.getStatus(),
                    t.getFromAccountId(),
                    t.getToAccountId(),
                    e.getAmount(),
                    direction,
                    t.getCreatedAt()
            );
        }).filter(Objects::nonNull).collect(Collectors.toList());

        if (from != null)   items = items.stream().filter(i -> !i.getCreatedAt().isBefore(from)).collect(Collectors.toList());
        if (to != null)     items = items.stream().filter(i -> !i.getCreatedAt().isAfter(to)).collect(Collectors.toList());
        if (type != null)   items = items.stream().filter(i -> i.getType() == type).collect(Collectors.toList());
        if (status != null) items = items.stream().filter(i -> i.getStatus() == status).collect(Collectors.toList());

        items.sort(Comparator.comparing(TransactionListItem::getCreatedAt).reversed()
                .thenComparing(TransactionListItem::getId).reversed());

        int fromIdx = Math.min(page * size, items.size());
        int toIdx = Math.min(fromIdx + size, items.size());
        List<TransactionListItem> pageContent = items.subList(fromIdx, toIdx);

        Pageable pageable = PageRequest.of(page, size);
        return new PageImpl<>(pageContent, pageable, items.size());
    }

    /**
     * CSV export of statement (uses searchStatements)
     */
    public byte[] exportStatementCsv(Long accountId,
                                     Instant from, Instant to,
                                     TransactionType type, TransactionStatus status) {
        var all = searchStatements(accountId, from, to, type, status, 0, Integer.MAX_VALUE).getContent();
        StringBuilder sb = new StringBuilder();
        sb.append("TxnId,ExternalId,Type,Status,FromAccount,ToAccount,Direction,Amount,CreatedAt\n");
        for (var i : all) {
            sb.append(i.getId()).append(',')
              .append(safe(i.getExternalId())).append(',')
              .append(i.getType()).append(',')
              .append(i.getStatus()).append(',')
              .append(i.getFromAccountId()).append(',')
              .append(i.getToAccountId()).append(',')
              .append(i.getDirection()).append(',')
              .append(i.getAmount()).append(',')
              .append(i.getCreatedAt()).append('\n');
        }
        return sb.toString().getBytes(StandardCharsets.UTF_8);
    }

    // ----------------- helpers -----------------

    private String safe(String s) { return s == null ? "" : s; }

    private void writeLedger(Long txId, Long accountId, EntrySide side, BigDecimal amount) {
        LedgerEntry le = new LedgerEntry();
        le.setTransactionId(txId);
        le.setAccountId(accountId);
        le.setSide(side);
        le.setAmount(amount);
        ledgerRepo.save(le);
    }

    private TransactionResponse toResponse(Transaction t) {
        return new TransactionResponse(
                t.getId(),
                t.getExternalId(),
                t.getType(),
                t.getStatus(),
                t.getFromAccountId(),
                t.getToAccountId(),
                t.getCreatedAt()
        );
    }
}
