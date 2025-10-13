import { NativeModulesProxy, requireNativeViewManager } from 'expo-modules-core';
import { Platform } from 'react-native';
import type { ComponentType } from 'react';

export type NativeChatViewMessage = {
  id: string;
  text: string;
  authorId: string;
  status: 'sent' | 'received';
  createdAt: number;
};

export type NativeChatViewProps = {
  messages: NativeChatViewMessage[];
  contentBottomInset?: number;
  onNearTop?: (event: { nativeEvent: null }) => void;
  onVisibleIdsChange?: (event: { nativeEvent: { ids: string[] } }) => void;
  onPressMessage?: (event: { nativeEvent: { id: string } }) => void;
};

const VIEW_NAME = 'ExpoChatView';

export const isNativeChatViewAvailable =
  Platform.OS === 'ios' && VIEW_NAME in NativeModulesProxy;

export type NativeChatViewComponent = ComponentType<NativeChatViewProps & { ref?: unknown }>;

export const NativeChatView = isNativeChatViewAvailable
  ? (requireNativeViewManager(VIEW_NAME) as NativeChatViewComponent)
  : null;

export const ExpoChatViewModule = NativeModulesProxy.ExpoChatView as
  | {
      scrollToEnd?: (viewTag: number, animated: boolean) => void | Promise<void>;
    }
  | undefined;
