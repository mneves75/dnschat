package org.xbill.DNS;

import java.util.concurrent.atomic.AtomicInteger;

public final class Lookup {
    private static final AtomicInteger RUN_COUNT = new AtomicInteger();

    private static volatile Name lastName;

    // Only the absolute-Name overload is stubbed: the String overload is the one
    // that walks the search path, so omitting it makes a regression fail to compile.
    public Lookup(Name name, int type) {
        lastName = name;
    }

    public static Name getLastName() {
        return lastName;
    }

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
