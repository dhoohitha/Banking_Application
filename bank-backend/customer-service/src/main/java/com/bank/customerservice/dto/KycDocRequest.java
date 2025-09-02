package com.bank.customerservice.dto;

import jakarta.validation.constraints.NotBlank;

public record KycDocRequest(
        @NotBlank String docType,
        @NotBlank String docUrl
) { }
