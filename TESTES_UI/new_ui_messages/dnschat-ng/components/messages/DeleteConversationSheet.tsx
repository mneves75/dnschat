import { memo } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import { useTranslation } from '@/i18n';

type Props = {
  visible: boolean;
  conversationTitle?: string;
  onCancel: () => void;
  onConfirm: () => void;
};

function DeleteConversationSheetComponent({
  visible,
  conversationTitle,
  onCancel,
  onConfirm
}: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const { t } = useTranslation();
  const sheetColors =
    colorScheme === 'dark'
      ? {
          container: 'rgba(28,28,30,0.95)',
          text: '#fff',
          subtitle: 'rgba(235,235,245,0.7)',
          border: 'rgba(235,235,245,0.2)',
          cancel: '#fff'
        }
      : {
          container: '#F2F2F7',
          text: '#1C1C1E',
          subtitle: 'rgba(60,60,67,0.65)',
          border: 'rgba(60,60,67,0.1)',
          cancel: '#1C1C1E'
        };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onCancel}
      statusBarTranslucent>
      <View style={styles.overlay} pointerEvents={visible ? 'auto' : 'none'}>
        <Pressable style={styles.backdrop} onPress={onCancel} />
        <View style={[styles.sheet, { backgroundColor: sheetColors.container }]}>
          <Text style={[styles.title, { color: sheetColors.text }]}>{t('conversations.delete.title')}</Text>
          <Text style={[styles.subtitle, { color: sheetColors.subtitle }]}>
            {conversationTitle
              ? t('conversations.delete.subtitle', { title: conversationTitle })
              : t('conversations.delete.subtitle.fallback')}
          </Text>
          <View style={styles.actions}>
            <Pressable
              onPress={onCancel}
              style={({ pressed }) => [
                styles.button,
                { borderColor: sheetColors.border },
                pressed && styles.buttonPressed
              ]}>
              <Text style={[styles.cancelLabel, { color: sheetColors.cancel }]}>{t('conversations.delete.cancel')}</Text>
            </Pressable>
            <Pressable
              onPress={onConfirm}
              style={({ pressed }) => [
                styles.button,
                styles.destructiveButton,
                pressed && styles.buttonPressed
              ]}>
              <Text style={styles.destructiveLabel}>{t('conversations.delete.confirm')}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export const DeleteConversationSheet = memo(DeleteConversationSheetComponent);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.45)'
  },
  backdrop: {
    flex: 1
  },
  sheet: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    gap: 16
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff'
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(235,235,245,0.7)'
  },
  actions: {
    flexDirection: 'row',
    gap: 12
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center'
  },
  destructiveButton: {
    backgroundColor: '#FF453A',
    borderColor: 'transparent'
  },
  buttonPressed: {
    opacity: 0.75
  },
  cancelLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  destructiveLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700'
  }
});
