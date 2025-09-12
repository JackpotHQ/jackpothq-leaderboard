'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import StatusPill from './StatusPill';
import { useKickUser } from './useKickUser';
import { useState } from 'react';
import VIPModal from './VIPModal';

function NavLink({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
}) {
  const pathname = usePathname();
  const active = pathname === href;


  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={`flex items-center gap-2 rounded-2xl px-4 py-2 font-semibold border transition
        ${active
          ? 'text-white bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] shadow-[0_8px_40px_rgba(139,59,255,0.22)]'
          : 'text-[#d8cfff] bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.06)]'}`}
    >
      {icon}
      {label}
    </Link>
  );
}

// inline SVGs (all stroke="currentColor" so they follow text color)
const HomeIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M3 9.5 12 3l9 6.5V21a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V9.5Z" />
  </svg>
);

const TrophyIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M8 21h8M12 17v4M7 4h10v4a5 5 0 0 1-10 0V4Z" />
    <path d="M7 4H5a2 2 0 0 0-2 2v2a4 4 0 0 0 4 4h.3M17 4h2a2 2 0 0 1 2 2v2a4 4 0 0 1-4 4h-.3" />
  </svg>
);

const StoreIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M3 9h18l-1 11H4L3 9Z" />
    <path d="M16 9V5a2 2 0 0 0-2-2H10a2 2 0 0 0-2 2v4" />
  </svg>
);

const CrownIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="m3 7 5 5 4-8 4 8 5-5-2 13H5L3 7Z" />
  </svg>
);

export default function Navbar() {
  const [vipOpen, setVipOpen] = useState(false);

      const { authed, user } = useKickUser();

  return (
    <div className="container-max">
      <div className="mt-6 mb-12 rounded-full border border-white/10 bg-black/30 backdrop-blur-md px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* logo placeholder */}
          <Image src="/logo.png" alt="logo" width={36 * 2} height={36 * 2} className="rounded-lg" />
          <div className="hidden sm:block">
            <StatusPill />
          </div>
        </div>
        <nav className="flex items-center gap-3">
          <NavLink href="/" label="Home" icon={HomeIcon} />
          <NavLink href="/leaderboards" label="Leaderboards" icon={TrophyIcon} />
          <NavLink href="/store" label="Store" icon={StoreIcon} />
<button
  onClick={() => setVipOpen(true)}
  className="inline-flex items-center gap-2 rounded-xl px-3 py-1.5 font-semibold bg-white/10 hover:bg-white/15 border border-white/10"
  aria-label="Open VIP"
  title="VIP"
>
  {/* simple crown icon */}
  <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="currentColor" d="M3 7l4 4 5-6 5 6 4-4v10H3z" />
  </svg>
  VIP
</button>          {/* Sign in with Kick logo mask */}
   {authed ? (
            <div className="flex items-center gap-2 rounded-2xl px-3 py-2 bg-black/60 border border-white/10 text-white/90">
              {/* Kick logo mask, white */}
              <span
                className="kick-mask inline-block align-middle"
                style={{ width: 16, height: 6, backgroundColor: '#fff' }}
                aria-hidden="true"
              />
              <span className="font-semibold truncate max-w-[140px]">
                {user?.name ?? 'Signed in'}
              </span>
              <a
                href="/api/kick/logout"
                className="ml-2 text-xs font-bold opacity-75 hover:opacity-100 underline"
              >
                Sign out
              </a>
            </div>
          ) : (
            <a
              href="/api/kick/login"
              className="flex items-center gap-2 rounded-2xl px-4 py-2 font-semibold bg-black/60 border border-white/10 text-white/80"
            >
              <span
                className="kick-mask inline-block align-middle"
                style={{ width: 16, height: 6, backgroundColor: '#fff' }}
                aria-hidden="true"
              />
              Sign in
            </a>
          )}

        </nav>
      </div>
      <VIPModal open={vipOpen} onClose={() => setVipOpen(false)} />

    </div>
  );
}
