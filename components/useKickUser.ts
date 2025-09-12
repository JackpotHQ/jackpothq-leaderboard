'use client';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url, { cache: 'no-store' }).then(r => r.json());

export function useKickUser() {
  const { data, isLoading } = useSWR('/api/kick/me', fetcher, { refreshInterval: 0 });
  const authed = Boolean(data?.authenticated && data?.me);
  return { authed, user: data?.me, isLoading };
}
