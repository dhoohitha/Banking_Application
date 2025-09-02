package com.bank.customerservice.dto;

import com.bank.customerservice.entity.KycDocStatus;

import java.time.Instant;

public record KycDocResponse(
        Long id,
        String docType,
        String docUrl,
        KycDocStatus status,
        Instant uploadedAt
) {}
