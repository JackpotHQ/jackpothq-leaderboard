type Card = {
  rank: 1 | 2 | 3;
  user: string;
  wagered: number;
};

const badgeClass = (rank: 1 | 2 | 3) =>
  rank === 1
    ? 'bg-[var(--accent)]'
    : rank === 2
    ? 'bg-white'
    : 'bg-orange-500';

const fmtUsd = (n: number) => `$ ${n.toLocaleString()}`;
function abbrev(name: string) {
  if (name.length <= 2) return name.toUpperCase();
  return `${name.slice(0, 2).toUpperCase()}..${name.slice(-1).toUpperCase()}`;
}

export default function MedalCards({ cards }: { cards: Card[] }) {
  // ensure order is [2,1,3]
  const displayOrder: (1 | 2 | 3)[] = [2, 1, 3];
  const sorted = displayOrder
    .map(rank => cards.find(c => c.rank === rank))
    .filter((c): c is Card => Boolean(c));

  return (
    <section className="grid md:grid-cols-3 gap-9 my-10">
      {sorted.map((c, i) => (
        <article
          key={i}
          className={`relative rounded-2xl p-7 border min-h-[360px] flex flex-col items-center justify-start text-center transition-all
            bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.012))]
            border-[rgba(139,59,255,0.12)]
            shadow-[0_20px_40px_rgba(0,0,0,0.6)]
            ${c.rank===1 ? ' border-[rgba(139,59,255,0.28)] shadow-[0_28px_80px_rgba(109,43,255,0.22),_0_0_120px_rgba(109,43,255,0.05)]' : ''}`}
        >
          <div className="relative z-10 w-full">
            {/* Circle with first 2 chars */}
            <div className="mx-auto mb-4 w-[110px] h-[110px] rounded-full border-8 border-black/40 bg-gradient-to-b from-white/5 to-white/0 flex items-center justify-center text-5xl shadow-[0_0_30px_rgba(139,59,255,0.35)]">
              <span className="text-2xl font-extrabold">
                {abbrev(c.user)}
              </span>
            </div>

            {/* Diamond badge */}
            <div className={`absolute top-[84px] left-1/2 -translate-x-1/2 w-8 h-8 flex items-center justify-center rotate-45 ${badgeClass(c.rank)}`}>
              <span className="font-bold text-sm -rotate-45 text-black">{c.rank}</span>
            </div>

            <div className="h-[32px]" />
            <h3 className="text-[#bf9cff] font-bold tracking-widest mt-2 mb-3">WAGERED</h3>
            <div className="h-px bg-gradient-to-r from-transparent via-[var(--accent-2)] to-transparent my-4" />
            <div className="h-[16px]" />

<div
  className="inline-flex items-center justify-center 
             min-w-[160px] px-6 py-3 rounded-xl 
             font-extrabold text-lg text-white
             bg-gradient-to-r from-[#2a0f47] to-[#6b21a8]
             shadow-[0_0_25px_rgba(139,59,255,0.35)]">
  {fmtUsd(c.wagered)}
</div>


          </div>
        </article>
      ))}
    </section>
  );
}
