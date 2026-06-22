import React from "react";
import {
  View,
  Text,
  StyleSheet,
} from "react-native";
import { useImessagePalette } from "../ui/theme/imessagePalette";
import { devWarn } from "../utils/devLog";
import { PressableRipple } from "./PressableRipple";

const FALLBACK_COPY = {
  title: "Something went wrong",
  unknownError: "An unexpected error occurred.",
  reset: "Reset",
};

interface Props {
  children: React.ReactNode;
  /**
   * Optional custom fallback. When provided it replaces the default full-screen
   * fallback — use it to scope recovery to a subtree (e.g. the message list) so a
   * single failing child cannot blank the whole app. `retry` clears the error and
   * re-mounts `children`.
   */
  fallback?: (error: Error | undefined, retry: () => void) => React.ReactNode;
  /** Called when the boundary catches an error (in addition to dev logging). */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    devWarn("ErrorBoundary caught an error", {
      error: error.message,
      componentStack: errorInfo.componentStack,
    });
    this.props.onError?.(error, errorInfo);
  }

  private readonly handleRetry = () => this.setState({ hasError: false });

  override render() {
    if (this.state.hasError) {
      const error = this.state.error;
      if (this.props.fallback) {
        return this.props.fallback(error, this.handleRetry);
      }
      return (
        <ErrorFallback
          {...(error ? { error } : {})}
          onRetry={this.handleRetry}
        />
      );
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error?: Error;
  onRetry: () => void;
}

function ErrorFallback({ error, onRetry }: ErrorFallbackProps) {
  const palette = useImessagePalette();

  return (
    <View
      style={[styles.container, { backgroundColor: palette.background }]}
    >
      <Text style={[styles.title, { color: palette.textPrimary }]}>
        {FALLBACK_COPY.title}
      </Text>
      <Text style={[styles.message, { color: palette.textSecondary }]}>
        {error?.message || FALLBACK_COPY.unknownError}
      </Text>
      <PressableRipple
        style={[styles.retryButton, { backgroundColor: palette.userBubble }]}
        onPress={onRetry}
        accessibilityRole="button"
        accessibilityLabel={FALLBACK_COPY.reset}
        variant="primary"
      >
        <Text
          style={[styles.retryButtonText, { color: palette.bubbleTextOnBlue }]}
        >
          {FALLBACK_COPY.reset}
        </Text>
      </PressableRipple>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    marginBottom: 32,
    textAlign: "center",
    lineHeight: 22,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
