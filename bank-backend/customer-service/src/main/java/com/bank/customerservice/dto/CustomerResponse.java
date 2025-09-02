package com.bank.customerservice.dto;

import com.bank.customerservice.entity.KycStatus;

import java.time.Instant;
import java.util.List;

public record CustomerResponse(
        Long id,
        String fullName,
        String email,
        String phone,
        KycStatus kycStatus,
        List<KycDocResponse> kycDocs,
        Instant createdAt,
        Instant updatedAt
) {}
