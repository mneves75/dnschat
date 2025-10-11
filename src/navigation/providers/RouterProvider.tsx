import type { PropsWithChildren } from "react";
import { useEffect } from "react";
import { usePathname, useRouter, useSegments, useRootNavigationState } from "expo-router";

import { useAppStore } from "@/store";

const AUTH_GROUP = "(auth)";

export function RouterProvider({ children }: PropsWithChildren) {
  const hydrated = useAppStore((state) => state.hydrated);
  const status = useAppStore((state) => state.status);
  const onboardingComplete = useAppStore((state) => state.onboardingComplete);

  const segments = useSegments();
  const pathname = usePathname();
  const router = useRouter();
  const rootNavigation = useRootNavigationState();

  useEffect(() => {
    // Wait until the root navigator is mounted so we don't trigger the
    // "navigate before mounting the Root Layout" error from Expo Router.
    if (!hydrated || !rootNavigation?.key || segments.length === 0 || !pathname) {
      return;
    }

    const group = segments[0];
    const inAuthGroup = group === AUTH_GROUP;
    const requiresAuth = group === "(tabs)" || group === "(dashboard)" || group === "(modals)";

    // Redirect to onboarding until the user completes the flow, regardless of current location.
    if (!onboardingComplete) {
      if (pathname !== "/(auth)/onboarding") {
        router.replace("/(auth)/onboarding");
      }
      return;
    }

    // Prevent unauthenticated access to authenticated areas once onboarding is done.
    if (requiresAuth && status !== "authenticated") {
      router.replace("/(auth)/sign-in");
      return;
    }

    // Keep authenticated users inside the main app once they sign in.
    if (inAuthGroup && status === "authenticated") {
      router.replace("/(tabs)");
    }
  }, [hydrated, onboardingComplete, pathname, rootNavigation?.key, router, segments, status]);

  return <>{children}</>;
}
