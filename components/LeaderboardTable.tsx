
type Row = { place: number; user: string; wagered: number; reward: number; };
const fmtUsd = (n: number) => `$ ${n.toLocaleString()}`;
function abbrev(name: string) {
  if (name.length <= 2) return name.toUpperCase();
  return `${name.slice(0, 2).toUpperCase()}..${name.slice(-1).toUpperCase()}`;
}

export default function LeaderboardTable({ rows }: { rows: Row[] }) {
  return (
    <section className="mt-6 rounded-2xl border border-white/10 p-2 shadow-[0_20px_60px_rgba(5,3,10,0.6)] bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.01))]">
      <div className="overflow-x-auto">
        <table className="w-full text-[15px]">
          <thead>
            <tr className="bg-[#060305] text-white font-extrabold">
              <th className="text-left py-4 px-6 w-[10%]">PLACE</th>
              <th className="text-left py-4 px-6 w-[50%]">USERNAME</th>
              <th className="text-left py-4 px-6 w-[20%]">WAGERED</th>
              <th className="text-left py-4 px-6 w-[20%]">REWARD</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.place} className="border-t border-[rgba(255,255,255,0.06)]">
                <td className="px-6 py-5">{r.place}.</td>
                <td className="px-6 py-5">
                  <div className="inline-flex gap-2 items-center">
                    {/* <div className="w-8 h-8 rounded-full bg-[#1b1530] border border-white/10 flex items-center justify-center text-white/80 font-bold">{r.user.slice(0,2)}</div> */}
                    <div className="truncate max-w-[240px] sm:max-w-[420px]">{abbrev(r.user)}</div>
                  </div>
                </td>
                <td className="px-6 py-5">{fmtUsd(r.wagered)}</td>
                <td className="px-6 py-5 text-[#00f0b0] font-extrabold">{fmtUsd(r.reward)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
