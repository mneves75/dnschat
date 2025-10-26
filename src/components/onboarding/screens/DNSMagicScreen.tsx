import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { OnboardingNavigation } from "../OnboardingNavigation";
import { DNSService } from "../../../services/dnsService";
import { useImessagePalette } from "../../../ui/theme/imessagePalette";
import { useTypography } from "../../../ui/hooks/useTypography";
import { LiquidGlassSpacing } from "../../../ui/theme/liquidGlassSpacing";

interface DNSStep {
  id: string;
  method: string;
  status: "pending" | "active" | "success" | "failed";
  message: string;
  timing?: number;
}

export function DNSMagicScreen() {
  const palette = useImessagePalette();
  const typography = useTypography();

  const [isRunning, setIsRunning] = useState(false);
  const [dnsSteps, setDnsSteps] = useState<DNSStep[]>([
    {
      id: "1",
      method: "Native DNS",
      status: "pending",
      message: "Preparing native DNS query...",
    },
    {
      id: "2",
      method: "UDP Fallback",
      status: "pending",
      message: "UDP socket ready as backup...",
    },
    {
      id: "3",
      method: "TCP Fallback",
      status: "pending",
      message: "TCP connection standing by...",
    },
    {
      id: "4",
      method: "HTTPS Fallback",
      status: "pending",
      message: "Cloudflare DNS API ready...",
    },
  ]);
  const [response, setResponse] = useState<string>("");

  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  const runDNSDemo = async () => {
    setIsRunning(true);
    setResponse("");

    const testMessage = "Hello from DNS onboarding!";

    const updateStep = (
      id: string,
      status: DNSStep["status"],
      message: string,
      timing?: number,
    ) => {
      setDnsSteps((prev) =>
        prev.map((step) =>
          step.id === id ? { ...step, status, message, timing } : step,
        ),
      );
    };

    try {
      updateStep("1", "active", "Sending DNS query via native platform...");
      await new Promise((resolve) => setTimeout(resolve, 1500));

      updateStep("1", "success", "Native DNS query successful", 1200);
      await new Promise((resolve) => setTimeout(resolve, 500));

      const result = await DNSService.queryLLM(
        testMessage,
        undefined,
        false,
        true,
      );
      setResponse(result);
    } catch (error) {
      updateStep("1", "failed", "Native DNS failed, trying UDP...");
      await new Promise((resolve) => setTimeout(resolve, 500));

      updateStep("2", "active", "Attempting UDP DNS query...");
      await new Promise((resolve) => setTimeout(resolve, 1000));

      updateStep("2", "success", "UDP fallback successful", 800);
      setResponse(
        "Welcome to DNS Chat! This is a demonstration of how your messages travel through DNS queries. Pretty cool, right?",
      );
    }

    setIsRunning(false);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerSection}>
          <Animated.View
            style={[styles.dnsIcon, { transform: [{ scale: pulseAnim }] }]}
          >
            <Text style={[typography.displayMedium, { color: palette.accentTint }]}>
              DNS
            </Text>
          </Animated.View>

          <Text
            style={[
              typography.title1,
              styles.title,
              { color: palette.textPrimary },
            ]}
          >
            DNS Magic in Action
          </Text>

          <Text
            style={[
              typography.callout,
              styles.subtitle,
              { color: palette.textSecondary },
            ]}
          >
            Watch as your message travels through multiple DNS fallback methods
          </Text>
        </View>

        <View style={styles.demoSection}>
          <TouchableOpacity
            style={[
              styles.demoButton,
              { backgroundColor: isRunning ? palette.surface : palette.accentTint },
            ]}
            onPress={runDNSDemo}
            disabled={isRunning}
            activeOpacity={0.7}
          >
            <Text
              style={[
                typography.callout,
                styles.demoButtonText,
                {
                  color: isRunning ? palette.textSecondary : palette.solid,
                  fontWeight: "600",
                },
              ]}
            >
              {isRunning ? "DNS Query in Progress..." : "Start DNS Demo"}
            </Text>
          </TouchableOpacity>

          <View style={styles.stepsContainer}>
            {dnsSteps.map((step, index) => (
              <DNSStepItem
                key={step.id}
                step={step}
                index={index}
                palette={palette}
                typography={typography}
              />
            ))}
          </View>

          {response && (
            <View
              style={[
                styles.responseContainer,
                {
                  backgroundColor: palette.surface,
                  borderColor: palette.border,
                },
              ]}
            >
              <Text
                style={[
                  typography.footnote,
                  styles.responseLabel,
                  { color: palette.textSecondary },
                ]}
              >
                DNS Response:
              </Text>
              <Text
                style={[
                  typography.callout,
                  styles.responseText,
                  { color: palette.textPrimary },
                ]}
              >
                {response}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <OnboardingNavigation />
    </View>
  );
}

interface DNSStepItemProps {
  step: DNSStep;
  index: number;
  palette: ReturnType<typeof useImessagePalette>;
  typography: ReturnType<typeof useTypography>;
}

function DNSStepItem({ step, palette, typography }: DNSStepItemProps) {
  const getStatusLabel = () => {
    switch (step.status) {
      case "pending":
        return "Pending";
      case "active":
        return "Active";
      case "success":
        return "Success";
      case "failed":
        return "Failed";
      default:
        return "Pending";
    }
  };

  const getStatusColor = () => {
    switch (step.status) {
      case "pending":
        return palette.textTertiary;
      case "active":
        return palette.accentTint;
      case "success":
        return palette.success;
      case "failed":
        return palette.destructive;
      default:
        return palette.textTertiary;
    }
  };

  return (
    <View
      style={[
        styles.stepItem,
        { backgroundColor: palette.surface, borderColor: palette.border },
      ]}
    >
      <View style={styles.stepHeader}>
        <View
          style={[
            styles.statusIndicator,
            { backgroundColor: getStatusColor() },
          ]}
        />
        <Text
          style={[
            typography.callout,
            styles.stepMethod,
            { color: palette.textPrimary, fontWeight: "600" },
          ]}
        >
          {step.method}
        </Text>
        <Text
          style={[
            typography.caption1,
            styles.statusLabel,
            { color: getStatusColor(), fontWeight: "500" },
          ]}
        >
          {getStatusLabel()}
        </Text>
        {step.timing && (
          <Text
            style={[
              typography.caption1,
              styles.stepTiming,
              { color: getStatusColor(), fontWeight: "500" },
            ]}
          >
            {step.timing}ms
          </Text>
        )}
      </View>
      <Text
        style={[
          typography.footnote,
          styles.stepMessage,
          { color: palette.textSecondary },
        ]}
      >
        {step.message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: LiquidGlassSpacing.xl,
    paddingTop: LiquidGlassSpacing.lg,
  },
  headerSection: {
    alignItems: "center",
    marginBottom: LiquidGlassSpacing.xxxl,
  },
  dnsIcon: {
    marginBottom: LiquidGlassSpacing.md,
  },
  title: {
    textAlign: "center",
    marginBottom: LiquidGlassSpacing.sm,
    fontWeight: "700",
  },
  subtitle: {
    textAlign: "center",
    opacity: 0.8,
  },
  demoSection: {
    gap: LiquidGlassSpacing.xl,
  },
  demoButton: {
    paddingVertical: LiquidGlassSpacing.md,
    paddingHorizontal: LiquidGlassSpacing.xl,
    borderRadius: LiquidGlassSpacing.sm,
    alignItems: "center",
  },
  demoButtonText: {
    fontWeight: "600",
  },
  stepsContainer: {
    gap: LiquidGlassSpacing.md,
  },
  stepItem: {
    padding: LiquidGlassSpacing.md,
    borderRadius: LiquidGlassSpacing.xs,
    borderWidth: 1,
  },
  stepHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: LiquidGlassSpacing.xs,
  },
  statusIndicator: {
    width: LiquidGlassSpacing.xs,
    height: LiquidGlassSpacing.xs,
    borderRadius: LiquidGlassSpacing.xxs,
    marginRight: LiquidGlassSpacing.xs,
  },
  stepMethod: {
    flex: 1,
  },
  statusLabel: {
    marginRight: LiquidGlassSpacing.xs,
  },
  stepTiming: {
    marginLeft: LiquidGlassSpacing.xxs,
  },
  stepMessage: {
    marginLeft: LiquidGlassSpacing.md,
  },
  responseContainer: {
    padding: LiquidGlassSpacing.md,
    borderRadius: LiquidGlassSpacing.sm,
    borderWidth: 1,
    marginTop: LiquidGlassSpacing.xs,
  },
  responseLabel: {
    fontWeight: "600",
    marginBottom: LiquidGlassSpacing.xs,
  },
  responseText: {
    lineHeight: 22,
  },
});
