package com.bank.customerservice.events;

import com.bank.customerservice.entity.Customer;

public interface CustomerEventsPublisher {
    void publishKycSubmitted(Customer customer);
    void publishKycApproved(Customer customer, String actor);
    void publishKycRejected(Customer customer, String actor, String reason);
}
