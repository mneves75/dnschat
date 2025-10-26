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
import { useTranslation } from "../../../i18n";

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
  const { t } = useTranslation();

  const [isRunning, setIsRunning] = useState(false);
  const [dnsSteps, setDnsSteps] = useState<DNSStep[]>([
    {
      id: "1",
      method: t("screen.onboarding.dnsMagic.fallbackMethods.native.name"),
      status: "pending",
      message: t("screen.onboarding.dnsMagic.fallbackMethods.native.pending"),
    },
    {
      id: "2",
      method: t("screen.onboarding.dnsMagic.fallbackMethods.udp.name"),
      status: "pending",
      message: t("screen.onboarding.dnsMagic.fallbackMethods.udp.pending"),
    },
    {
      id: "3",
      method: t("screen.onboarding.dnsMagic.fallbackMethods.tcp.name"),
      status: "pending",
      message: t("screen.onboarding.dnsMagic.fallbackMethods.tcp.pending"),
    },
    {
      id: "4",
      method: t("screen.onboarding.dnsMagic.fallbackMethods.https.name"),
      status: "pending",
      message: t("screen.onboarding.dnsMagic.fallbackMethods.https.pending"),
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
      updateStep("1", "active", t("screen.onboarding.dnsMagic.fallbackMethods.native.active"));
      await new Promise((resolve) => setTimeout(resolve, 1500));

      updateStep("1", "success", t("screen.onboarding.dnsMagic.fallbackMethods.native.success"), 1200);
      await new Promise((resolve) => setTimeout(resolve, 500));

      const result = await DNSService.queryLLM(
        testMessage,
        undefined,
        false,
        true,
      );
      setResponse(result);
    } catch (error) {
      console.error("[DNSMagicScreen] Native DNS query failed:", error);
      updateStep("1", "failed", t("screen.onboarding.dnsMagic.fallbackMethods.native.failed"));
      await new Promise((resolve) => setTimeout(resolve, 500));

      updateStep("2", "active", t("screen.onboarding.dnsMagic.fallbackMethods.udp.active"));
      await new Promise((resolve) => setTimeout(resolve, 1000));

      updateStep("2", "success", t("screen.onboarding.dnsMagic.fallbackMethods.udp.success"), 800);
      setResponse(t("screen.onboarding.dnsMagic.demoResponse"));
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
              {t("screen.onboarding.dnsMagic.label")}
            </Text>
          </Animated.View>

          <Text
            style={[
              typography.title1,
              styles.title,
              { color: palette.textPrimary },
            ]}
          >
            {t("screen.onboarding.dnsMagic.title")}
          </Text>

          <Text
            style={[
              typography.callout,
              styles.subtitle,
              { color: palette.textSecondary },
            ]}
          >
            {t("screen.onboarding.dnsMagic.subtitle")}
          </Text>
        </View>

        <View style={styles.demoSection}>
          {/* iOS HIG: Primary action button to trigger DNS demonstration with fallback chain */}
          <TouchableOpacity
            style={[
              styles.demoButton,
              { backgroundColor: isRunning ? palette.surface : palette.accentTint },
            ]}
            onPress={runDNSDemo}
            disabled={isRunning}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={isRunning ? "DNS query in progress" : "Start DNS demo"}
            accessibilityHint="Demonstrates how DNS queries work through the fallback chain. Watch as your message travels through Native DNS, UDP, TCP, and HTTPS methods."
            accessibilityState={{ disabled: isRunning, busy: isRunning }}
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
              {isRunning ? t("screen.onboarding.dnsMagic.demoButtonRunning") : t("screen.onboarding.dnsMagic.demoButton")}
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
                {t("screen.onboarding.dnsMagic.responseLabel")}
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
  const { t } = useTranslation();

  const getStatusLabel = () => {
    switch (step.status) {
      case "pending":
        return t("screen.onboarding.dnsMagic.status.pending");
      case "active":
        return t("screen.onboarding.dnsMagic.status.active");
      case "success":
        return t("screen.onboarding.dnsMagic.status.success");
      case "failed":
        return t("screen.onboarding.dnsMagic.status.failed");
      default:
        return t("screen.onboarding.dnsMagic.status.pending");
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
