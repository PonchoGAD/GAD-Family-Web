'use client';
import React from 'react';
import { ethers } from 'ethers';
import { getReadProvider, getBrowserProvider } from '../../lib/nft/eth';
import { ADDR } from '../../lib/nft/constants';
import { getMarketplaceContract, getNftContract, getUsdtContract } from '../../lib/nft/contracts';

type Props = {
  nft: string;
  tokenId: string;
  currency: string; // address(0) => BNB, else USDT
  price: string;    // wei (18)
  seller: string;
};

function fmt18(v: string) {
  try { return ethers.formatUnits(v, 18); } catch { return v; }
}

export default function NFTCard({ nft, tokenId, currency, price, seller }: Props) {
  const [img, setImg] = React.useState<string | null>(null);
  const [name, setName] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [msg, setMsg] = React.useState<string>('');

  // Load tokenURI -> metadata
  React.useEffect(() => {
    (async () => {
      try {
        const provider = getReadProvider();
        const nftc = getNftContract(provider, nft);
        const uri: string = await nftc.tokenURI(tokenId);
        let url = uri;
        if (uri.startsWith('ipfs://')) {
          url = (process.env.NEXT_PUBLIC_IPFS_GATEWAY || 'https://gateway.pinata.cloud/ipfs/') + uri.replace('ipfs://', '');
        }
        const r = await fetch(url, { cache: 'no-store' });
        const meta = await r.json().catch(() => ({}));
        if (meta?.image) {
          let im = meta.image as string;
          if (im.startsWith('ipfs://')) {
            im = (process.env.NEXT_PUBLIC_IPFS_GATEWAY || 'https://gateway.pinata.cloud/ipfs/') + im.replace('ipfs://', '');
          }
          setImg(im);
        }
        setName(meta?.name || `#${tokenId}`);
      } catch {
        setName(`#${tokenId}`);
      }
    })();
  }, [nft, tokenId]);

  const buy = async () => {
    setLoading(true); setMsg('');
    try {
      const provider = await getBrowserProvider();
      const signer = await provider.getSigner();
      const me = await signer.getAddress();
      const mkt = getMarketplaceContract(signer);

      if (currency === ethers.ZeroAddress) {
        // BNB payment
        const tx = await mkt.buy(nft, tokenId, currency, { value: price });
        await tx.wait();
      } else {
        // USDT payment: approve → buy
        const usdt = getUsdtContract(signer);
        const allow = await usdt.allowance(me, ADDR.MARKETPLACE);
        if (allow < BigInt(price)) {
          const txA = await usdt.approve(ADDR.MARKETPLACE, price);
          await txA.wait();
        }
        const tx = await mkt.buy(nft, tokenId, currency);
        await tx.wait();
      }
      setMsg('Purchased ✅');
    } catch (e:any) {
      setMsg(e?.shortMessage || e?.message || 'Buy failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl overflow-hidden border border-white/10 bg-white/5 flex flex-col">
      <div className="aspect-square bg-black/30">
        {img ? <img src={img} alt={name || ''} className="w-full h-full object-cover" /> : null}
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <div className="text-sm text-white/60">{nft.slice(0,6)}…{nft.slice(-4)} · #{tokenId}</div>
        <div className="text-lg font-semibold mt-1">{name || `#${tokenId}`}</div>
        <div className="text-sm text-white/60 mt-1">Seller: {seller.slice(0,6)}…{seller.slice(-4)}</div>

        <div className="mt-3 flex items-center justify-between">
          <div className="text-xl font-bold">
            {fmt18(price)} {currency === ethers.ZeroAddress ? 'BNB' : 'USDT'}
          </div>
          <button
            onClick={buy}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-[#ffd166] text-[#0b0f17] font-semibold hover:opacity-90 disabled:opacity-60"
          >
            {loading ? 'Processing…' : 'Buy'}
          </button>
        </div>

        {msg && <div className="mt-2 text-xs">{msg}</div>}
      </div>
    </div>
  );
}
