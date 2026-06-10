import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from "react-native";
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { OnboardingNavigation } from "../OnboardingNavigation";
import { PressableRipple } from "../../PressableRipple";
import { useMotionReduction } from "../../../context/AccessibilityContext";
import { DNSService } from "../../../services/dnsService";
import { useImessagePalette } from "../../../ui/theme/imessagePalette";
import { useTypography } from "../../../ui/hooks/useTypography";
import { LiquidGlassSpacing } from "../../../ui/theme/liquidGlassSpacing";
import { useTranslation } from "../../../i18n";
import { devWarn } from "../../../utils/devLog";
import { wait } from "../../../utils/wait";

interface DNSStep {
  id: string;
  method: string;
  status: "pending" | "active" | "success" | "failed";
  message: string;
  timing?: number;
}

const DNS_DEMO_STEPS = [
  {
    id: "1",
    transport: "native",
    methodKey: "screen.onboarding.dnsMagic.fallbackMethods.native.name",
    pendingKey: "screen.onboarding.dnsMagic.fallbackMethods.native.pending",
    activeKey: "screen.onboarding.dnsMagic.fallbackMethods.native.active",
    successKey: "screen.onboarding.dnsMagic.fallbackMethods.native.success",
    failedKey: "screen.onboarding.dnsMagic.fallbackMethods.native.failed",
  },
  {
    id: "2",
    transport: "udp",
    methodKey: "screen.onboarding.dnsMagic.fallbackMethods.udp.name",
    pendingKey: "screen.onboarding.dnsMagic.fallbackMethods.udp.pending",
    activeKey: "screen.onboarding.dnsMagic.fallbackMethods.udp.active",
    successKey: "screen.onboarding.dnsMagic.fallbackMethods.udp.success",
    failedKey: "screen.onboarding.dnsMagic.fallbackMethods.udp.failed",
  },
  {
    id: "3",
    transport: "tcp",
    methodKey: "screen.onboarding.dnsMagic.fallbackMethods.tcp.name",
    pendingKey: "screen.onboarding.dnsMagic.fallbackMethods.tcp.pending",
    activeKey: "screen.onboarding.dnsMagic.fallbackMethods.tcp.active",
    successKey: "screen.onboarding.dnsMagic.fallbackMethods.tcp.success",
    failedKey: "screen.onboarding.dnsMagic.fallbackMethods.tcp.failed",
  },
] as const;

export function DNSMagicScreen() {
  const palette = useImessagePalette();
  const typography = useTypography();
  const { t } = useTranslation();
  const { shouldReduceMotion } = useMotionReduction();

  const createInitialDnsSteps = (): DNSStep[] =>
    DNS_DEMO_STEPS.map((step) => ({
      id: step.id,
      method: t(step.methodKey),
      status: "pending",
      message: t(step.pendingKey),
    }));

  const [isRunning, setIsRunning] = useState(false);
  const [dnsSteps, setDnsSteps] = useState<DNSStep[]>(createInitialDnsSteps);
  const [response, setResponse] = useState<string>("");

  const pulseAnim = useSharedValue(1);

  // Effect: start the Reanimated pulse animation on mount and cancel on unmount.
  useEffect(() => {
    if (shouldReduceMotion) {
      pulseAnim.set(1);
      return;
    }

    pulseAnim.set(withRepeat(
      withSequence(
        withTiming(1.1, { duration: 1000 }),
        withTiming(1, { duration: 1000 }),
      ),
      -1,
      false,
    ));

    return () => {
      cancelAnimation(pulseAnim);
    };
  }, [shouldReduceMotion]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnim.get() }],
  }));

  const runDNSDemo = async () => {
    setIsRunning(true);
    setResponse("");
    setDnsSteps(createInitialDnsSteps());

    const testMessage = "Hello from DNS onboarding!";

    const updateStep = (
      id: string,
      status: DNSStep["status"],
      message: string,
      timing?: number,
    ) => {
      setDnsSteps((prev) =>
        prev.map((step) =>
          step.id === id
            ? {
                ...step,
                status,
                message,
                ...(timing !== undefined ? { timing } : {}),
              }
            : step,
        ),
      );
    };

    let succeeded = false;
    for (const step of DNS_DEMO_STEPS) {
      updateStep(step.id, "active", t(step.activeKey));
      const queryStartedAt = Date.now();

      try {
        const result = await DNSService.testTransport(
          testMessage,
          step.transport,
        );
        updateStep(
          step.id,
          "success",
          t(step.successKey),
          Date.now() - queryStartedAt,
        );
        setResponse(result || t("screen.onboarding.dnsMagic.demoResponse"));
        succeeded = true;
        break;
      } catch (error) {
        devWarn(`[DNSMagicScreen] ${step.transport.toUpperCase()} DNS demo failed`, error);
        updateStep(step.id, "failed", t(step.failedKey));
        await wait(350);
      }
    }

    if (!succeeded) {
      setResponse(t("screen.onboarding.dnsMagic.demoFailure"));
    }
    setIsRunning(false);
  };

  return (
    <View testID="onboarding-dns-magic" style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerSection}>
          <Animated.View style={[styles.dnsIcon, pulseStyle]}>
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
          <PressableRipple
            testID="onboarding-dns-demo"
            style={[
              styles.demoButton,
              { backgroundColor: isRunning ? palette.surface : palette.accentTint },
            ]}
            onPress={runDNSDemo}
            disabled={isRunning}
            variant="primary"
            pressedOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={t(
              isRunning
                ? "screen.onboarding.dnsMagic.accessibility.runningLabel"
                : "screen.onboarding.dnsMagic.accessibility.idleLabel",
            )}
            accessibilityHint={t("screen.onboarding.dnsMagic.accessibility.demoHint")}
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
          </PressableRipple>

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

          {response.length > 0 && (
            <View
              accessible={true}
              accessibilityLiveRegion="polite"
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
        {step.timing !== undefined && (
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
