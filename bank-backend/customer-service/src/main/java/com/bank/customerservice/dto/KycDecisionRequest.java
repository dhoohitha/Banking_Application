package com.bank.customerservice.dto;

import jakarta.validation.constraints.NotBlank;

public record KycDecisionRequest(
        // optional reason for rejection; if approving, ignore
        String reason,
        @NotBlank String actor   // who (email/name) took the action - simple audit
) { }
