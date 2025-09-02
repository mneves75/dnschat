import React from "react";
import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
  Animated,
  Dimensions,
} from "react-native";
import { useOnboarding } from "../../context/OnboardingContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const PROGRESS_WIDTH = SCREEN_WIDTH - 32;

export function OnboardingProgress() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { currentStep, steps } = useOnboarding();

  const progress = (currentStep + 1) / steps.length;
  const animatedWidth = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text
          style={[
            styles.stepText,
            isDark ? styles.darkStepText : styles.lightStepText,
          ]}
        >
          Step {currentStep + 1} of {steps.length}
        </Text>
        <Text
          style={[
            styles.titleText,
            isDark ? styles.darkTitleText : styles.lightTitleText,
          ]}
        >
          {steps[currentStep]?.title || ""}
        </Text>
      </View>

      <View style={styles.progressContainer}>
        <View
          style={[
            styles.progressBackground,
            isDark
              ? styles.darkProgressBackground
              : styles.lightProgressBackground,
          ]}
        >
          <Animated.View
            style={[
              styles.progressBar,
              isDark ? styles.darkProgressBar : styles.lightProgressBar,
              {
                width: animatedWidth.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, PROGRESS_WIDTH],
                }),
              },
            ]}
          />
        </View>

        <View style={styles.dotsContainer}>
          {steps.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index <= currentStep
                  ? isDark
                    ? styles.darkActiveDot
                    : styles.lightActiveDot
                  : isDark
                    ? styles.darkInactiveDot
                    : styles.lightInactiveDot,
              ]}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  header: {
    marginBottom: 16,
  },
  stepText: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
  },
  lightStepText: {
    color: "#666666",
  },
  darkStepText: {
    color: "#999999",
  },
  titleText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  lightTitleText: {
    color: "#000000",
  },
  darkTitleText: {
    color: "#FFFFFF",
  },
  progressContainer: {
    position: "relative",
  },
  progressBackground: {
    width: PROGRESS_WIDTH,
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  lightProgressBackground: {
    backgroundColor: "#E5E5EA",
  },
  darkProgressBackground: {
    backgroundColor: "#2C2C2E",
  },
  progressBar: {
    height: "100%",
    borderRadius: 2,
  },
  lightProgressBar: {
    backgroundColor: "#007AFF",
  },
  darkProgressBar: {
    backgroundColor: "#0A84FF",
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    position: "absolute",
    top: -2,
    width: PROGRESS_WIDTH,
    paddingHorizontal: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  lightActiveDot: {
    backgroundColor: "#007AFF",
  },
  darkActiveDot: {
    backgroundColor: "#0A84FF",
  },
  lightInactiveDot: {
    backgroundColor: "#E5E5EA",
  },
  darkInactiveDot: {
    backgroundColor: "#2C2C2E",
  },
});
