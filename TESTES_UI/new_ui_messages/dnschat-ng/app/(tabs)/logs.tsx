import { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { FlashList } from '@shopify/flash-list';

import { Text } from '@/components/Themed';
import { useDNSLogActions, useDNSLogs } from '@/context/DNSLogProvider';
import { useResolvedLocale } from '@/hooks/useResolvedLocale';
import { useTranslation } from '@/i18n';

const TRANSPORT_FILTERS = ['all', 'native', 'udp', 'tcp', 'https', 'fallback'] as const;
const STATUS_FILTERS = ['all', 'success', 'error'] as const;

type TransportFilter = (typeof TRANSPORT_FILTERS)[number];
type StatusFilter = (typeof STATUS_FILTERS)[number];

export default function LogsScreen() {
  const logs = useDNSLogs();
  const { clearLogs } = useDNSLogActions();
  const locale = useResolvedLocale();
  const { t } = useTranslation();
  const [transportFilter, setTransportFilter] = useState<TransportFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const byTransport = transportFilter === 'all' || log.transport === transportFilter;
      const byStatus =
        statusFilter === 'all' || (statusFilter === 'success' ? log.success : !log.success);
      return byTransport && byStatus;
    });
  }, [logs, transportFilter, statusFilter]);

  const renderTransportLabel = useCallback(
    (option: TransportFilter) => {
      if (option === 'all') return t('filters.all');
      if (option === 'fallback') return t('logs.filters.fallback');
      return t(`settings.transport.${option}` as any);
    },
    [t]
  );

  const renderStatusLabel = useCallback(
    (option: StatusFilter) => {
      if (option === 'all') return t('filters.all');
      if (option === 'success') return t('filters.success');
      return t('filters.error');
    },
    [t]
  );

  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <FilterChips
          label={t('logs.filters.transport')}
          options={TRANSPORT_FILTERS}
          value={transportFilter}
          onChange={setTransportFilter}
          renderOptionLabel={renderTransportLabel}
        />
        <FilterChips
          label={t('logs.filters.status')}
          options={STATUS_FILTERS}
          value={statusFilter}
          onChange={setStatusFilter}
          renderOptionLabel={renderStatusLabel}
        />
        <Pressable
          onPress={() => clearLogs()}
          style={({ pressed }) => [styles.clearButton, pressed && styles.clearButtonPressed]}
        >
          <Text style={styles.clearButtonLabel}>{t('logs.clear')}</Text>
        </Pressable>
      </View>
      <FlashList
        data={filteredLogs}
        keyExtractor={(item) => item.id}
        estimatedItemSize={92}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>{t('logs.empty.title')}</Text>
            <Text style={styles.emptySubtitle}>{t('logs.empty.subtitle')}</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={[styles.card, !item.success && styles.cardError]}> 
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle} numberOfLines={1}>
                {item.message}
              </Text>
              <Text style={styles.cardMeta}>{formatTimestamp(item.createdAt, locale)}</Text>
            </View>
            <Text style={styles.cardDetail}>
              {t('logs.entry.transport', { value: item.transport })}
            </Text>
            <Text style={styles.cardDetail}>{t('logs.entry.domain', { value: item.domain })}</Text>
            <Text style={styles.cardDetail}>
              {t('logs.entry.duration', { value: item.durationMs.toFixed(0) })}
            </Text>
            {!item.success && item.errorMessage ? (
              <Text style={styles.cardErrorText}>{item.errorMessage}</Text>
            ) : null}
          </View>
        )}
      />
    </View>
  );
}

function FilterChips<T extends string>({
  label,
  options,
  value,
  onChange,
  renderOptionLabel
}: {
  label: string;
  options: readonly T[];
  value: T;
  onChange: (next: T) => void;
  renderOptionLabel: (option: T) => string;
}) {
  return (
    <View style={styles.filterRow}>
      <Text style={styles.filterLabel}>{label}</Text>
      {options.map((option) => {
        const active = option === value;
        return (
          <Pressable
            key={option}
            onPress={() => onChange(option)}
            style={({ pressed }) => [
              styles.chip,
              active && styles.chipActive,
              pressed && !active && styles.chipPressed
            ]}
          >
            <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>
              {renderOptionLabel(option)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function formatTimestamp(value: number, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'short',
    timeStyle: 'medium'
  }).format(new Date(value));
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  toolbar: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '600'
  },
  chip: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(142,142,147,0.4)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6
  },
  chipActive: {
    backgroundColor: '#0A84FF',
    borderColor: '#0A84FF'
  },
  chipPressed: {
    opacity: 0.7
  },
  chipLabel: {
    fontSize: 13,
    fontWeight: '600'
  },
  chipLabelActive: {
    color: '#fff'
  },
  clearButton: {
    alignSelf: 'flex-start',
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(142,142,147,0.4)',
    paddingHorizontal: 12,
    paddingVertical: 6
  },
  clearButtonPressed: {
    opacity: 0.7
  },
  clearButtonLabel: {
    fontSize: 13,
    fontWeight: '600'
  },
  listContent: {
    padding: 16,
    gap: 12
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 80,
    gap: 8
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600'
  },
  emptySubtitle: {
    fontSize: 14,
    color: 'rgba(142,142,147,0.8)'
  },
  card: {
    borderRadius: 20,
    padding: 16,
    backgroundColor: 'rgba(249,249,249,0.95)',
    gap: 6,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(142,142,147,0.2)'
  },
  cardError: {
    borderColor: 'rgba(255,69,58,0.4)',
    backgroundColor: 'rgba(255,69,58,0.08)'
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  cardTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    marginRight: 12
  },
  cardMeta: {
    fontSize: 12,
    color: 'rgba(142,142,147,0.9)'
  },
  cardDetail: {
    fontSize: 13,
    color: 'rgba(60,60,67,0.85)'
  },
  cardErrorText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FF453A'
  }
});
