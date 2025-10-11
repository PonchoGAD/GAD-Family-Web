'use client';
import React from 'react';
import { ethers } from 'ethers';
import NFTCard from './components/NFTCard';

type Row = {
  txHash:string; nft:string; tokenId:string; seller:string; currency:string; price:string; block:number; time:number;
};

type Tab = 'explore'|'activity'|'my';

export default function NFTHomeClient() {
  const [tab, setTab] = React.useState<Tab>('explore');
  const [rows, setRows] = React.useState<Row[]>([]);
  const [cursor, setCursor] = React.useState<number|null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string|null>(null);

  // filters
  const [qAddr, setQAddr] = React.useState('');
  const [cur, setCur] = React.useState<'ALL'|'BNB'|'USDT'>('ALL');
  const [sort, setSort] = React.useState<'NEW'|'PRICE_ASC'|'PRICE_DESC'>('NEW');

  const load = async (reset=false) => {
    if (loading) return;
    setLoading(true); setError(null);
    try {
      const qs = new URLSearchParams();
      if (!reset && cursor) qs.set('cursor', String(cursor));
      const res = await fetch(`/nft/api/index?${qs.toString()}`, { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'failed');
      setRows(prev => reset ? data.items : [...prev, ...data.items]);
      setCursor(data.nextCursor);
    } catch (e:any) { setError(e?.message || 'load failed'); }
    finally { setLoading(false); }
  };

  React.useEffect(() => { load(true); }, []); // first page

  // filtered/sorted for Explore
  const explore = React.useMemo(() => {
    let arr = rows.slice();
    if (qAddr) { arr = arr.filter(r => r.nft.toLowerCase() === qAddr.trim().toLowerCase()); }
    if (cur !== 'ALL') {
      arr = arr.filter(r => (cur === 'BNB' ? (r.currency === ethers.ZeroAddress) : (r.currency !== ethers.ZeroAddress)));
    }
    if (sort === 'PRICE_ASC') arr.sort((a,b)=> Number(a.price) - Number(b.price));
    else if (sort === 'PRICE_DESC') arr.sort((a,b)=> Number(b.price) - Number(a.price));
    else arr.sort((a,b)=> b.block - a.block);
    return arr;
  }, [rows, qAddr, cur, sort]);

  // my listings (simple MVP)
  const [me, setMe] = React.useState<string>('');
  React.useEffect(() => {
    (async () => {
      const eth = (window as any).ethereum;
      if (!eth) return;
      try {
        const provider = new ethers.BrowserProvider(eth);
        const accs = await provider.send('eth_requestAccounts', []);
        setMe(accs?.[0] || '');
      } catch {}
    })();
  }, []);
  const my = React.useMemo(() => me ? rows.filter(r => r.seller.toLowerCase() === me.toLowerCase()) : [], [rows, me]);

  return (
    <section className="mt-6">
      {/* Tabs */}
      <div className="flex gap-2">
        {(['explore','activity','my'] as Tab[]).map(t => (
          <button key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl border ${tab===t ? 'bg-white/10 border-white/20' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>
            {t === 'explore' ? 'Explore' : t === 'activity' ? 'Activity' : 'My'}
          </button>
        ))}
      </div>

      {tab === 'explore' && (
        <div className="mt-4">
          {/* Filters */}
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <div className="text-sm text-white/60 mb-1">Collection address</div>
              <input value={qAddr} onChange={e=>setQAddr(e.target.value)}
                     placeholder="0x… (optional)"
                     className="px-3 py-2 rounded-lg bg-transparent border border-white/10 w-[320px]" />
            </div>
            <div>
              <div className="text-sm text-white/60 mb-1">Currency</div>
              <select value={cur} onChange={e=>setCur(e.target.value as any)}
                      className="px-3 py-2 rounded-lg bg-transparent border border-white/10">
                <option value="ALL">ALL</option>
                <option value="BNB">BNB</option>
                <option value="USDT">USDT</option>
              </select>
            </div>
            <div>
              <div className="text-sm text-white/60 mb-1">Sort</div>
              <select value={sort} onChange={e=>setSort(e.target.value as any)}
                      className="px-3 py-2 rounded-lg bg-transparent border border-white/10">
                <option value="NEW">Newest</option>
                <option value="PRICE_ASC">Cheapest</option>
                <option value="PRICE_DESC">Most expensive</option>
              </select>
            </div>
            <button onClick={()=>load(true)}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10">
              Refresh
            </button>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
            {explore.map(r => (
              <NFTCard key={`${r.txHash}-${r.tokenId}`} nft={r.nft} tokenId={r.tokenId}
                       currency={r.currency} price={r.price} seller={r.seller} />
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-4">
            <button onClick={()=>load(false)} disabled={!cursor || loading}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 disabled:opacity-50">
              {loading ? 'Loading…' : (cursor ? 'Load more' : 'No more')}
            </button>
            {error && <div className="text-red-400 text-sm mt-2">{error}</div>}
          </div>
        </div>
      )}

      {tab === 'activity' && (
        <div className="mt-4 rounded-2xl border border-white/10 bg-white/5">
          <div className="p-4 text-lg font-semibold">Recent Listings</div>
          <div className="max-h-[520px] overflow-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-white/10">
                <tr>
                  <th className="text-left px-3 py-2">Block</th>
                  <th className="text-left px-3 py-2">NFT</th>
                  <th className="text-left px-3 py-2">Token</th>
                  <th className="text-left px-3 py-2">Seller</th>
                  <th className="text-left px-3 py-2">Price</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(r => (
                  <tr key={`${r.txHash}-${r.tokenId}`} className="odd:bg-white/0 even:bg-white/5">
                    <td className="px-3 py-2">{r.block}</td>
                    <td className="px-3 py-2">{r.nft.slice(0,6)}…{r.nft.slice(-4)}</td>
                    <td className="px-3 py-2">#{r.tokenId}</td>
                    <td className="px-3 py-2">{r.seller.slice(0,6)}…{r.seller.slice(-4)}</td>
                    <td className="px-3 py-2">
                      {ethers.formatUnits(r.price, 18)} {r.currency === ethers.ZeroAddress ? 'BNB' : 'USDT'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-white/10">
            <button onClick={()=>load(false)} disabled={!cursor || loading}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 disabled:opacity-50">
              {loading ? 'Loading…' : (cursor ? 'Load more' : 'No more')}
            </button>
          </div>
        </div>
      )}

      {tab === 'my' && (
        <div className="mt-4">
          {me ? (
            <>
              <div className="text-sm text-white/60">Connected: {me.slice(0,6)}…{me.slice(-4)}</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-3">
                {my.map(r => (
                  <NFTCard key={`${r.txHash}-${r.tokenId}`} nft={r.nft} tokenId={r.tokenId}
                           currency={r.currency} price={r.price} seller={r.seller} />
                ))}
              </div>
              {my.length === 0 && <div className="opacity-60 mt-3">No active listings.</div>}
            </>
          ) : (
            <div className="opacity-60">Connect wallet on the top bar to see your listings.</div>
          )}
        </div>
      )}
    </section>
  );
}
