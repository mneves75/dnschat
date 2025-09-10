import { useQuery } from '@tanstack/react-query';

async function ping(): Promise<{ ok: boolean }> {
  // Sample local ping; replace with real endpoint if needed
  return { ok: true };
}

export function usePing() {
  return useQuery({ queryKey: ['ping'], queryFn: ping });
}
