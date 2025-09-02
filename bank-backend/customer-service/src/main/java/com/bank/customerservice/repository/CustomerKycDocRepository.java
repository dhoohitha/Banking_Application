package com.bank.customerservice.repository;

import com.bank.customerservice.entity.CustomerKycDoc;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomerKycDocRepository extends JpaRepository<CustomerKycDoc, Long> {
}
