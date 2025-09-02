package com.bank.accountservice.events;

import com.bank.accountservice.entity.Account;

public interface AccountEventsPublisher {
    void publishAccountOpened(Account account);
}
