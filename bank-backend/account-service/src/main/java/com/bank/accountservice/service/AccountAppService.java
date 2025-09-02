package com.bank.accountservice.service;

import com.bank.accountservice.dto.AccountResponse;
import com.bank.accountservice.dto.CreateAccountRequest;
import com.bank.accountservice.entity.*;
import com.bank.accountservice.events.AccountEventsPublisher;
import com.bank.accountservice.repository.AccountRepository;
import com.bank.accountservice.util.AccountNumberGenerator;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AccountAppService {

    private final AccountRepository repo;
    private final AccountEventsPublisher events;
    private final CustomerClient customerClient;

    public AccountAppService(AccountRepository repo,
                             AccountEventsPublisher events,
                             CustomerClient customerClient) {
        this.repo = repo;
        this.events = events;
        this.customerClient = customerClient;
    }

    @Transactional
    public AccountResponse createAccount(CreateAccountRequest req) {
        // 1) check KYC
        String kyc = customerClient.getKycStatus(req.getCustomerId());
        if (!"APPROVED".equalsIgnoreCase(kyc)) {
            throw new IllegalStateException("KYC not approved. Current status: " + kyc);
        }

        // 2) create account
        Account acc = new Account();
        acc.setCustomerId(req.getCustomerId());
        acc.setType(req.getType());
        acc.setAccountNo(AccountNumberGenerator.generate());
        acc.setBalance(java.math.BigDecimal.ZERO);
        acc.setStatus(AccountStatus.ACTIVE);

        Account saved = repo.save(acc);

        // 3) publish event
        events.publishAccountOpened(saved);

        return toResponse(saved);
    }

    @Transactional
    public List<AccountResponse> listByCustomer(Long customerId) {
        return repo.findByCustomerId(customerId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public AccountResponse getById(Long id) {
        Account a = repo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Account not found: " + id));
        return toResponse(a);
    }

    private AccountResponse toResponse(Account a) {
        return new AccountResponse(
                a.getId(),
                a.getCustomerId(),
                a.getType(),
                a.getAccountNo(),
                a.getBalance(),
                a.getStatus(),
                a.getCreatedAt()
        );
    }
    @Transactional
    public void debit(Long accountId, BigDecimal amount) {
        Account a = repo.findById(accountId)
                .orElseThrow(() -> new EntityNotFoundException("Account not found: " + accountId));
        if (a.getStatus() != AccountStatus.ACTIVE) {
            throw new IllegalStateException("Account not active");
        }
        if (a.getBalance().compareTo(amount) < 0) {
            throw new IllegalStateException("Insufficient funds");
        }
        a.setBalance(a.getBalance().subtract(amount));
        repo.save(a);
    }

    @Transactional
    public void credit(Long accountId, BigDecimal amount) {
        Account a = repo.findById(accountId)
                .orElseThrow(() -> new EntityNotFoundException("Account not found: " + accountId));
        if (a.getStatus() != AccountStatus.ACTIVE) {
            throw new IllegalStateException("Account not active");
        }
        a.setBalance(a.getBalance().add(amount));
        repo.save(a);
    }
    
}
