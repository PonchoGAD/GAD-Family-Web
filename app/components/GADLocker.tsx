'use client';

import React from 'react';
import {
  BrowserProvider,
  JsonRpcProvider,
  Contract,
  formatUnits,
  parseUnits,
  type Eip1193Provider,
} from 'ethers';

// ======== ADDRESSES (token + locker only) ========
const GAD_ADDRESS = '0x858bab88A5b8D7F29a40380C5F2D8d0b8812FE62'; // GAD ERC-20
// Prefer .env; fallback to your locker for safety if env is missing
const LOCKER_ADDRESS = (process.env.NEXT_PUBLIC_GAD_LOCKER_ADDRESS?.trim() ||
  '0x2479158bFA2a0F164E7a1B9b7CaF8d3Ea2307ea1');

// ======== NETWORK / RPC ========
const BSC_CHAIN_ID   = 56;
const PUBLIC_BSC_RPC = 'https://bsc-dataseed.binance.org/';

// ======== Minimal ABIs ========
const ERC20_ABI = [
  'function decimals() view returns (uint8)',
  'function balanceOf(address) view returns (uint256)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
];

const LOCKER_ABI = [
  // views
  'function tokenDecimals() view returns (uint8)',
  'function getLockOptions() view returns (tuple(uint40 duration,uint16 aprBps,uint200 _gap)[4])',
  'function positionsOf(address user) view returns (tuple(uint256 amount,uint40 startTime,uint40 lockEnd,uint40 lastAccrualTime,uint8 lockId,uint128 _reserved,uint256 unclaimed)[])',
  'function pendingRewardsByPosition(address user,uint256 positionId) view returns (uint256)',
  'function stakedOf(address user) view returns (uint256)',
  'function userStakeCap() view returns (uint256)',
  // writes
  'function deposit(uint256 amount,uint8 lockId)',
  'function addToPosition(uint256 positionId,uint256 amount)',
  'function claim(uint256 positionId)',
  'function claimAll()',
  'function withdraw(uint256 positionId,uint256 amount)',
  'function exit(uint256 positionId)',
  'function compound(uint256 positionId)',
  'function extendLock(uint256 positionId,uint8 newLockId)',
];

type EIP1193 = { request(args: { method: string; params?: unknown[] }): Promise<unknown> };
const getEth = () => (window as unknown as { ethereum?: EIP1193 }).ethereum;

// utils
const fmt = (n: string | bigint, d = 18, max = 6) => {
  try { return Number(formatUnits(n, d)).toLocaleString(undefined, { maximumFractionDigits: max }); }
  catch { return '0'; }
};
const ts = (t: bigint | number) => {
  const v = Number(t); if (!v) return '-';
  return new Date(v * 1000).toLocaleString();
};
const cleanNum = (s: string) => (s || '').replace(',', '.').trim();

type Position = {
  amount: bigint;
  startTime: bigint;
  lockEnd: bigint;
  lastAccrualTime: bigint;
  lockId: number;
  _reserved: bigint;
  unclaimed: bigint;
};

type LockOption = { duration: bigint; aprBps: number; _gap: bigint };

export default function GADLocker() {
  const [provider, setProvider] = React.useState<BrowserProvider | JsonRpcProvider | null>(null);
  const [account, setAccount]   = React.useState<string>('');
  const [chainId, setChainId]   = React.useState<number | null>(null);
  const [decimals, setDecimals] = React.useState<number>(18);

  const [locks, setLocks]       = React.useState<LockOption[]>([]);
  const [positions, setPos]     = React.useState<Position[]>([]);
  const [pending, setPending]   = React.useState<Record<number, bigint>>({});
  const [cap, setCap]           = React.useState<string>('0');
  const [staked, setStaked]     = React.useState<string>('0');

  const [toast, setToast]       = React.useState<string>(''); // short notices (incl. partial payout hint)
  const [err, setErr]           = React.useState<string>('');

  // read-only provider for public view
  React.useEffect(() => {
    if (!provider) setProvider(new JsonRpcProvider(PUBLIC_BSC_RPC));
  }, [provider]);

  const connect = async () => {
    setErr('');
    try {
      const eth = getEth();
      if (!eth) { setErr('MetaMask not found'); return; }
      const prov = new BrowserProvider(eth as unknown as Eip1193Provider);
      await prov.send('eth_requestAccounts', []);
      const net = await prov.getNetwork();
      setChainId(Number(net.chainId));
      const signer = await prov.getSigner();
      setAccount(await signer.getAddress());
      setProvider(prov);
    } catch (e) {
      const er = e as { message?: string };
      setErr(er?.message || 'Wallet connect failed');
    }
  };

  const switchToBsc = async () => {
    try {
      const eth = getEth();
      if (!eth) return;
      await eth.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: '0x38' }] });
      if (provider) {
        const net = await provider.getNetwork();
        setChainId(Number(net.chainId));
      }
    } catch (e) {
      const er = e as { message?: string };
      setErr(er?.message || 'Cannot switch network');
    }
  };

  const refresh = React.useCallback(async () => {
    if (!provider || !LOCKER_ADDRESS) return;
    try {
      const locker = new Contract(LOCKER_ADDRESS, LOCKER_ABI, provider);
      const d  = Number(await locker.tokenDecimals());
      setDecimals(d);

      const lks = (await locker.getLockOptions()) as LockOption[];
      const sorted = [...lks].sort((a, b) => Number(a.duration) - Number(b.duration));
      setLocks(sorted); // typically 4: 30/60/90/180 days

      if (account) {
        const list = (await locker.positionsOf(account)) as Position[];
        setPos(list);
        const pend: Record<number, bigint> = {};
        for (let i = 0; i < list.length; i++) {
          pend[i] = (await locker.pendingRewardsByPosition(account, i)) as bigint;
        }
        setPending(pend);
        const st = await locker.stakedOf(account);
        setStaked(formatUnits(st, d));
      } else {
        setPos([]); setPending({}); setStaked('0');
      }

      const c = await locker.userStakeCap();
      setCap(formatUnits(c, d));
    } catch (e) {
      const er = e as { message?: string };
      setErr(er?.message || 'Failed to load on-chain data');
    }
  }, [provider, account]);

  React.useEffect(() => {
    refresh();
    const id = setInterval(refresh, 15_000);
    return () => clearInterval(id);
  }, [refresh]);

  const wrongNet = chainId !== null && chainId !== BSC_CHAIN_ID;
  const walletConnected = !!account;
  const disabledGlobal = !walletConnected || wrongNet || !LOCKER_ADDRESS;

  return (
    <section className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl md:text-3xl font-extrabold">GAD Single Staking (Locker)</h2>
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
        APR and lock periods are read on-chain. Withdrawals are available only after the lock ends.
      </p>

      {err && <div className="mt-3 text-red-400 text-sm">{err}</div>}
      {toast && <div className="mt-3 text-xs text-yellow-300/90">{toast}</div>}

      {/* Cap / totals / addresses */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
        <Stat label="Your total staked (GAD)" value={staked} />
        <Stat label="Per-wallet cap (GAD)" value={cap} />
        <Stat label="Locker" value={LOCKER_ADDRESS ? `${LOCKER_ADDRESS.slice(0,8)}…${LOCKER_ADDRESS.slice(-4)}` : '—'} />
        <Stat label="Token"  value={`${GAD_ADDRESS.slice(0,8)}…${GAD_ADDRESS.slice(-4)}`} />
      </div>

      {/* Lock cards (4 windows from on-chain config) */}
      <div className="mt-6 grid md:grid-cols-2 gap-6">
        {locks.map((lk, idx) => (
          <LockCard
            key={idx}
            idx={idx}
            lock={lk}
            decimals={decimals}
            disabledGlobal={disabledGlobal}
            provider={provider}
            account={account}
          />
        ))}
      </div>

      {/* Positions + claimAll */}
      {positions.length > 0 && (
        <div className="mt-10">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xl font-bold">Your positions</h3>
            <button
              onClick={async () => {
                if (!provider || disabledGlobal) return;
                setToast('');
                try {
                  const signer = await (provider as BrowserProvider).getSigner();
                  const locker = new Contract(LOCKER_ADDRESS, LOCKER_ABI, signer);
                  await (await locker.claimAll()).wait();
                  // If rewards pool is temporarily low, show a partial payout notice
                  await new Promise(r => setTimeout(r, 1200));
                  await refresh();
                  const stillPending = Object.values(pending).some(v => Number(v) > 0);
                  setToast(stillPending ? 'ClaimAll: partial payout (rewards pool limited temporarily)' : 'ClaimAll: success');
                } catch (e) {
                  const er = e as { message?: string };
                  setToast(er?.message || 'ClaimAll failed');
                }
              }}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 disabled:opacity-50"
              disabled={disabledGlobal}
            >
              Claim All
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {positions.map((p, i) => (
              <PositionCard
                key={i}
                id={i}
                p={p}
                decimals={decimals}
                disabledGlobal={disabledGlobal}
                provider={provider}
                setToast={setToast}
                locks={locks}
                onAfterAction={refresh}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function LockCard({
  idx, lock, decimals, disabledGlobal, provider, account,
}: {
  idx: number;
  lock: LockOption;
  decimals: number;
  disabledGlobal: boolean;
  provider: BrowserProvider | JsonRpcProvider | null;
  account: string;
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
    const a   = await gad.allowance(account, LOCKER_ADDRESS);
    setGadBal(formatUnits(bal, decimals));
    setAllow(formatUnits(a, decimals));
  }, [provider, account, decimals]);

  React.useEffect(() => { refresh(); }, [refresh]);

  const needApprove = Number(allow) < Number(amt || '0');
  const days = Number(lock.duration) / 86400;
  const apr  = (Number(lock.aprBps) / 100).toFixed(2);

  const approveMax = async () => {
    if (!provider || disabled) return;
    setBusy(true); setMsg('');
    try {
      const signer = await (provider as BrowserProvider).getSigner();
      const gad = new Contract(GAD_ADDRESS, ERC20_ABI, signer);
      const tx = await gad.approve(LOCKER_ADDRESS, parseUnits('1000000000000', decimals));
      await tx.wait();
      setMsg('Approved');
      await refresh();
    } catch (e) {
      const er = e as { shortMessage?: string; message?: string };
      setMsg(er?.shortMessage || er?.message || 'Approve failed');
    } finally { setBusy(false); }
  };

  const deposit = async () => {
    if (!provider || disabled || !amt) return;
    setBusy(true); setMsg('');
    try {
      const signer  = await (provider as BrowserProvider).getSigner();
      const locker  = new Contract(LOCKER_ADDRESS, LOCKER_ABI, signer);
      const tx = await locker.deposit(parseUnits(cleanNum(amt), decimals), idx as unknown as number);
      await tx.wait();
      setAmt('');
      setMsg('Staked');
      await refresh();
    } catch (e) {
      const er = e as { shortMessage?: string; message?: string };
      setMsg(er?.shortMessage || er?.message || 'Stake failed');
    } finally { setBusy(false); }
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
      <div className="flex items-center justify-between">
        <h3 className="font-bold">
          Lock {days}d • APR {apr}%
        </h3>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
        <Stat label="Your GAD" value={gadBal} />
        <Stat label="Allowance" value={allow} />
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
      </div>

      {msg && <div className="mt-2 text-xs text-white/70">{msg}</div>}
      {disabledGlobal && <div className="mt-2 text-xs text-red-400">Wrong network: switch to BNB Chain (56).</div>}
    </div>
  );
}

function PositionCard({
  id, p, decimals, disabledGlobal, provider, setToast, locks, onAfterAction,
}: {
  id: number;
  p: Position;
  decimals: number;
  disabledGlobal: boolean;
  provider: BrowserProvider | JsonRpcProvider | null;
  setToast: (s: string) => void;
  locks: LockOption[];
  onAfterAction: () => Promise<void> | void;
}) {
  const [amt,  setAmt]  = React.useState<string>('');
  const [busy, setBusy] = React.useState<boolean>(false);
  const [msg,  setMsg]  = React.useState<string>('');
  const [sel,  setSel]  = React.useState<number | null>(null); // target lockId for extend

  const disabled = disabledGlobal || busy;
  const canWithdraw = Number(p.lockEnd) * 1000 <= Date.now();

  const claim = async () => {
    if (!provider || disabled) return;
    setBusy(true); setMsg('');
    try {
      const signer  = await (provider as BrowserProvider).getSigner();
      const locker  = new Contract(LOCKER_ADDRESS, LOCKER_ABI, signer);

      // measure pending before/after to show "partial payout" notice
      const pendingBefore = await locker.pendingRewardsByPosition(await signer.getAddress(), id);
      const tx = await locker.claim(id);
      await tx.wait();

      await new Promise(r => setTimeout(r, 1000));
      const pendingAfter  = await locker.pendingRewardsByPosition(await signer.getAddress(), id);

      setMsg('Harvested');
      if (pendingAfter > 0n && pendingAfter >= pendingBefore / 10n) {
        setToast('Partial payout — rewards pool is temporarily limited');
      }
      await onAfterAction();
    } catch (e) {
      const er = e as { shortMessage?: string; message?: string };
      setMsg(er?.shortMessage || er?.message || 'Harvest failed');
    } finally { setBusy(false); }
  };

  const withdraw = async () => {
    if (!provider || disabled || !amt) return;
    setBusy(true); setMsg('');
    try {
      const signer  = await (provider as BrowserProvider).getSigner();
      const locker  = new Contract(LOCKER_ADDRESS, LOCKER_ABI, signer);
      const tx = await locker.withdraw(id, parseUnits(cleanNum(amt), decimals));
      await tx.wait();
      setAmt('');
      setMsg('Unstaked');
      await onAfterAction();
    } catch (e) {
      const er = e as { shortMessage?: string; message?: string };
      setMsg(er?.shortMessage || er?.message || 'Unstake failed');
    } finally { setBusy(false); }
  };

  const exit = async () => {
    if (!provider || disabled) return;
    setBusy(true); setMsg('');
    try {
      const signer  = await (provider as BrowserProvider).getSigner();
      const locker  = new Contract(LOCKER_ADDRESS, LOCKER_ABI, signer);
      const tx = await locker.exit(id);
      await tx.wait();
      setMsg('Exited');
      await onAfterAction();
    } catch (e) {
      const er = e as { shortMessage?: string; message?: string };
      setMsg(er?.shortMessage || er?.message || 'Exit failed');
    } finally { setBusy(false); }
  };

  // list only longer targets than current lockId
  const longerTargets = locks
    .map((lk, idx) => ({ idx, durationDays: Number(lk.duration) / 86400 }))
    .filter(t => t.idx > p.lockId);

  const doExtend = async () => {
    if (!provider || disabled || sel === null) return;
    setBusy(true); setMsg('');
    try {
      const signer  = await (provider as BrowserProvider).getSigner();
      const locker  = new Contract(LOCKER_ADDRESS, LOCKER_ABI, signer);
      const tx = await locker.extendLock(id, sel);
      await tx.wait();
      setMsg(`Extended to lockId ${sel}`);
      await onAfterAction();
    } catch (e) {
      const er = e as { shortMessage?: string; message?: string };
      setMsg(er?.shortMessage || er?.message || 'Extend failed');
    } finally { setBusy(false); }
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
      <div className="flex items-center justify-between">
        <h4 className="font-bold">
          Position #{id} • LockId {p.lockId}
        </h4>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
        <Stat label="Staked (GAD)"   value={fmt(p.amount, decimals)} />
        <Stat label="Unclaimed (GAD)" value={fmt(p.unclaimed, decimals)} />
        <Stat label="Started"        value={ts(p.startTime)} />
        <Stat label="Unlock"         value={ts(p.lockEnd)} />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <input
          className="min-w-[180px] flex-1 bg-black/30 border border-white/10 rounded-xl px-3 py-2 outline-none disabled:opacity-50"
          placeholder="Amount to withdraw"
          value={amt}
          onChange={(e)=>setAmt(cleanNum(e.target.value))}
          disabled={disabled || !canWithdraw}
        />
        <button onClick={claim} className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 disabled:opacity-50" disabled={disabled}>
          Harvest
        </button>
        <button onClick={withdraw} className="px-4 py-2 rounded-xl border border-white/20 hover:border-white/40 disabled:opacity-50" disabled={disabled || !canWithdraw}>
          Withdraw
        </button>
        <button onClick={exit} className="px-4 py-2 rounded-xl bg-[#ffd166] text-black hover:opacity-90 disabled:opacity-50" disabled={disabled || !canWithdraw}>
          Exit
        </button>
      </div>

      {/* Extend UI */}
      <div className="mt-4 flex items-center gap-2">
        <label className="text-xs text-white/70">Extend to:</label>
        <select
          className="bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-sm"
          value={sel ?? ''}
          onChange={(e)=> setSel(e.target.value === '' ? null : Number(e.target.value))}
          disabled={disabled || longerTargets.length === 0}
        >
          <option value="">—</option>
          {longerTargets.map(t => (
            <option key={t.idx} value={t.idx}>Lock {t.durationDays}d (id {t.idx})</option>
          ))}
        </select>
        <button
          onClick={doExtend}
          className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 disabled:opacity-50 text-sm"
          disabled={disabled || sel === null}
        >
          Extend
        </button>
      </div>

      {msg && <div className="mt-2 text-xs text-white/70">{msg}</div>}
      {!canWithdraw && <div className="mt-2 text-xs text-white/50">Withdraw/Exit available after unlock time.</div>}
      {disabledGlobal && <div className="mt-2 text-xs text-red-400">Wrong network: switch to BNB Chain (56).</div>}
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
