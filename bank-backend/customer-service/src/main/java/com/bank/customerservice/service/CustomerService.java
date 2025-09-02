package com.bank.customerservice.service;

import com.bank.customerservice.dto.*;
import com.bank.customerservice.entity.*;
import com.bank.customerservice.events.CustomerEventsPublisher;
import com.bank.customerservice.repository.CustomerKycDocRepository;
import com.bank.customerservice.repository.CustomerRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CustomerService {

    private final CustomerRepository customerRepo;
    private final CustomerKycDocRepository docRepo;
    private final CustomerEventsPublisher events;
    private final NotificationClient notificationClient; // ⬅️ added

    // ✅ constructor for the final fields (with NotificationClient)
    public CustomerService(CustomerRepository customerRepo,
                           CustomerKycDocRepository docRepo,
                           CustomerEventsPublisher events,
                           NotificationClient notificationClient) {
        this.customerRepo = customerRepo;
        this.docRepo = docRepo;
        this.events = events;
        this.notificationClient = notificationClient;
    }

    @Transactional
    public CustomerResponse createOrUpdateProfile(CustomerCreateRequest req) {
        Customer customer = customerRepo.findByEmail(req.email())
                .map(c -> {
                    c.setFullName(req.fullName());
                    c.setPhone(req.phone());
                    return c;
                })
                .orElseGet(() -> {
                    Customer c = new Customer();
                    c.setFullName(req.fullName());
                    c.setEmail(req.email());
                    c.setPhone(req.phone());
                    c.setKycStatus(KycStatus.PENDING);
                    return c;
                });

        Customer saved = customerRepo.save(customer);
        return toResponse(saved);
    }

    @Transactional
    public CustomerResponse uploadKycDoc(Long customerId, KycDocRequest req) {
        Customer customer = customerRepo.findById(customerId)
                .orElseThrow(() -> new EntityNotFoundException("Customer not found: " + customerId));

        CustomerKycDoc doc = new CustomerKycDoc();
        doc.setDocType(req.docType());
        doc.setDocUrl(req.docUrl());
        doc.setStatus(KycDocStatus.UPLOADED);
        // add to aggregate (also sets doc.customer)
        customer.addKycDoc(doc);

        Customer saved = customerRepo.save(customer);
        events.publishKycSubmitted(saved);
        return toResponse(saved);
    }

    @Transactional
    public PageResponse<CustomerResponse> listByKycStatus(KycStatus status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "id"));
        Page<Customer> p = customerRepo.findByKycStatus(status, pageable);
        List<CustomerResponse> content = p.getContent().stream().map(this::toResponse).collect(Collectors.toList());
        return new PageResponse<>(content, p.getNumber(), p.getSize(), p.getTotalElements(), p.getTotalPages());
    }

    @Transactional
    public CustomerResponse approveKyc(Long customerId, KycDecisionRequest req) {
        Customer customer = customerRepo.findById(customerId)
                .orElseThrow(() -> new EntityNotFoundException("Customer not found: " + customerId));
        customer.setKycStatus(KycStatus.APPROVED);
        Customer saved = customerRepo.save(customer);

        // publish domain event (existing)
        events.publishKycApproved(saved, req.actor());

        // 🔔 notify via notification-service (basic EMAIL)
        String recipient = (saved.getEmail() == null || saved.getEmail().isBlank())
                ? "demo@bank.test" : saved.getEmail();
        notificationClient.notifyKycDecision(
                saved.getId(),
                "APPROVED",
                "",
                "EMAIL",
                recipient
        );

        return toResponse(saved);
    }

    @Transactional
    public CustomerResponse rejectKyc(Long customerId, KycDecisionRequest req) {
        Customer customer = customerRepo.findById(customerId)
                .orElseThrow(() -> new EntityNotFoundException("Customer not found: " + customerId));
        customer.setKycStatus(KycStatus.REJECTED);
        Customer saved = customerRepo.save(customer);

        // publish domain event (existing)
        events.publishKycRejected(saved, req.actor(), req.reason());

        // 🔔 notify via notification-service (basic EMAIL)
        String recipient = (saved.getEmail() == null || saved.getEmail().isBlank())
                ? "demo@bank.test" : saved.getEmail();
        String reason = (req.reason() == null) ? "" : req.reason();
        notificationClient.notifyKycDecision(
                saved.getId(),
                "REJECTED",
                reason,
                "EMAIL",
                recipient
        );

        return toResponse(saved);
    }

    @Transactional
    public CustomerResponse getById(Long id) {
        Customer c = customerRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Customer not found: " + id));
        return toResponse(c);
    }

    private CustomerResponse toResponse(Customer c) {
        List<KycDocResponse> docs = c.getKycDocs().stream().map(d ->
                new KycDocResponse(
                        d.getId(),
                        d.getDocType(),
                        d.getDocUrl(),
                        d.getStatus(),
                        d.getUploadedAt()
                )
        ).collect(Collectors.toList());

        return new CustomerResponse(
                c.getId(),
                c.getFullName(),
                c.getEmail(),
                c.getPhone(),
                c.getKycStatus(),
                docs,
                c.getCreatedAt(),
                c.getUpdatedAt()
        );
    }
}
