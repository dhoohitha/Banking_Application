package com.bank.transactionservice.controller;

import com.bank.transactionservice.dto.ExternalTransferRequest;
import com.bank.transactionservice.dto.InternalTransferRequest;
import com.bank.transactionservice.dto.LedgerLine;
import com.bank.transactionservice.dto.TransactionListItem;
import com.bank.transactionservice.dto.TransactionResponse;
import com.bank.transactionservice.entity.TransactionStatus;
import com.bank.transactionservice.entity.TransactionType;
import com.bank.transactionservice.service.TransactionAppService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping
@CrossOrigin(origins = {"http://localhost:8100", "http://localhost:4200"})
public class TransactionController {

    private final TransactionAppService service;

    public TransactionController(TransactionAppService service) {
        this.service = service;
    }

    @PostMapping("/transactions/internal")
    public ResponseEntity<TransactionResponse> internal(@Valid @RequestBody InternalTransferRequest req) {
        return ResponseEntity.ok(service.internalTransfer(req));
    }

    @PostMapping("/transactions/external")
    public ResponseEntity<TransactionResponse> external(@Valid @RequestBody ExternalTransferRequest req) {
        return ResponseEntity.ok(service.externalTransfer(req));
    }

    @GetMapping("/transactions/history")
    public ResponseEntity<List<LedgerLine>> history(@RequestParam Long accountId) {
        return ResponseEntity.ok(service.historyWithRunningBalance(accountId));
    }

    // Paginated, filterable statement
    @GetMapping("/transactions/statement")
    public ResponseEntity<Page<TransactionListItem>> statement(
            @RequestParam Long accountId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant to,
            @RequestParam(required = false) TransactionType type,
            @RequestParam(required = false) TransactionStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(service.searchStatements(accountId, from, to, type, status, page, size));
    }

    // CSV export
    @GetMapping("/transactions/statement.csv")
    public ResponseEntity<byte[]> statementCsv(
            @RequestParam Long accountId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant to,
            @RequestParam(required = false) TransactionType type,
            @RequestParam(required = false) TransactionStatus status
    ) {
        byte[] csv = service.exportStatementCsv(accountId, from, to, type, status);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=statement.csv")
                .contentType(MediaType.TEXT_PLAIN)
                .body(csv);
    }
}
