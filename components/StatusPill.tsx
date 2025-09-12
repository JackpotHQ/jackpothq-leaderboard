'use client';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function StatusPill() {
  const { data } = useSWR('/api/kick/status', fetcher, { refreshInterval: 20000 });
  const online = Boolean(data?.online);

  return (
    <div
      className={`flex items-center gap-2 px-4 py-1.5 rounded-full font-bold text-sm text-white
        ${online ? 'bg-green-500' : 'bg-red-600'} shadow`}
    >
      <span
        className="kick-mask inline-block align-middle"
        style={{
          width: 32 / 2,          // tweak to match your screenshot
          height: 12 / 2,
          backgroundColor: '#fff', // <- pure white logo
        }}
        aria-hidden="true"
      />
      {online ? 'ONLINE' : 'OFFLINE'}
    </div>
  );
}
