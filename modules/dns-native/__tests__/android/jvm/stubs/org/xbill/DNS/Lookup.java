package org.xbill.DNS;

import java.util.concurrent.atomic.AtomicInteger;

public final class Lookup {
    private static final AtomicInteger RUN_COUNT = new AtomicInteger();

    public Lookup(String name, int type) {}

    public void setResolver(Resolver resolver) {}

    public Record[] run() {
        RUN_COUNT.incrementAndGet();
        return null;
    }

    public static int getRunCount() {
        return RUN_COUNT.get();
    }

    public static void resetRunCount() {
        RUN_COUNT.set(0);
    }
}
