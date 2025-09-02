package com.bank.notificationservice.repository;

import com.bank.notificationservice.entity.DeliveryLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DeliveryLogRepository extends JpaRepository<DeliveryLog, Long> { }
