'use client';
import React from 'react';
import { ethers } from 'ethers';
import { getBrowserProvider } from '../../lib/nft/eth';
import { ADDR } from '../../lib/nft/constants';
import { getNftContract, getMarketplaceContract } from '../../lib/nft/contracts';

export default function SellClient({ address, tokenId }:{address:string; tokenId:string}) {
  const [currency, setCurrency] = React.useState<'BNB'|'USDT'>('BNB');
  const [price, setPrice] = React.useState('0.1'); // человекочитаемо
  const [loading, setLoading] = React.useState(false);
  const [msg, setMsg] = React.useState('');

  const approveAndList = async () => {
    setLoading(true); setMsg('');
    try {
      const provider = await getBrowserProvider();
      const signer = await provider.getSigner();
      const me = await signer.getAddress();

      const nft = getNftContract(signer);
      const mkt = getMarketplaceContract(signer);

      const owner: string = await nft.ownerOf(tokenId);
      if (owner.toLowerCase() !== me.toLowerCase()) throw new Error('You are not the owner');

      const appr: boolean = await nft.isApprovedForAll(me, ADDR.MARKETPLACE);
      if (!appr) { const txA = await nft.setApprovalForAll(ADDR.MARKETPLACE, true); await txA.wait(); }

      const priceWei = ethers.parseUnits(price, 18);
      const cur = (currency === 'BNB') ? ethers.ZeroAddress : ADDR.USDT;

      const tx = await mkt.list(address, tokenId, cur, priceWei);
      await tx.wait();
      setMsg('Listed ✅');
    } catch(e:any){ setMsg(e?.shortMessage || e?.message || 'List failed'); }
    finally { setLoading(false); }
  };

  return (
    <main className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">List NFT #{tokenId}</h1>
      <div className="mt-4 space-y-3">
        <div>
          <div className="text-sm opacity-70 mb-1">Currency</div>
          <select value={currency} onChange={e=>setCurrency(e.target.value as any)} className="w-full border rounded-lg bg-transparent p-2">
            <option value="BNB">BNB</option>
            <option value="USDT">USDT</option>
          </select>
        </div>
        <div>
          <div className="text-sm opacity-70 mb-1">Price</div>
          <input value={price} onChange={e=>setPrice(e.target.value)} className="w-full border rounded-lg bg-transparent p-2" placeholder="0.1"/>
        </div>
        <button onClick={approveAndList} disabled={loading} className="px-4 py-2 border rounded-lg">Approve & List</button>
        {msg && <div className="text-sm">{msg}</div>}
      </div>
    </main>
  );
}
