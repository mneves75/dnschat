import { memo, PropsWithChildren } from 'react';
import { Modal, Platform, Pressable, View } from 'react-native';
import { useTheme } from '../../theme/theme';

type Props = PropsWithChildren<{
  visible: boolean;
  onClose: () => void;
}>;

function ModalSheet({ visible, onClose, children }: Props) {
  const { colors } = useTheme();
  return (
    <Modal
      visible={visible}
      animationType={Platform.select({ ios: 'slide', android: 'fade' })}
      onRequestClose={onClose}
    >
      <Pressable
        accessibilityLabel="Fechar"
        accessibilityRole="button"
        onPress={onClose}
        style={{ flex: 1, backgroundColor: '#0008' }}
      >
        <View
          accessible
          accessibilityLabel="Sheet"
          style={{
            marginTop: 'auto',
            backgroundColor: colors.card,
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            padding: 16,
            minHeight: 200,
          }}
        >
          {children}
        </View>
      </Pressable>
    </Modal>
  );
}

export default memo(ModalSheet);
