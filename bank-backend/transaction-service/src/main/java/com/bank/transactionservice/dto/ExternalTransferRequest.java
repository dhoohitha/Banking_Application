package com.bank.transactionservice.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class ExternalTransferRequest {
    @NotBlank private String externalId;   // idempotency key
    @NotNull  private Long   fromAccountId;
    @NotBlank private String beneficiaryName;
    @NotBlank private String beneficiaryBankCode;
    @NotBlank private String beneficiaryAccountNo;
    @NotNull @DecimalMin("0.01")
    private BigDecimal amount;

    public String getExternalId() { return externalId; }
    public void setExternalId(String externalId) { this.externalId = externalId; }
    public Long getFromAccountId() { return fromAccountId; }
    public void setFromAccountId(Long fromAccountId) { this.fromAccountId = fromAccountId; }
    public String getBeneficiaryName() { return beneficiaryName; }
    public void setBeneficiaryName(String beneficiaryName) { this.beneficiaryName = beneficiaryName; }
    public String getBeneficiaryBankCode() { return beneficiaryBankCode; }
    public void setBeneficiaryBankCode(String beneficiaryBankCode) { this.beneficiaryBankCode = beneficiaryBankCode; }
    public String getBeneficiaryAccountNo() { return beneficiaryAccountNo; }
    public void setBeneficiaryAccountNo(String beneficiaryAccountNo) { this.beneficiaryAccountNo = beneficiaryAccountNo; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
}
