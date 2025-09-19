'use client';

import React from 'react';
import { BrowserProvider, Contract, parseUnits, formatUnits, getAddress } from 'ethers';
import clsx from 'clsx';

/** ====== CONSTANTS (BSC mainnet) ====== */
const ZAP_ADDR    = getAddress('0x15Acdc7636FB0214aEfa755377CE5ab3a9Cc99BC'); // GADZap
const ROUTER_ADDR = getAddress('0x10ED43C718714eb63d5aA57B78B54704E256024E'); // Pancake V2
const GAD_ADDR    = getAddress('0x858bab88A5b8D7F29a40380C5F2D8d0b8812FE62');
const USDT_ADDR   = getAddress('0x55d398326f99059fF775485246999027B3197955');
const WBNB_ADDR   = getAddress('0xBB4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c');

/** ====== ABIs (минимальные) ====== */
const ZAP_ABI = [
  'function zapWithBNB(uint256 minGad, uint256 minEth, uint256 deadline) payable',
  'function zapWithUSDT(uint256 amountUSDT, uint256 minGad, uint256 minUSDT, uint256 deadline)'
];
const ROUTER_ABI = [
  'function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts)'
];
const ERC20_ABI = [
  'function decimals() view returns (uint8)',
  'function balanceOf(address) view returns (uint256)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 value) returns (bool)'
];

/** helpers */
const sanitizeNum = (s: string) => (s || '').replace(',', '.').replace(/\s/g, '');

export default function ZapBox() {
  const [provider, setProvider] = React.useState<BrowserProvider | null>(null);
  const [account, setAccount]   = React.useState<string>('');
  const [busy, setBusy]         = React.useState(false);
  const [msg, setMsg]           = React.useState('');

  // balances
  const [bnbBal, setBnbBal]     = React.useState<string>('0');
  const [usdtBal, setUsdtBal]   = React.useState<string>('0');

  // inputs
  const [bnbAmount, setBnbAmount]   = React.useState<string>(''); // BNB
  const [usdtAmount, setUsdtAmount] = React.useState<string>(''); // USDT
  const [slippageBps, setSlippageBps] = React.useState<number>(1000); // 10% (используется только в USDT zap)

  /** ---- connect ---- */
  const connect = async () => {
    setMsg('');
    try {
      const eth = (window as any).ethereum;
      if (!eth) return setMsg('MetaMask not found');
      const prov = new BrowserProvider(eth);
      const accs = await prov.send('eth_requestAccounts', []);
      setProvider(prov);
      setAccount(accs?.[0] || '');
      eth.on?.('accountsChanged', (a: string[]) => setAccount(a?.[0] || ''));
      // первичная загрузка балансов
      refreshBalances(prov, accs?.[0] || '');
    } catch (e: any) {
      setMsg(e?.message || 'Failed to connect');
    }
  };

  const refreshBalances = React.useCallback(async (prov?: BrowserProvider, acc?: string) => {
    const p = prov || provider;
    const a = acc || account;
    if (!p || !a) return;
    try {
      const bnb = await p.getBalance(a);
      setBnbBal(formatUnits(bnb, 18));
      const usdt = new Contract(USDT_ADDR, ERC20_ABI, p);
      const ub = await usdt.balanceOf(a);
      // у BSC USDT обычно 18 decimals (у wrapped) — оставляем 18
      setUsdtBal(formatUnits(ub, 18));
    } catch {}
  }, [provider, account]);

  React.useEffect(() => {
    const id = setInterval(() => refreshBalances(), 15000);
    return () => clearInterval(id);
  }, [refreshBalances]);

  /** ---- helpers to get contracts ---- */
  const getRouter = React.useCallback(async () => {
    if (!provider) return null;
    return new Contract(ROUTER_ADDR, ROUTER_ABI, provider);
  }, [provider]);

  const getZap = React.useCallback(async (withSigner = false) => {
    if (!provider) return null;
    if (withSigner) {
      const signer = await provider.getSigner();
      return new Contract(ZAP_ADDR, ZAP_ABI, signer);
    }
    return new Contract(ZAP_ADDR, ZAP_ABI, provider);
  }, [provider]);

  const getUsdt = React.useCallback(async (withSigner = false) => {
    if (!provider) return null;
    if (withSigner) {
      const signer = await provider.getSigner();
      return new Contract(USDT_ADDR, ERC20_ABI, signer);
    }
    return new Contract(USDT_ADDR, ERC20_ABI, provider);
  }, [provider]);

  /** ---- slippage helper (для USDT zap) ---- */
  const applySlippage = (amountOut: bigint) => {
    const bps = BigInt(slippageBps);
    return (amountOut * (BigInt(10000) - bps)) / BigInt(10000);
  };

  /** ================= ZAP: BNB -> GAD/WBNB ================= */
  const zapBNB = async () => {
    if (!provider) return setMsg('Connect wallet');
    setBusy(true); setMsg('');
    try {
      const zap = await getZap(true);
      if (!zap) throw new Error('Zap not ready');

      // нормализуем число (заменяем запятую), конвертим в wei
      const amountStr = sanitizeNum(bnbAmount || '0');
      const totalBNB = parseUnits(amountStr, 18);
      if (totalBNB <= BigInt(0)) throw new Error('Amount must be > 0');

      const deadline = Math.floor(Date.now() / 1000) + 600; // 10 минут

      // важное упрощение: без предварительных getAmountsOut и estimateGas
      const tx = await (zap as any).zapWithBNB(BigInt(0), BigInt(0), deadline, { value: totalBNB });
      await tx.wait();

      setMsg('Zapped with BNB ✅');
      setBnbAmount('');
      await refreshBalances();
    } catch (e: any) {
      setMsg(e?.shortMessage || e?.message || 'Zap failed');
    } finally {
      setBusy(false);
    }
  };

  /** ============== ZAP: USDT -> GAD/USDT =================== */
  const zapUSDT = async () => {
    if (!provider) return setMsg('Connect wallet');
    setBusy(true); setMsg('');
    try {
      const router = await getRouter();
      const zap    = await getZap(true);
      const usdt   = await getUsdt(true);
      if (!router || !zap || !usdt) throw new Error('Contracts not ready');

      // нормализуем число (заменяем запятую)
      const amt = parseUnits(sanitizeNum(usdtAmount || '0'), 18);
      if (amt <= BigInt(0)) throw new Error('Amount must be > 0');

      // approve если не хватает allowance
      const usdtRead = await getUsdt(false);
      const allowance: bigint = await (usdtRead as any).allowance(account, ZAP_ADDR);
      if (allowance < amt) {
        const txa = await usdt.approve(ZAP_ADDR, parseUnits('1000000000000', 18)); // практич.∞
        await txa.wait();
      }

      // половина на покупку GAD: USDT -> WBNB -> GAD (чтобы оценить minGad)
      const half = amt / BigInt(2);
      const path = [USDT_ADDR, WBNB_ADDR, GAD_ADDR];
      const amounts: any = await (router as any).getAmountsOut(half, path);
      const last = Array.isArray(amounts) ? amounts[amounts.length - 1] : amounts.at(-1);
      const expectedGAD = BigInt(last.toString());
      const minGad  = applySlippage(expectedGAD);
      const minUSDT = applySlippage(amt - half); // минимум USDT для addLiquidity (вторая половина)

      const deadline = Math.floor(Date.now() / 1000) + 600;

      const tx = await (zap as any).zapWithUSDT(amt, minGad, minUSDT, deadline);
      await tx.wait();

      setMsg('Zapped with USDT ✅');
      setUsdtAmount('');
      await refreshBalances();
    } catch (e: any) {
      setMsg(e?.shortMessage || e?.message || 'Zap failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
      <div className="flex items-center justify-between">
        <h3 className="font-bold">One-click Add Liquidity (ZAP)</h3>
        <button className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15" onClick={connect}>
          {account ? `${account.slice(0,6)}…${account.slice(-4)}` : 'Connect Wallet'}
        </button>
      </div>

      <div className="mt-3 text-sm text-white/70">
        Contract: <span className="font-mono">{ZAP_ADDR}</span>
      </div>

      <div className="mt-4 grid md:grid-cols-2 gap-4">
        {/* ZAP BNB */}
        <div className="bg-black/30 rounded-xl p-4 border border-white/10">
          <div className="font-semibold mb-1">BNB → GAD/WBNB LP</div>
          <div className="text-xs text-white/60 mb-2">Wallet: {Number(bnbBal).toFixed(6)} BNB</div>
          <input
            value={bnbAmount}
            onChange={(e)=>setBnbAmount(sanitizeNum(e.target.value))}
            placeholder="Amount BNB (e.g. 0.05)"
            className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2 outline-none"
            disabled={busy}
          />
          <button
            className={clsx('mt-3 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15', busy && 'opacity-50')}
            onClick={zapBNB}
            disabled={busy}
          >
            ZAP with BNB
          </button>
        </div>

        {/* ZAP USDT */}
        <div className="bg-black/30 rounded-xl p-4 border border-white/10">
          <div className="font-semibold mb-1">USDT → GAD/USDT LP</div>
          <div className="text-xs text-white/60 mb-2">Wallet: {Number(usdtBal).toFixed(4)} USDT</div>
          <input
            value={usdtAmount}
            onChange={(e)=>setUsdtAmount(sanitizeNum(e.target.value))}
            placeholder="Amount USDT (e.g. 100)"
            className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2 outline-none"
            disabled={busy}
          />
          <button
            className={clsx('mt-3 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15', busy && 'opacity-50')}
            onClick={zapUSDT}
            disabled={busy}
          >
            ZAP with USDT
          </button>
        </div>
      </div>

      <div className="mt-4 text-sm text-white/70 flex items-center gap-3">
        <label>Slippage, bps:</label>
        <input
          type="number"
          min={0}
          max={3000}
          value={slippageBps}
          onChange={(e)=>setSlippageBps(Math.max(0, Math.min(3000, Number(e.target.value||'0'))))}
          className="w-24 bg-black/20 border border-white/10 rounded-xl px-2 py-1 outline-none"
          disabled={busy}
        />
        <span className="opacity-70">(100 bps = 1%) — применяется к USDT zap</span>
      </div>

      {msg && <div className="mt-3 text-sm">{msg}</div>}
    </div>
  );
}
