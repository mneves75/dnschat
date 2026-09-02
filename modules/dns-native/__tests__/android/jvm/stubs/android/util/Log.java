package android.util;

public final class Log {
    private Log() {}

    public static int d(String tag, String message) {
        return 0;
    }

    // android.util.Log declares both overloads; the stub must mirror that surface or
    // production call sites using the two-arg form fail to compile here but not on device.
    public static int e(String tag, String message) {
        return 0;
    }

    public static int e(String tag, String message, Throwable error) {
        return 0;
    }

    public static int w(String tag, String message) {
        return 0;
    }
}
