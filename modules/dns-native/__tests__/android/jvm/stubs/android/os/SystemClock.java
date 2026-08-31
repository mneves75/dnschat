package android.os;

public final class SystemClock {
    private SystemClock() {}

    public static long elapsedRealtimeNanos() {
        return System.nanoTime();
    }
}
