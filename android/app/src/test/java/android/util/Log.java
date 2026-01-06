package android.util;

/**
 * Minimal JVM test stub for android.util.Log to avoid "not mocked" errors.
 */
public final class Log {
    private Log() {}

    public static int d(String tag, String msg) {
        return 0;
    }

    public static int i(String tag, String msg) {
        return 0;
    }

    public static int w(String tag, String msg) {
        return 0;
    }

    public static int e(String tag, String msg) {
        return 0;
    }

    public static int v(String tag, String msg) {
        return 0;
    }
}
