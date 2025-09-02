package com.bank.customerservice.repository;

import com.bank.customerservice.entity.Customer;
import com.bank.customerservice.entity.KycStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CustomerRepository extends JpaRepository<Customer, Long> {
    Optional<Customer> findByEmail(String email);
    Page<Customer> findByKycStatus(KycStatus status, Pageable pageable);
}
