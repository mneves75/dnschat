package android.net;

import android.os.CancellationSignal;

import java.net.InetAddress;
import java.util.List;
import java.util.concurrent.Executor;
import java.util.concurrent.atomic.AtomicInteger;

public final class DnsResolver {
    public static final int FLAG_EMPTY = 0;

    private static final DnsResolver INSTANCE = new DnsResolver();
    private static final AtomicInteger QUERY_COUNT = new AtomicInteger();
    private static volatile CancellationSignal lastCancellationSignal;
    private static volatile boolean throwOnQuery;
    private static volatile boolean errorOnCancel;
    private static volatile List<InetAddress> answer;

    private DnsResolver() {}

    public static DnsResolver getInstance() {
        return INSTANCE;
    }

    public void query(
        Network network,
        String host,
        int flags,
        Executor executor,
        CancellationSignal cancellationSignal,
        Callback<? super List<InetAddress>> callback
    ) {
        lastCancellationSignal = cancellationSignal;
        QUERY_COUNT.incrementAndGet();
        if (throwOnQuery) {
            throw new IllegalStateException("platform resolver setup failed");
        }
        if (errorOnCancel) {
            cancellationSignal.setOnCancelListener(
                () -> callback.onError(new DnsException("platform resolver cancelled"))
            );
        }
        List<InetAddress> currentAnswer = answer;
        if (currentAnswer != null) {
            executor.execute(() -> callback.onAnswer(currentAnswer, 0));
        }
    }

    public static void reset() {
        lastCancellationSignal = null;
        QUERY_COUNT.set(0);
        throwOnQuery = false;
        errorOnCancel = false;
        answer = null;
    }

    public static int getQueryCount() {
        return QUERY_COUNT.get();
    }

    public static CancellationSignal getLastCancellationSignal() {
        return lastCancellationSignal;
    }

    public static void setThrowOnQuery(boolean shouldThrow) {
        throwOnQuery = shouldThrow;
    }

    public static void setErrorOnCancel(boolean shouldError) {
        errorOnCancel = shouldError;
    }

    public static void setAnswer(List<InetAddress> addresses) {
        answer = addresses;
    }

    public interface Callback<T> {
        void onAnswer(T answer, int responseCode);
        void onError(DnsException error);
    }

    public static final class DnsException extends Exception {
        public DnsException(String message) {
            super(message);
        }
    }
}
