package com.bank.customerservice.events;

import com.bank.customerservice.entity.Customer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class LogOnlyCustomerEventsPublisher implements CustomerEventsPublisher {

    private static final Logger log =
            LoggerFactory.getLogger(LogOnlyCustomerEventsPublisher.class);

    @Override
    public void publishKycSubmitted(Customer c) {
        log.info("[EVENT] kyc_submitted customerId={} email={}", c.getId(), c.getEmail());
    }

    @Override
    public void publishKycApproved(Customer c, String actor) {
        log.info("[EVENT] kyc_approved customerId={} actor={}", c.getId(), actor);
    }

    @Override
    public void publishKycRejected(Customer c, String actor, String reason) {
        log.info("[EVENT] kyc_rejected customerId={} actor={} reason={}", c.getId(), actor, reason);
    }

	public static Logger getLog() {
		return log;
	}
}
