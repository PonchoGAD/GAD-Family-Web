'use client';

import React from 'react';
import {
  BrowserProvider,
  JsonRpcProvider,
  Contract,
  formatUnits,
  parseUnits,
} from 'ethers';

// ==== CONFIG ====
const STAKING_ADDRESS = '0x0271167c2b1b1513434ECe38f024434654781594';
const GAD_ADDRESS     = '0x858bab88A5b8D7F29a40380C5F2D8d0b8812FE62';
const GAD_DECIMALS    = 18;
const BSC_CHAIN_ID    = 56;
const PUBLIC_BSC_RPC  = 'https://bsc-dataseed.binance.org/';

// >>> Показываем только эти PID
const VISIBLE_PIDS = new Set<number>([0, 1, 2, 3]);

// ==== ABIs (минимум) ====
const ERC20_ABI = [
  'function decimals() view returns (uint8)',
  'function balanceOf(address) view returns (uint256)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
];

const STAKING_ABI = [
  'function poolLength() view returns (uint256)',
  'function pools(uint256) view returns (uint256 lockPeriod,uint256 multiplierBps,uint256 totalStaked,uint256 rewardPerTokenStored,uint256 lastUpdate,bool active,uint256 maxPerWallet)',
  'function users(uint256,address) view returns (uint256 amount,uint256 rewardDebt,uint256 unlockTime)',
  'function pendingReward(uint256,address) view returns (uint256)',
  'function deposit(uint256 pid, uint256 amount)',
  'function withdraw(uint256 pid, uint256 amount)',
  'function harvest(uint256 pid)',
];

// helpers
const fmt = (n: string | bigint, d = GAD_DECIMALS, max = 6) => {
  try { return Number(formatUnits(n, d)).toLocaleString(undefined, { maximumFractionDigits: max }); }
  catch { return '0'; }
};
const ts = (t: bigint | number) => {
  const v = Number(t);
  if (!v) return '-';
  return new Date(v * 1000).toLocaleString();
};
const cleanNum = (s: string) => (s || '').replace(',', '.').trim();

export default function GADStaking() {
  const [provider, setProvider] = React.useState<BrowserProvider | JsonRpcProvider | null>(null);
  const [account, setAccount]   = React.useState<string>('');
  const [chainId, setChainId]   = React.useState<number | null>(null);
  const [pools, setPools]       = React.useState<any[]>([]);
  const [err, setErr]           = React.useState<string>('');

  // read-only провайдер, чтобы пулы были видны без кошелька
  React.useEffect(() => {
    if (!provider) setProvider(new JsonRpcProvider(PUBLIC_BSC_RPC));
  }, [provider]);

  const connect = async () => {
    setErr('');
    try {
      const eth = (window as any).ethereum;
      if (!eth) { setErr('MetaMask not found'); return; }
      const prov = new BrowserProvider(eth);
      const net  = await prov.getNetwork();
      setChainId(Number(net.chainId));
      await prov.send('eth_requestAccounts', []);
      const signer = await prov.getSigner();
      setAccount(await signer.getAddress());
      setProvider(prov);
    } catch (e:any) {
      setErr(e?.message || 'Wallet connect failed');
    }
  };

  const switchToBsc = async () => {
    try {
      const eth = (window as any).ethereum;
      if (!eth) return;
      await eth.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: '0x38' }] });
      if (provider) {
        const net = await (provider as any).getNetwork();
        setChainId(Number(net.chainId));
      }
    } catch (e:any) {
      setErr(e?.message || 'Cannot switch network');
    }
  };

  const refresh = React.useCallback(async () => {
    if (!provider) return;

    const staking = new Contract(STAKING_ADDRESS, STAKING_ABI, provider);
    const len = Number(await staking.poolLength());

    const temp: any[] = [];
    for (let i = 0; i < len; i++) {
      // показываем ТОЛЬКО PID 0,1,2,3
      if (!VISIBLE_PIDS.has(i)) continue;

      const p = await staking.pools(i);
      const u = account
        ? await staking.users(i, account)
        : { amount: BigInt(0), rewardDebt: BigInt(0), unlockTime: BigInt(0)};
      const pend = account ? await staking.pendingReward(i, account) : BigInt(0);

      temp.push({ pid: i, pool: p, user: u, pending: pend });
    }

    // сортировка по lockPeriod, просто для красоты
    temp.sort((a, b) => Number(a.pool[0]) - Number(b.pool[0]));
    setPools(temp);
  }, [provider, account]);

  React.useEffect(() => {
    refresh();
    const id = setInterval(refresh, 15000);
    return () => clearInterval(id);
  }, [refresh]);

  const wrongNet = chainId !== null && chainId !== BSC_CHAIN_ID;
  const walletConnected = !!account;
  const disabledGlobal = !walletConnected || wrongNet;

  return (
    <section className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl md:text-3xl font-extrabold">GAD Single Staking</h2>
        <div className="flex gap-2">
          {wrongNet && (
            <button onClick={switchToBsc} className="px-3 py-2 rounded-xl border border-white/20 hover:border-white/40">
              Switch to BNB Chain
            </button>
          )}
          <button onClick={connect} className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15">
            {walletConnected ? `${account.slice(0,6)}…${account.slice(-4)}` : 'Connect'}
          </button>
        </div>
      </div>

      <p className="text-white/80 mt-2">
        Lock <b>0d ×1.0</b> / <b>30d ×1.5</b> / <b>90d ×2.5</b> / <b>180d ×3.5</b>. No LP needed — stake GAD directly.
      </p>

      {err && <div className="mt-3 text-red-400 text-sm">{err}</div>}

      <div className="mt-6 grid md:grid-cols-2 gap-6">
        {pools.map(({ pid, pool, user, pending }) => (
          <PoolCard
            key={pid}
            pid={pid}
            pool={pool}
            user={user}
            pending={pending}
            provider={provider}
            account={account}
            disabledGlobal={disabledGlobal}
          />
        ))}
      </div>
    </section>
  );
}

function PoolCard({
  pid, pool, user, pending, provider, account, disabledGlobal,
}: {
  pid: number;
  pool: any;
  user: any;
  pending: bigint;
  provider: BrowserProvider | JsonRpcProvider | null;
  account: string;
  disabledGlobal: boolean;
}) {
  const [gadBal, setGadBal] = React.useState<string>('0');
  const [allow,  setAllow]  = React.useState<string>('0');
  const [amt,    setAmt]    = React.useState<string>('');
  const [busy,   setBusy]   = React.useState<boolean>(false);
  const [msg,    setMsg]    = React.useState<string>('');

  const disabled = disabledGlobal || busy;

  const refresh = React.useCallback(async () => {
    if (!provider || !account) return;
    const gad = new Contract(GAD_ADDRESS, ERC20_ABI, provider);
    const bal = await gad.balanceOf(account);
    const a   = await gad.allowance(account, STAKING_ADDRESS);
    setGadBal(formatUnits(bal, GAD_DECIMALS));
    setAllow(formatUnits(a, GAD_DECIMALS));
  }, [provider, account]);

  React.useEffect(() => { refresh(); }, [refresh]);

  const needApprove = Number(allow) < Number(amt || '0');

  const approveMax = async () => {
    if (!provider || disabled) return;
    setBusy(true); setMsg('');
    try {
      const signer = await (provider as BrowserProvider).getSigner();
      const gad = new Contract(GAD_ADDRESS, ERC20_ABI, signer);
      const tx = await gad.approve(STAKING_ADDRESS, parseUnits('1000000000000', GAD_DECIMALS));
      await tx.wait();
      setMsg('Approved');
      await refresh();
    } catch (e:any) {
      setMsg(e?.shortMessage || e?.message || 'Approve failed');
    } finally { setBusy(false); }
  };

  const deposit = async () => {
    if (!provider || disabled || !amt) return;
    setBusy(true); setMsg('');
    try {
      const signer  = await (provider as BrowserProvider).getSigner();
      const staking = new Contract(STAKING_ADDRESS, STAKING_ABI, signer);
      const tx = await staking.deposit(pid, parseUnits(cleanNum(amt), GAD_DECIMALS));
      await tx.wait();
      setAmt('');
      setMsg('Staked');
      await refresh();
    } catch (e:any) {
      setMsg(e?.shortMessage || e?.message || 'Stake failed');
    } finally { setBusy(false); }
  };

  const withdraw = async () => {
    if (!provider || disabled || !amt) return;
    setBusy(true); setMsg('');
    try {
      const signer  = await (provider as BrowserProvider).getSigner();
      const staking = new Contract(STAKING_ADDRESS, STAKING_ABI, signer);
      const tx = await staking.withdraw(pid, parseUnits(cleanNum(amt), GAD_DECIMALS));
      await tx.wait();
      setAmt('');
      setMsg('Unstaked');
      await refresh();
    } catch (e:any) {
      setMsg(e?.shortMessage || e?.message || 'Unstake failed');
    } finally { setBusy(false); }
  };

  const harvest = async () => {
    if (!provider || disabled) return;
    setBusy(true); setMsg('');
    try {
      const signer  = await (provider as BrowserProvider).getSigner();
      const staking = new Contract(STAKING_ADDRESS, STAKING_ABI, signer);
      const tx = await staking.harvest(pid);
      await tx.wait();
      setMsg('Harvested');
      await refresh();
    } catch (e:any) {
      setMsg(e?.shortMessage || e?.message || 'Harvest failed');
    } finally { setBusy(false); }
  };

  const [lockSec, multBps, totalStaked, , , active, maxPerWallet] = pool;
  const { amount, unlockTime } = user;

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
      <div className="flex items-center justify-between">
        <h3 className="font-bold">
          Pool #{pid} • Lock: {Number(lockSec)/86400}d • Mult: {(Number(multBps)/10000).toFixed(2)}x
        </h3>
        {!active && <span className="text-xs text-red-400">inactive</span>}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
        <Stat label="Your GAD" value={gadBal} />
        <Stat label="Allowance" value={allow} />
        <Stat label="Staked" value={fmt(amount)} />
        <Stat label="Pending" value={fmt(pending)} />
        <Stat label="Unlock" value={unlockTime ? ts(unlockTime) : '-'} />
        <Stat label="Pool TVL (GAD)" value={fmt(totalStaked)} />
        <Stat label="Per-wallet cap" value={maxPerWallet ? fmt(maxPerWallet) : '∞'} />
      </div>

      <div className="mt-4 flex gap-2">
        <input
          className="flex-1 bg-black/30 border border-white/10 rounded-xl px-3 py-2 outline-none disabled:opacity-50"
          placeholder="Amount GAD"
          value={amt}
          onChange={(e)=>setAmt(cleanNum(e.target.value))}
          disabled={disabled}
        />
        {needApprove ? (
          <button onClick={approveMax} className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 disabled:opacity-50" disabled={disabled}>
            Approve
          </button>
        ) : (
          <button onClick={deposit} className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 disabled:opacity-50" disabled={disabled}>
            Stake
          </button>
        )}
        <button onClick={withdraw} className="px-4 py-2 rounded-xl border border-white/20 hover:border-white/40 disabled:opacity-50" disabled={disabled}>
          Unstake
        </button>
        <button onClick={harvest} className="px-4 py-2 rounded-xl bg-[#ffd166] text-black hover:opacity-90 disabled:opacity-50" disabled={disabled}>
          Harvest
        </button>
      </div>

      {msg && <div className="mt-2 text-xs text-white/70">{msg}</div>}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-black/30 rounded-xl p-3 border border-white/10">
      <div className="text-white/60 text-xs">{label}</div>
      <div className="font-bold">{value}</div>
    </div>
  );
}
