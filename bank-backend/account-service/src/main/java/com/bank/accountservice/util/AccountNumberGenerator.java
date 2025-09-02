package com.bank.accountservice.util;

import java.util.concurrent.ThreadLocalRandom;

public class AccountNumberGenerator {
    // naive: 12-digit number; ensure uniqueness in DB (unique constraint)
    public static String generate() {
        long part1 = ThreadLocalRandom.current().nextLong(100_000L, 999_999L);
        long part2 = ThreadLocalRandom.current().nextLong(100_000L, 999_999L);
        return String.valueOf(part1) + String.valueOf(part2);
    }
}
