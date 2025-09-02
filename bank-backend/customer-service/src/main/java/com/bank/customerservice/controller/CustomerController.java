package com.bank.customerservice.controller;

import com.bank.customerservice.dto.*;
import com.bank.customerservice.entity.KycStatus;
import com.bank.customerservice.security.AuthClient;
import com.bank.customerservice.service.CustomerService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping
@CrossOrigin(origins = {"http://localhost:8100", "http://localhost:4200"})
public class CustomerController {

    private final CustomerService customerService;
    private final AuthClient authClient;

    public CustomerController(CustomerService customerService, AuthClient authClient) {
        this.customerService = customerService;
        this.authClient = authClient;
    }

    // ----- CUSTOMER SIDE -----

    @PostMapping("/customers")
    public ResponseEntity<CustomerResponse> createOrUpdate(@Valid @RequestBody CustomerCreateRequest req) {
        return ResponseEntity.ok(customerService.createOrUpdateProfile(req));
    }

    @PostMapping("/customers/{customerId}/kyc")
    public ResponseEntity<CustomerResponse> uploadKyc(@PathVariable Long customerId,
                                                      @Valid @RequestBody KycDocRequest req) {
        return ResponseEntity.ok(customerService.uploadKycDoc(customerId, req));
    }

    @GetMapping("/customers/{customerId}")
    public ResponseEntity<CustomerResponse> get(@PathVariable Long customerId) {
        return ResponseEntity.ok(customerService.getById(customerId));
    }

    // ----- ADMIN SIDE -----

    @GetMapping("/admin/kyc")
    public ResponseEntity<PageResponse<CustomerResponse>> listByStatus(
            @RequestParam(defaultValue = "PENDING") KycStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            HttpServletRequest http
    ) {
        // require ADMIN
        String auth = http.getHeader("Authorization");
        authClient.requireRole(auth, "ADMIN");
        return ResponseEntity.ok(customerService.listByKycStatus(status, page, size));
    }

    @PostMapping("/admin/kyc/{customerId}/approve")
    public ResponseEntity<CustomerResponse> approve(@PathVariable Long customerId,
                                                    @Valid @RequestBody KycDecisionRequest req,
                                                    HttpServletRequest http) {
        String auth = http.getHeader("Authorization");
        authClient.requireRole(auth, "ADMIN");
        return ResponseEntity.ok(customerService.approveKyc(customerId, req));
    }

    @PostMapping("/admin/kyc/{customerId}/reject")
    public ResponseEntity<CustomerResponse> reject(@PathVariable Long customerId,
                                                   @Valid @RequestBody KycDecisionRequest req,
                                                   HttpServletRequest http) {
        String auth = http.getHeader("Authorization");
        authClient.requireRole(auth, "ADMIN");
        return ResponseEntity.ok(customerService.rejectKyc(customerId, req));
    }
}
