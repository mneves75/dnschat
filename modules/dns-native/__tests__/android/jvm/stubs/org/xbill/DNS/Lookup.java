package org.xbill.DNS;

import java.util.concurrent.atomic.AtomicInteger;

public final class Lookup {
    private static final AtomicInteger RUN_COUNT = new AtomicInteger();

    private static volatile Name lastName;
    private static volatile Record[] nextRecords;
    private static volatile Boolean lastRunUsedTemporaryCache;

    private boolean temporaryCache;

    // Only the absolute-Name overload is stubbed: the String overload is the one
    // that walks the search path, so omitting it makes a regression fail to compile.
    public Lookup(Name name, int type) {
        lastName = name;
    }

    public static Name getLastName() {
        return lastName;
    }

    public void setResolver(Resolver resolver) {}

    // dnsjava 3.6.2: null installs a fresh per-lookup Cache (temporary_cache=true);
    // without this call run() reads and writes the process-wide default cache, which
    // replays an earlier answer for the same name without contacting the server.
    public void setCache(Cache cache) {
        temporaryCache = cache == null;
    }

    public Record[] run() {
        RUN_COUNT.incrementAndGet();
        lastRunUsedTemporaryCache = temporaryCache;
        return nextRecords;
    }

    public static int getRunCount() {
        return RUN_COUNT.get();
    }

    public static void resetRunCount() {
        RUN_COUNT.set(0);
    }

    public static void setNextRecords(Record[] records) {
        nextRecords = records;
    }

    public static Boolean getLastRunUsedTemporaryCache() {
        return lastRunUsedTemporaryCache;
    }

    public static void resetObservations() {
        nextRecords = null;
        lastRunUsedTemporaryCache = null;
    }
}
