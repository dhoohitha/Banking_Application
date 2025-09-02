package com.bank.notificationservice.service;

import com.bank.notificationservice.dto.KycDecisionNotificationRequest;
import com.bank.notificationservice.dto.TransferCompletedNotificationRequest;
import com.bank.notificationservice.entity.Channel;
import com.bank.notificationservice.entity.DeliveryLog;
import com.bank.notificationservice.entity.DeliveryStatus;
import com.bank.notificationservice.repository.DeliveryLogRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import jakarta.transaction.Transactional;

@Service
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);
    private final DeliveryLogRepository repo;

    public NotificationService(DeliveryLogRepository repo) {
        this.repo = repo;
    }

    @Transactional
    public Long notifyTransferCompleted(TransferCompletedNotificationRequest req) {
        String subject = "Transfer Completed";
        String body = String.format(
                "Your transfer of ₹%s is completed.\nTxnId: %d\nAccount: %d",
                req.getAmount().toPlainString(), req.getTransactionId(), req.getAccountId()
        );
        return send(req.getChannel(), req.getRecipient(), subject, body);
    }

    @Transactional
    public Long notifyKycDecision(KycDecisionNotificationRequest req) {
        String subject = "KYC " + req.getDecision();
        String reasonLine = (req.getReason() != null && !req.getReason().isBlank())
                ? ("\nReason: " + req.getReason())
                : "";
        String body = "Your KYC status is " + req.getDecision() + "." + reasonLine;
        return send(req.getChannel(), req.getRecipient(), subject, body);
    }

    private Long send(Channel channel, String recipient, String subject, String body) {
        DeliveryLog logRow = new DeliveryLog();
        logRow.setChannel(channel);
        logRow.setRecipient(recipient);
        logRow.setSubject(subject);
        logRow.setBody(body);

        try {
            // MOCK: just log to console
            if (channel == Channel.SMS) {
                log.info("[SMS] to={} subject='{}' body='{}'", recipient, subject, body);
            } else {
                log.info("[EMAIL] to={} subject='{}' body='{}'", recipient, subject, body);
            }
            logRow.setStatus(DeliveryStatus.SENT);
        } catch (Exception ex) {
            logRow.setStatus(DeliveryStatus.FAILED);
            logRow.setError(ex.getMessage());
        }
        return repo.save(logRow).getId();
    }
}
