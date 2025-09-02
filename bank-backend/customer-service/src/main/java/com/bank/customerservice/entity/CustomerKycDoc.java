package com.bank.customerservice.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

@Entity
@Table(name = "customer_kyc_docs")
public class CustomerKycDoc {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String docType;

    @Column(nullable = false)
    private String docUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private KycDocStatus status = KycDocStatus.UPLOADED;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @CreationTimestamp
    private Instant uploadedAt;

    // ----- constructors -----
    public CustomerKycDoc() { }

    public CustomerKycDoc(Long id, String docType, String docUrl, KycDocStatus status, Customer customer) {
        this.id = id;
        this.docType = docType;
        this.docUrl = docUrl;
        this.status = status;
        this.customer = customer;
    }

    // ----- getters/setters -----
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getDocType() { return docType; }
    public void setDocType(String docType) { this.docType = docType; }

    public String getDocUrl() { return docUrl; }
    public void setDocUrl(String docUrl) { this.docUrl = docUrl; }

    public KycDocStatus getStatus() { return status; }
    public void setStatus(KycDocStatus status) { this.status = status; }

    public Customer getCustomer() { return customer; }
    public void setCustomer(Customer customer) { this.customer = customer; }

    public Instant getUploadedAt() { return uploadedAt; }
    public void setUploadedAt(Instant uploadedAt) { this.uploadedAt = uploadedAt; }
}
