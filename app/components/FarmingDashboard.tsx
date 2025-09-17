'use client';

import React from 'react';
import { BrowserProvider, Contract, formatUnits, parseUnits } from 'ethers';
import clsx from 'clsx';

// ---- minimal ABIs ----
const ERC20_ABI = [
  'function decimals() view returns (uint8)',
  'function balanceOf(address) view returns (uint256)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)'
];

const MASTERCHEF_ABI = [
  'function poolLength() view returns (uint256)',
  'function pendingReward(uint256 pid, address user) view returns (uint256)',
  'function deposit(uint256 pid, uint256 amount)',
  'function withdraw(uint256 pid, uint256 amount)',
  'function emergencyWithdraw(uint256 pid)',
  'function userInfo(uint256 pid, address user) view returns (uint256 amount, uint256 rewardDebt)',
  'function poolInfo(uint256 pid) view returns (address lpToken, uint256 allocPoint, uint256 lastRewardBlock, uint256 accRewardPerShare)',
  'function totalAllocPoint() view returns (uint256)',
  'function bonusEndBlock() view returns (uint256)',
  'function startBlock() view returns (uint256)',
  'function baseRewardPerBlock() view returns (uint256)'
];

// ---- types ----
type PoolCfg = {
  id: number;
  name: string;
  lpToken: string;
  allocPoint: number;
  pairUrl: string;
};

export type FarmingConfig = {
  masterChef: string;
  rewardToken: string;
  rewardDecimals: number;
  rewardPerBlock: string;
  startBlock: string;
  bonusEndBlock: string;
  bonusMultiplier: number;
  totalRewards: string;
  pools: PoolCfg[];
};

const BSC_CHAIN_ID = 56;

export default function FarmingDashboard() {
  const [cfg, setCfg] = React.useState<FarmingConfig | null>(null);
  const [provider, setProvider] = React.useState<BrowserProvider | null>(null);
  const [account, setAccount] = React.useState<string>('');
  const [chainId, setChainId] = React.useState<number | null>(null);
  const [err, setErr] = React.useState<string>('');

  React.useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/farming-config', { cache: 'no-store' });
        const data = await res.json();
        setCfg(data);
      } catch (e: any) {
        setErr('Failed to load farming config');
      }
    })();
  }, []);

  const connect = async () => {
    setErr('');
    try {
      if (!(window as any).ethereum) {
        setErr('MetaMask not found');
        return;
      }
      const prov = new BrowserProvider((window as any).ethereum);
      const network = await prov.getNetwork();
      setChainId(Number(network.chainId));
      if (Number(network.chainId) !== BSC_CHAIN_ID) {
        setErr('Wrong network. Switch to BNB Smart Chain (56).');
      }
      const accs = await prov.send('eth_requestAccounts', []);
      setProvider(prov);
      setAccount(accs[0]);
    } catch (e: any) {
      setErr(e?.message || 'Failed to connect wallet');
    }
  };

  return (
    <section className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-2xl md:text-3xl font-extrabold">Liquidity Mining</h2>
        <button
          onClick={connect}
          className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15"
        >
          {account ? `${account.slice(0,6)}…${account.slice(-4)}` : 'Connect Wallet'}
        </button>
      </div>

      {cfg ? (
        <>
          <p className="text-white/70 mt-2">
            Rewards pool: 100B GAD • Bonus x{cfg.bonusMultiplier} until block {cfg.bonusEndBlock}
          </p>
          {err && <div className="mt-3 text-red-400 text-sm">{err}</div>}

          <div className="mt-6 grid md:grid-cols-2 gap-6">
            {cfg.pools.map((p) => (
              <PoolCard
                key={p.id}
                cfg={cfg}
                pool={p}
                provider={provider}
                account={account}
                disabled={chainId !== null && chainId !== BSC_CHAIN_ID}
              />
            ))}
          </div>
        </>
      ) : (
        <p className="text-white/70 mt-2">Loading config…</p>
      )}
    </section>
  );
}

function PoolCard({
  cfg,
  pool,
  provider,
  account,
  disabled
}: {
  cfg: FarmingConfig;
  pool: PoolCfg;
  provider: BrowserProvider | null;
  account: string;
  disabled: boolean;
}) {
  const [lpDecimals, setLpDecimals] = React.useState<number>(18);
  const [lpBalance, setLpBalance] = React.useState<string>('0');
  const [staked, setStaked] = React.useState<string>('0');
  const [allowance, setAllowance] = React.useState<string>('0');
  const [pending, setPending] = React.useState<string>('0');
  const [amount, setAmount] = React.useState<string>('');
  const [busy, setBusy] = React.useState<boolean>(false);
  const [msg, setMsg] = React.useState<string>('');

  const refresh = React.useCallback(async () => {
    if (!provider || !account) return;
    const signer = await provider.getSigner();
    const lp = new Contract(pool.lpToken, ERC20_ABI, provider);
    const chef = new Contract(cfg.masterChef, MASTERCHEF_ABI, provider);

    const d = await lp.decimals().catch(()=>18);
    setLpDecimals(Number(d));

    const bal = await lp.balanceOf(account);
    setLpBalance(formatUnits(bal, d));

    const userInfo = await chef.userInfo(pool.id, account);
    setStaked(formatUnits(userInfo[0], d));

    const allo = await lp.allowance(account, cfg.masterChef);
    setAllowance(formatUnits(allo, d));

    const pend = await chef.pendingReward(pool.id, account);
    setPending(formatUnits(pend, cfg.rewardDecimals));
  }, [provider, account, cfg.masterChef, pool.id, pool.lpToken, cfg.rewardDecimals]);

  React.useEffect(() => {
    refresh();
    const id = setInterval(refresh, 15_000);
    return () => clearInterval(id);
  }, [refresh]);

  const approveMax = async () => {
    if (!provider) return;
    setBusy(true); setMsg('');
    try {
      const signer = await provider.getSigner();
      const lp = new Contract(pool.lpToken, ERC20_ABI, signer);
      const tx = await lp.approve(cfg.masterChef, parseUnits('1000000000000', lpDecimals));
      await tx.wait();
      setMsg('Approved');
      await refresh();
    } catch (e: any) {
      setMsg(e?.shortMessage || e?.message || 'Approve failed');
    } finally {
      setBusy(false);
    }
  };

  const deposit = async () => {
    if (!provider || !amount) return;
    setBusy(true); setMsg('');
    try {
      const signer = await provider.getSigner();
      const chef = new Contract(cfg.masterChef, MASTERCHEF_ABI, signer);
      const tx = await chef.deposit(pool.id, parseUnits(amount, lpDecimals));
      await tx.wait();
      setAmount('');
      setMsg('Staked');
      await refresh();
    } catch (e: any) {
      setMsg(e?.shortMessage || e?.message || 'Stake failed');
    } finally {
      setBusy(false);
    }
  };

  const withdraw = async () => {
    if (!provider || !amount) return;
    setBusy(true); setMsg('');
    try {
      const signer = await provider.getSigner();
      const chef = new Contract(cfg.masterChef, MASTERCHEF_ABI, signer);
      const tx = await chef.withdraw(pool.id, parseUnits(amount, lpDecimals));
      await tx.wait();
      setAmount('');
      setMsg('Unstaked');
      await refresh();
    } catch (e: any) {
      setMsg(e?.shortMessage || e?.message || 'Unstake failed');
    } finally {
      setBusy(false);
    }
  };

  const harvest = async () => {
    if (!provider) return;
    setBusy(true); setMsg('');
    try {
      const signer = await provider.getSigner();
      const chef = new Contract(cfg.masterChef, MASTERCHEF_ABI, signer);
      const tx = await chef.deposit(pool.id, 0); // harvest
      await tx.wait();
      setMsg('Harvested');
      await refresh();
    } catch (e: any) {
      setMsg(e?.shortMessage || e?.message || 'Harvest failed');
    } finally {
      setBusy(false);
    }
  };

  const needApprove = Number(allowance) < Number(amount || '0');

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
      <div className="flex items-center justify-between">
        <h3 className="font-bold">{pool.name}</h3>
        <a
          href={pool.pairUrl}
          target="_blank"
          rel="noreferrer"
          className="text-xs text-white/70 hover:underline"
        >
          Add Liquidity
        </a>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <Stat label="LP balance" value={lpBalance} />
        <Stat label="Staked" value={staked} />
        <Stat label="Pending GAD" value={pending} />
        <Stat label="Allowance" value={allowance} />
      </div>

      <div className="mt-5 flex gap-2">
        <input
          placeholder="Amount LP"
          value={amount}
          onChange={(e)=>setAmount(e.target.value)}
          className="flex-1 bg-black/30 border border-white/10 rounded-xl px-3 py-2 outline-none"
          disabled={disabled || busy}
        />
        {needApprove ? (
          <button onClick={approveMax} className={btnCls(disabled, busy)} disabled={disabled || busy}>Approve</button>
        ) : (
          <button onClick={deposit} className={btnCls(disabled, busy)} disabled={disabled || busy}>Stake</button>
        )}
        <button onClick={withdraw} className={btnOutlineCls(disabled, busy)} disabled={disabled || busy}>Unstake</button>
        <button onClick={harvest} className={btnYellowCls(disabled, busy)} disabled={disabled || busy}>Harvest</button>
      </div>

      {msg && <div className="mt-3 text-xs text-white/70">{msg}</div>}
      {disabled && <div className="mt-2 text-xs text-red-400">Wrong network: switch to BNB Chain (56).</div>}
    </div>
  );
}

function Stat({label, value}:{label:string; value:string}) {
  return (
    <div className="bg-black/30 rounded-xl p-3 border border-white/10">
      <div className="text-white/60 text-xs">{label}</div>
      <div className="font-bold">{value}</div>
    </div>
  );
}

function btnCls(disabled:boolean, busy:boolean) {
  return clsx(
    'px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15',
    (disabled || busy) && 'opacity-50 cursor-not-allowed'
  );
}
function btnOutlineCls(disabled:boolean, busy:boolean) {
  return clsx(
    'px-4 py-2 rounded-xl border border-white/20 hover:border-white/40',
    (disabled || busy) && 'opacity-50 cursor-not-allowed'
  );
}
function btnYellowCls(disabled:boolean, busy:boolean) {
  return clsx(
    'px-4 py-2 rounded-xl bg-[#ffd166] text-[#0b0f17] font-semibold hover:opacity-90',
    (disabled || busy) && 'opacity-50 cursor-not-allowed'
  );
}
