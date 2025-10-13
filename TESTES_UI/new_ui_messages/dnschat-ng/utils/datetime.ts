const SHORT_RELATIVE_THRESHOLD_MINUTES = 60;
const SHORT_RELATIVE_THRESHOLD_HOURS = 24;
const SHORT_RELATIVE_THRESHOLD_DAYS = 7;

export function formatConversationTimestamp(value: number, locale: string): string {
  const now = Date.now();
  const diff = now - value;
  const minutes = Math.max(0, Math.floor(diff / 60000));
  if (minutes < 1) return 'now';
  if (minutes < SHORT_RELATIVE_THRESHOLD_MINUTES) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < SHORT_RELATIVE_THRESHOLD_HOURS) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < SHORT_RELATIVE_THRESHOLD_DAYS) return `${days}d`;

  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(new Date(value));
}

export function formatMessageTimestamp(value: number, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    hour: 'numeric',
    minute: '2-digit'
  }).format(new Date(value));
}
