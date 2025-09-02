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
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TransactionAppService {

    private final TransactionRepository txRepo;
    private final LedgerEntryRepository ledgerRepo;
    private final AccountClient accountClient;
    private final PaymentsClient paymentsClient;
    private final NotificationClient notificationClient;

    public TransactionAppService(TransactionRepository txRepo,
                                 LedgerEntryRepository ledgerRepo,
                                 AccountClient accountClient,
                                 PaymentsClient paymentsClient,
                                 NotificationClient notificationClient) {
        this.txRepo = txRepo;
        this.ledgerRepo = ledgerRepo;
        this.accountClient = accountClient;
        this.paymentsClient = paymentsClient;
        this.notificationClient = notificationClient;
    }

    /**
     * INTERNAL transfer (account -> account within our bank)
     */
    @Transactional
    public TransactionResponse internalTransfer(InternalTransferRequest req) {
        Transaction existing = txRepo.findByExternalId(req.getExternalId()).orElse(null);
        if (existing != null) return toResponse(existing);

        Transaction tx = new Transaction();
        tx.setExternalId(req.getExternalId());
        tx.setType(TransactionType.INTERNAL);
        tx.setStatus(TransactionStatus.PENDING);
        tx.setFromAccountId(req.getFromAccountId());
        tx.setToAccountId(req.getToAccountId());
        tx = txRepo.save(tx);

        try {
            accountClient.debit(req.getFromAccountId(), req.getAmount());
            accountClient.credit(req.getToAccountId(), req.getAmount());

            writeLedger(tx.getId(), req.getFromAccountId(), EntrySide.DEBIT, req.getAmount());
            writeLedger(tx.getId(), req.getToAccountId(), EntrySide.CREDIT, req.getAmount());

            tx.setStatus(TransactionStatus.COMPLETED);
            tx = txRepo.save(tx);

            // Notify (demo placeholder)
            notificationClient.notifyTransferCompleted(
                    null,
                    req.getFromAccountId(),
                    tx.getId(),
                    req.getAmount(),
                    "EMAIL",
                    "demo@bank.test"
            );

        } catch (Exception ex) {
            try { accountClient.credit(req.getFromAccountId(), req.getAmount()); } catch (Exception ignore) { }
            tx.setStatus(TransactionStatus.FAILED);
            txRepo.save(tx);
            throw new IllegalStateException("Internal transfer failed: " + ex.getMessage(), ex);
        }

        return toResponse(tx);
    }

    /**
     * EXTERNAL transfer (account -> outside bank via payments-service)
     */
    @Transactional
    public TransactionResponse externalTransfer(ExternalTransferRequest req) {
        Transaction existing = txRepo.findByExternalId(req.getExternalId()).orElse(null);
        if (existing != null) return toResponse(existing);

        Transaction tx = new Transaction();
        tx.setExternalId(req.getExternalId());
        tx.setType(TransactionType.EXTERNAL);
        tx.setStatus(TransactionStatus.PENDING);
        tx.setFromAccountId(req.getFromAccountId());
        tx.setExternalBeneficiary(req.getBeneficiaryBankCode() + ":" + req.getBeneficiaryAccountNo());
        tx = txRepo.save(tx);

        try {
            accountClient.debit(req.getFromAccountId(), req.getAmount());

            boolean ok = paymentsClient.send(
                    req.getExternalId(),
                    req.getFromAccountId(),
                    req.getBeneficiaryName(),
                    req.getBeneficiaryBankCode(),
                    req.getBeneficiaryAccountNo(),
                    req.getAmount()
            );
            if (!ok) throw new IllegalStateException("Payment gateway returned FAILED");

            writeLedger(tx.getId(), req.getFromAccountId(), EntrySide.DEBIT, req.getAmount());

            tx.setStatus(TransactionStatus.COMPLETED);
            tx = txRepo.save(tx);

            // Notify (demo placeholder)
            notificationClient.notifyTransferCompleted(
                    null,
                    req.getFromAccountId(),
                    tx.getId(),
                    req.getAmount(),
                    "EMAIL",
                    "demo@bank.test"
            );

        } catch (Exception ex) {
            try { accountClient.credit(req.getFromAccountId(), req.getAmount()); } catch (Exception ignore) { }
            tx.setStatus(TransactionStatus.FAILED);
            txRepo.save(tx);
            throw new IllegalStateException("External transfer failed: " + ex.getMessage(), ex);
        }

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
        }).filter(i -> i != null).collect(Collectors.toList());

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
