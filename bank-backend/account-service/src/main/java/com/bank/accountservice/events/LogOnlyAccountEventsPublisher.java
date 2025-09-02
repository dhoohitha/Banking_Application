package com.bank.accountservice.events;

import com.bank.accountservice.entity.Account;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class LogOnlyAccountEventsPublisher implements AccountEventsPublisher {
    private static final Logger log = LoggerFactory.getLogger(LogOnlyAccountEventsPublisher.class);

    @Override
    public void publishAccountOpened(Account account) {
        log.info("[EVENT] account_opened accountId={} customerId={} accountNo={}",
                account.getId(), account.getCustomerId(), account.getAccountNo());
    }
}
