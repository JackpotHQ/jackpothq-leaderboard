
import Image from "next/image";
import Link from "next/link";
export default function Home() {
  return (
    <section className="flex flex-col items-center text-center py-16">
      <Image src="/jackpot-logo.png" alt="JACKPOTHQ" width={560 * 2} height={140 * 2} className="mb-8 drop-shadow-[0_0_40px_rgba(139,59,255,0.35)]" />
      <p className="text-white/70 mb-8">Exclusive wager races!</p>
<Link
  href="/leaderboards"
  className="inline-flex items-center justify-center px-5 py-3 rounded-2xl font-semibold 
             text-black bg-white shadow-[0_4px_12px_rgba(255,255,255,0.25)] hover:bg-gray-100 transition">
  LEADERBOARDS
</Link>
    </section>
  );
}
