package com.bank.notificationservice.controller;

import com.bank.notificationservice.dto.KycDecisionNotificationRequest;
import com.bank.notificationservice.dto.TransferCompletedNotificationRequest;
import com.bank.notificationservice.service.NotificationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/notify")
public class NotificationController {

    private final NotificationService service;

    public NotificationController(NotificationService service) {
        this.service = service;
    }

    @PostMapping("/transfer-completed")
    public ResponseEntity<?> transferCompleted(@Valid @RequestBody TransferCompletedNotificationRequest req) {
        Long id = service.notifyTransferCompleted(req);
        return ResponseEntity.ok(Map.of("deliveryId", id, "status", "OK"));
    }

    @PostMapping("/kyc-decision")
    public ResponseEntity<?> kycDecision(@Valid @RequestBody KycDecisionNotificationRequest req) {
        Long id = service.notifyKycDecision(req);
        return ResponseEntity.ok(Map.of("deliveryId", id, "status", "OK"));
    }
}
