package com.bank.paymentsservice.controller;

import com.bank.paymentsservice.dto.PaymentRequest;
import com.bank.paymentsservice.dto.PaymentResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Random;

@RestController
@RequestMapping("/payments")
@CrossOrigin(origins = {"http://localhost:8100", "http://localhost:4200"})
public class PaymentsController {

    private final boolean simulateFailure;
    private final Random rnd = new Random();

    public PaymentsController(@Value("${payments.simulate-failure:false}") boolean simulateFailure) {
        this.simulateFailure = simulateFailure;
    }

    @PostMapping("/transfer")
    public ResponseEntity<PaymentResponse> transfer(@Valid @RequestBody PaymentRequest req) {
        // super simple mock:
        if (simulateFailure && rnd.nextBoolean()) {
            return ResponseEntity.ok(new PaymentResponse("FAILED", "Simulated failure"));
        }
        return ResponseEntity.ok(new PaymentResponse("SUCCESS", "Payment instruction accepted"));
    }

    @GetMapping("/health")
    public String health() { return "OK"; }
}
