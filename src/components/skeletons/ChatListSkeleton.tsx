/**
 * ChatListSkeleton - Loading skeleton for chat list
 *
 * Matches the GlassChatList item layout with shimmer animation.
 *
 * @see GlassChatList.tsx for the actual component layout
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SkeletonBox, SkeletonText, SkeletonCard } from './SkeletonBase';
import { LiquidGlassSpacing } from '../../ui/theme/liquidGlassSpacing';

interface ChatListSkeletonProps {
  /**
   * Number of skeleton items to show
   * @default 5
   */
  count?: number;
}

function ChatItemSkeleton({ delay = 0 }: { delay?: number }) {
  return (
    <SkeletonCard delay={delay} style={styles.chatItem}>
      <View style={styles.chatContent}>
        {/* Chat Info */}
        <View style={styles.chatInfo}>
          {/* Title */}
          <SkeletonBox
            width="70%"
            height={17}
            delay={delay + 50}
            style={styles.titleSkeleton}
          />

          {/* Preview text */}
          <SkeletonText
            lines={2}
            lineHeight={15}
            lineGap={6}
            width="100%"
            staggerDelay={50}
            shortLastLine
          />

          {/* Meta row */}
          <View style={styles.metaRow}>
            <SkeletonBox width={60} height={13} delay={delay + 150} />
            <SkeletonBox width={80} height={18} borderRadius={9} delay={delay + 200} />
          </View>
        </View>

        {/* Chevron */}
        <SkeletonBox width={10} height={18} delay={delay + 100} />
      </View>
    </SkeletonCard>
  );
}

export function ChatListSkeleton({ count = 5 }: ChatListSkeletonProps) {
  return (
    <View style={styles.container} testID="chat-list-skeleton">
      {Array.from({ length: count }).map((_, index) => (
        <ChatItemSkeleton key={index} delay={index * 100} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  chatItem: {
    marginVertical: 4,
  },
  chatContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatInfo: {
    flex: 1,
    marginRight: 12,
  },
  titleSkeleton: {
    marginBottom: LiquidGlassSpacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: LiquidGlassSpacing.sm,
  },
});

export default ChatListSkeleton;
