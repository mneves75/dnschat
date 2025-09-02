import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from "react-native";

interface Props {
  children: React.ReactNode;
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

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          error={this.state.error}
          onRetry={() => this.setState({ hasError: false })}
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
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <View
      style={[
        styles.container,
        isDark ? styles.darkContainer : styles.lightContainer,
      ]}
    >
      <Text
        style={[styles.title, isDark ? styles.darkTitle : styles.lightTitle]}
      >
        Oops! Something went wrong
      </Text>
      <Text
        style={[
          styles.message,
          isDark ? styles.darkMessage : styles.lightMessage,
        ]}
      >
        {error?.message || "An unexpected error occurred"}
      </Text>
      <TouchableOpacity
        style={[
          styles.retryButton,
          isDark ? styles.darkRetryButton : styles.lightRetryButton,
        ]}
        onPress={onRetry}
      >
        <Text
          style={[
            styles.retryButtonText,
            isDark ? styles.darkRetryButtonText : styles.lightRetryButtonText,
          ]}
        >
          Try Again
        </Text>
      </TouchableOpacity>
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
  lightContainer: {
    backgroundColor: "#FFFFFF",
  },
  darkContainer: {
    backgroundColor: "#000000",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  lightTitle: {
    color: "#000000",
  },
  darkTitle: {
    color: "#FFFFFF",
  },
  message: {
    fontSize: 16,
    marginBottom: 32,
    textAlign: "center",
    lineHeight: 22,
  },
  lightMessage: {
    color: "#8E8E93",
  },
  darkMessage: {
    color: "#8E8E93",
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  lightRetryButton: {
    backgroundColor: "#007AFF",
  },
  darkRetryButton: {
    backgroundColor: "#007AFF",
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  lightRetryButtonText: {
    color: "#FFFFFF",
  },
  darkRetryButtonText: {
    color: "#FFFFFF",
  },
});
