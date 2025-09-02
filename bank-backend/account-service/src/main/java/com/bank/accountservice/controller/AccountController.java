package com.bank.accountservice.controller;

import com.bank.accountservice.dto.AccountResponse;
import com.bank.accountservice.dto.CreateAccountRequest;
import com.bank.accountservice.service.AccountAppService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.bank.accountservice.dto.AmountRequest;
import java.util.List;

@RestController
@RequestMapping
@CrossOrigin(origins = {"http://localhost:8100", "http://localhost:4200"})
public class AccountController {

    private final AccountAppService service;

    public AccountController(AccountAppService service) {
        this.service = service;
    }

    @PostMapping("/accounts")
    public ResponseEntity<AccountResponse> create(@Valid @RequestBody CreateAccountRequest req) {
        return ResponseEntity.ok(service.createAccount(req));
    }

    @GetMapping("/accounts")
    public ResponseEntity<List<AccountResponse>> byCustomer(@RequestParam Long customerId) {
        return ResponseEntity.ok(service.listByCustomer(customerId));
    }

    @GetMapping("/accounts/{id}")
    public ResponseEntity<AccountResponse> get(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }
    @PostMapping("/accounts/{id}/debit")
    public ResponseEntity<Void> debit(@PathVariable Long id, @Valid @RequestBody AmountRequest req) {
        service.debit(id, req.getAmount());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/accounts/{id}/credit")
    public ResponseEntity<Void> credit(@PathVariable Long id, @Valid @RequestBody AmountRequest req) {
        service.credit(id, req.getAmount());
        return ResponseEntity.ok().build();
    }
}
