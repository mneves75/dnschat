import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

export type GlassTabConfig = {
  id: string;
  title: string;
  icon: React.ReactNode | string;
};

export const buildGlassTabs = (
  state: BottomTabBarProps['state'],
  descriptors: BottomTabBarProps['descriptors'],
  activeIndex: number,
  accentColor: string,
  mutedColor: string,
): { tabs: GlassTabConfig[]; activeRouteKey: string } => {
  const activeRoute = state.routes[activeIndex];
  const visibleRoutes = state.routes.filter((route) => {
    const options = descriptors[route.key]?.options;
    const href = (options as any)?.href;
    return href !== null;
  });

  const tabs = visibleRoutes.map((route) => {
    const descriptor = descriptors[route.key];
    const options = descriptor?.options ?? {};
    const routeIndex = state.routes.findIndex((r) => r.key === route.key);
    const isFocused = routeIndex === activeIndex;

    const label = options.tabBarLabel ?? options.title ?? route.name;
    const appliedLabel = typeof label === 'string' ? label : route.name;
    const color = isFocused ? accentColor : mutedColor;
    const iconNode = options.tabBarIcon?.({ color, focused: isFocused, size: 22 });

    return {
      id: route.key,
      title: appliedLabel,
      icon: iconNode ?? appliedLabel.charAt(0).toUpperCase(),
    };
  });

  return { tabs, activeRouteKey: activeRoute.key };
};
