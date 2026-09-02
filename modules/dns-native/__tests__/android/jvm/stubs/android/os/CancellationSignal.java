package android.os;

public final class CancellationSignal {
    private volatile boolean canceled;
    private volatile OnCancelListener listener;

    public void cancel() {
        canceled = true;
        OnCancelListener currentListener = listener;
        if (currentListener != null) {
            currentListener.onCancel();
        }
    }

    public boolean isCanceled() {
        return canceled;
    }

    public void setOnCancelListener(OnCancelListener onCancelListener) {
        listener = onCancelListener;
        if (canceled && onCancelListener != null) {
            onCancelListener.onCancel();
        }
    }

    public interface OnCancelListener {
        void onCancel();
    }
}
