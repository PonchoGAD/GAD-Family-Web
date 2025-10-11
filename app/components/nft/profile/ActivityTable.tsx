type Row = { time: string; action: string; tx: string };

export default function ActivityTable({ rows = [] as Row[] }) {
  if (!rows.length) return <div className="opacity-60">No activity yet.</div>;
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left opacity-70">
          <th className="p-2">Time</th>
          <th className="p-2">Action</th>
          <th className="p-2">Tx</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} className="border-t">
            <td className="p-2">{r.time}</td>
            <td className="p-2">{r.action}</td>
            <td className="p-2">
              <a className="underline" href={`https://bscscan.com/tx/${r.tx}`} target="_blank" rel="noreferrer">
                {r.tx.slice(0, 8)}…{r.tx.slice(-6)}
              </a>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
