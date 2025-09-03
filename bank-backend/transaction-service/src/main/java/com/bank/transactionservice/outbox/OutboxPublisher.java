package com.bank.transactionservice.outbox;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.PageRequest;

import java.util.List;

@Component
public class OutboxPublisher {

    private final OutboxEventRepository repo;
    private final KafkaTemplate<String, String> kafka;
    private final String transfersTopic;

    public OutboxPublisher(OutboxEventRepository repo,
                           KafkaTemplate<String, String> kafka,
                           @Value("${app.kafka.transfers-topic:transactions.transfers}") String transfersTopic) {
        this.repo = repo;
        this.kafka = kafka;
        this.transfersTopic = transfersTopic;
    }

    @Transactional
    @Scheduled(fixedDelay = 1000) // every 1 second
    public void publish() {
        List<OutboxEvent> batch = repo.findByStatusOrderByCreatedAtAsc(OutboxEvent.Status.NEW, PageRequest.of(0, 100));
        for (OutboxEvent e : batch) {
            try {
                // Use txId (aggregateId) as the message key for ordering per transaction
                kafka.send(transfersTopic, e.getAggregateId(), e.getPayload()).get();
                e.markSent();
            } catch (Exception ex) {
                e.setAttempts(e.getAttempts() == null ? 1 : e.getAttempts() + 1);
                // Don’t block future ones; leave as NEW for retries or mark FAILED after many tries
                if (e.getAttempts() >= 10) {
                    e.markFailed(ex.toString());
                }
            }
        }
        repo.saveAll(batch);
    }
}
