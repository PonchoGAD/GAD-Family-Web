'use client';

import React from 'react';
import { BrowserProvider, Contract, formatUnits, parseUnits } from 'ethers';

// ==== CONFIG ====
const STAKING_ADDRESS = '0x0271167c2b1b1513434ECe38f024434654781594';
const GAD_ADDRESS     = '0x858bab88A5b8D7F29a40380C5F2D8d0b8812FE62';
const GAD_DECIMALS    = 18;
const BSC_CHAIN_ID    = 56;

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
  'function paused() view returns (bool)',
  'function rewardRateBase() view returns (uint256)',
  'function programEnd() view returns (uint256)',
];

// ==== helpers ====
function fmt(n: string | bigint, d = GAD_DECIMALS, max = 6) {
  try {
    return Number(formatUnits(n, d)).toLocaleString(undefined, { maximumFractionDigits: max });
  } catch {
    return '0';
  }
}
function ts(t: bigint | number) {
  const v = Number(t);
  if (!v) return '-';
  const dt = new Date(v * 1000);
  return dt.toLocaleString();
}

export default function GADStaking() {
  const [provider, setProvider] = React.useState<BrowserProvider | null>(null);
  const [account, setAccount]   = React.useState<string>('');
  const [chainId, setChainId]   = React.useState<number | null>(null);
  const [pools, setPools]       = React.useState<any[]>([]);
  const [paused, setPaused]     = React.useState<boolean>(false);
  const [programEnd, setProgramEnd] = React.useState<number>(0);
  const [rateBase, setRateBase] = React.useState<string>('0');
  const [err, setErr]           = React.useState<string>('');

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
      await eth.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x38' }], // 56
      });
      // обновим сеть
      if (provider) {
        const net = await provider.getNetwork();
        setChainId(Number(net.chainId));
      }
    } catch (e:any) {
      // игнор/покажем пользователю
      setErr(e?.message || 'Cannot switch network');
    }
  };

  const refresh = React.useCallback(async () => {
    if (!provider) return;
    const staking = new Contract(STAKING_ADDRESS, STAKING_ABI, provider);
    const len = await staking.poolLength();
    const list:any[] = [];
    for (let i = 0; i < Number(len); i++) {
      const p = await staking.pools(i);
      const u = account
        ? await staking.users(i, account)
        : { amount: BigInt(0), rewardDebt: BigInt(0), unlockTime: BigInt(0) };
      const pend = account ? await staking.pendingReward(i, account) : BigInt(0);
      list.push({ pid: i, pool: p, user: u, pending: pend });
    }
    setPools(list);
    setPaused(await staking.paused());
    setRateBase((await staking.rewardRateBase()).toString());
    setProgramEnd(Number(await staking.programEnd()));
  }, [provider, account]);

  React.useEffect(() => {
    refresh();
    const id = setInterval(refresh, 15_000);
    return () => clearInterval(id);
  }, [refresh]);

  return (
    <section className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl md:text-3xl font-extrabold">GAD Single Staking</h2>
        <div className="flex gap-2">
          {chainId !== null && chainId !== BSC_CHAIN_ID && (
            <button onClick={switchToBsc} className="px-3 py-2 rounded-xl border border-white/20 hover:border-white/40">
              Switch to BNB Chain
            </button>
          )}
          <button onClick={connect} className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15">
            {account ? `${account.slice(0,6)}…${account.slice(-4)}` : 'Connect'}
          </button>
        </div>
      </div>

      {err && <div className="mt-3 text-red-400 text-sm">{err}</div>}

      <div className="text-white/70 text-sm mt-2">
        Chain: {chainId ?? '-'}
        {chainId !== null && chainId !== BSC_CHAIN_ID && (
          <span className="text-red-400 ml-2">Switch to BNB Chain (56)</span>
        )}
      </div>
      <div className="text-white/70 text-sm">Paused: {paused ? 'Yes' : 'No'} • Program end: {programEnd ? ts(programEnd) : '—'}</div>
      <div className="text-white/70 text-sm mb-6">Base reward rate: {fmt(rateBase)}/sec</div>

      <div className="grid md:grid-cols-2 gap-6">
        {pools.map(({ pid, pool, user, pending }) => (
          <PoolCard
            key={pid}
            pid={pid}
            pool={pool}
            user={user}
            pending={pending}
            provider={provider}
            account={account}
          />
        ))}
      </div>
    </section>
  );
}

function PoolCard({
  pid, pool, user, pending, provider, account,
}: {
  pid: number;
  pool: any;
  user: any;
  pending: bigint;
  provider: BrowserProvider | null;
  account: string;
}) {
  const [gadBal, setGadBal] = React.useState<string>('0');
  const [allow,  setAllow]  = React.useState<string>('0');
  const [amt,    setAmt]    = React.useState<string>('');
  const [busy,   setBusy]   = React.useState<boolean>(false);
  const [msg,    setMsg]    = React.useState<string>('');

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
    if (!provider) return;
    setBusy(true); setMsg('');
    try {
      const signer = await provider.getSigner();
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
    if (!provider || !amt) return;
    setBusy(true); setMsg('');
    try {
      const signer  = await provider.getSigner();
      const staking = new Contract(STAKING_ADDRESS, STAKING_ABI, signer);
      const tx = await staking.deposit(pid, parseUnits(amt, GAD_DECIMALS)); // deposit(pid, amount)
      await tx.wait();
      setAmt('');
      setMsg('Staked');
      await refresh();
    } catch (e:any) {
      setMsg(e?.shortMessage || e?.message || 'Stake failed');
    } finally { setBusy(false); }
  };

  const withdraw = async () => {
    if (!provider || !amt) return;
    setBusy(true); setMsg('');
    try {
      const signer  = await provider.getSigner();
      const staking = new Contract(STAKING_ADDRESS, STAKING_ABI, signer);
      const tx = await staking.withdraw(pid, parseUnits(amt, GAD_DECIMALS));
      await tx.wait();
      setAmt('');
      setMsg('Unstaked');
      await refresh();
    } catch (e:any) {
      setMsg(e?.shortMessage || e?.message || 'Unstake failed');
    } finally { setBusy(false); }
  };

  const harvest = async () => {
    if (!provider) return;
    setBusy(true); setMsg('');
    try {
      const signer  = await provider.getSigner();
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
          className="flex-1 bg-black/30 border border-white/10 rounded-xl px-3 py-2 outline-none"
          placeholder="Amount GAD"
          value={amt}
          onChange={(e)=>setAmt(e.target.value)}
          disabled={busy}
        />
        {needApprove ? (
          <button onClick={approveMax} className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 disabled:opacity-50" disabled={busy}>Approve</button>
        ) : (
          <button onClick={deposit} className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 disabled:opacity-50" disabled={busy}>Stake</button>
        )}
        <button onClick={withdraw} className="px-4 py-2 rounded-xl border border-white/20 hover:border-white/40 disabled:opacity-50" disabled={busy}>Unstake</button>
        <button onClick={harvest} className="px-4 py-2 rounded-xl bg-[#ffd166] text-black hover:opacity-90 disabled:opacity-50" disabled={busy}>Harvest</button>
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
