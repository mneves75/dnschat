import { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import Button from '../../src/components/ui/Button';
import { useTheme } from '../../src/theme/theme';

export default function HomeScreen() {
  const { colors, spacing, typography } = useTheme();
  const data = useMemo(() => Array.from({ length: 1500 }, (_, i) => `Item ${i + 1}`), []);
  const startRef = useRef<number>(performance.now());
  const [firstRenderMs, setFirstRenderMs] = useState<number | null>(null);

  useEffect(() => {
    const id = setTimeout(() => {
      if (firstRenderMs == null) {
        setFirstRenderMs(Math.round(performance.now() - startRef.current));
      }
    }, 0);
    return () => clearTimeout(id);
  }, [firstRenderMs]);

  return (
    <View style={{ flex: 1, padding: spacing[4], backgroundColor: colors.background }}>
      <Text
        accessibilityRole="header"
        style={{
          fontSize: typography.h2,
          fontWeight: '700',
          marginBottom: spacing[2],
          color: colors.text,
        }}
      >
        Home
      </Text>
      <Button label="Ação" onPress={() => {}} accessibilityLabel="Executar ação" />
      <FlatList
        accessibilityLabel="Lista grande"
        data={data}
        keyExtractor={(item) => item}
        initialNumToRender={16}
        windowSize={12}
        removeClippedSubviews
        getItemLayout={(_, index) => ({ length: 56, offset: 56 * index, index })}
        renderItem={({ item }) => (
          <View
            style={{
              height: 56,
              justifyContent: 'center',
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}
          >
            <Text style={{ color: colors.text }}>{item}</Text>
          </View>
        )}
      />
      <Text
        accessibilityLabel="Métricas de renderização"
        style={{ color: colors.muted, marginTop: spacing[2] }}
      >
        {firstRenderMs != null ? `Tempo inicial de render: ${firstRenderMs}ms` : 'Medição...'}
      </Text>
    </View>
  );
}
