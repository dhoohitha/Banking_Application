package com.bank.customerservice.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record CustomerCreateRequest(
        @NotBlank String fullName,
        @NotBlank @Email String email,
        String phone
) { }
