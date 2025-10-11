'use client';
import React from 'react';
import { ethers } from 'ethers';
import { getBrowserProvider } from '../../../lib/nft/eth';
import { getNftContract } from '../../../lib/nft/contracts';

export default function MintDialog() {
  const [uri, setUri] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [msg, setMsg] = React.useState('');

  const mint = async () => {
    setLoading(true); setMsg('');
    try {
      const provider = await getBrowserProvider();
      const signer = await provider.getSigner();
      const nft = getNftContract(signer);
      // 0.001 BNB комиссия
      const fee = ethers.parseUnits('0.001', 18);
      const tx = await nft.mintWithFee(uri, { value: fee });
      await tx.wait();
      setMsg('Minted ✅');
    } catch(e:any){ setMsg(e?.shortMessage || e?.message || 'Mint failed'); }
    finally{ setLoading(false); }
  };

  return (
    <div className="border border-white/10 rounded-lg p-4">
      <div className="text-sm opacity-70 mb-1">tokenURI (ipfs://...)</div>
      <input value={uri} onChange={e=>setUri(e.target.value)}
        className="w-full border border-white/10 rounded-lg bg-transparent p-2" placeholder="ipfs://..." />
      <button onClick={mint} disabled={loading || !uri}
        className="mt-3 px-4 py-2 rounded-xl bg-[#ffd166] text-[#0b0f17] hover:opacity-90">
        Mint
      </button>
      {msg && <div className="mt-2 text-sm">{msg}</div>}
    </div>
  );
}
