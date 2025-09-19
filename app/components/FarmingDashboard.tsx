'use client';

import React from 'react';
import { BrowserProvider, Contract, formatUnits, parseUnits, getAddress } from 'ethers';
import clsx from 'clsx';
// import GetLpHelp from './GetLpHelp'; // включи при необходимости

// ---- address helpers ----
const isHexAddress = (s: string) => /^0x[0-9a-fA-F]{40}$/.test((s || '').trim());
const normAddr = (s: string) => {
  const t = (s || '').trim();
  if (!isHexAddress(t)) return null;
  try { return getAddress(t); } catch { return t; } // допустим даже без checksum
};

// ---- minimal ABIs ----
const ERC20_ABI = [
  'function decimals() view returns (uint8)',
  'function balanceOf(address) view returns (uint256)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
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
  'function baseRewardPerBlock() view returns (uint256)',
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

// ---- network switch helper ----
async function switchToBsc(): Promise<void> {
  const ethereum = (window as any).ethereum;
  if (!ethereum) throw new Error('MetaMask not found');
  try {
    await ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: '0x38' }] });
  } catch (err: any) {
    if (err?.code === 4902) {
      await ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: '0x38',
          chainName: 'BNB Smart Chain',
          nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
          rpcUrls: ['https://bsc-dataseed.binance.org/'],
          blockExplorerUrls: ['https://bscscan.com'],
        }],
      });
    } else {
      throw err;
    }
  }
}

export default function FarmingDashboard() {
  const [cfg, setCfg] = React.useState<FarmingConfig | null>(null);
  const [provider, setProvider] = React.useState<BrowserProvider | null>(null);
  const [account, setAccount] = React.useState<string>('');
  const [chainId, setChainId] = React.useState<number | null>(null);
  const [err, setErr] = React.useState<string>('');

  // ---- load config: API -> public -> fallback
  React.useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/farming-config', { cache: 'no-store' });
        if (res.ok) { setCfg(await res.json()); return; }
        const res2 = await fetch('/farming.config.json', { cache: 'no-store' }).catch(() => null as any);
        if (res2?.ok) { setCfg(await res2.json()); return; }
      } catch {}
      setCfg({
        masterChef: '0x5C5c0b9eE66CC106f90D7b1a3727dc126C4eF188',
        rewardToken: '0x858bab88A5b8D7F29a40380C5F2D8d0b8812FE62',
        rewardDecimals: 18,
        rewardPerBlock: '16534391534391536',
        startBlock: '61230868',
        bonusEndBlock: '62094868',
        bonusMultiplier: 2,
        totalRewards: '100000000000000000000000000000',
        pools: [
          {
            id: 0,
            name: 'GAD–USDT LP',
            lpToken: '0xFf74Ed4c41743a2ff1Cf2e3869E861743cceBf1',
            allocPoint: 70,
            pairUrl: 'https://pancakeswap.finance/add/0x55d398326f99059fF775485246999027B3197955/0x858bab88A5b8D7F29a40380C5F2D8d0b8812FE62?chain=bsc',
          },
          {
            id: 1,
            name: 'GAD–BNB LP',
            lpToken: '0x85c6BAFce7880484a417cb5d7067FDE843328997',
            allocPoint: 30,
            pairUrl: 'https://pancakeswap.finance/add/0xBB4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c/0x858bab88A5b8D7F29a40380C5F2D8d0b8812FE62?chain=bsc',
          },
        ],
      });
    })();
  }, []);

  // ---- connect wallet
  const connect = async () => {
    setErr('');
    try {
      const eth = (window as any).ethereum;
      if (!eth) { setErr('MetaMask not found'); return; }
      const prov = new BrowserProvider(eth);
      const network = await prov.getNetwork();
      setChainId(Number(network.chainId));
      if (Number(network.chainId) !== BSC_CHAIN_ID) setErr('Wrong network. Switch to BNB Smart Chain (56).');
      const accs = await prov.send('eth_requestAccounts', []);
      setProvider(prov);
      setAccount(accs[0]);
      eth.on?.('chainChanged', () => window.location.reload());
      eth.on?.('accountsChanged', (accs: string[]) => setAccount(accs?.[0] || ''));
    } catch (e: any) {
      setErr(e?.message || 'Failed to connect wallet');
    }
  };

  // ---- switch network
  const handleSwitch = async () => {
    try {
      await switchToBsc();
      setErr('');
      if ((window as any).ethereum) {
        const prov = new BrowserProvider((window as any).ethereum);
        const network = await prov.getNetwork();
        setProvider(prov);
        setChainId(Number(network.chainId));
      }
    } catch (e: any) {
      setErr(e?.message || 'Failed to switch network');
    }
  };

  return (
    <section className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-2xl md:text-3xl font-extrabold">Liquidity Mining</h2>
        <div className="flex items-center gap-2">
          <button onClick={handleSwitch} className="px-3 py-2 rounded-xl border border-white/20 hover:border-white/40 text-sm">
            Switch to BNB Chain
          </button>
          <button onClick={connect} className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15">
            {account ? `${account.slice(0,6)}…${account.slice(-4)}` : 'Connect Wallet'}
          </button>
        </div>
      </div>

      {cfg ? (
        <>
          {/* ОБНОВЛЁННЫЙ заголовок: ясно, что 100B — общий пул */}
          <p className="text-white/70 mt-2">
            Total program: 100B GAD • Emissions split by pools (allocPoints) • Bonus x{cfg.bonusMultiplier} until block {cfg.bonusEndBlock}
          </p>

          {err && <div className="mt-3 text-red-400 text-sm">{err}</div>}
          {/* <GetLpHelp /> */}

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
  cfg, pool, provider, account, disabled,
}: {
  cfg: FarmingConfig; pool: PoolCfg; provider: BrowserProvider | null; account: string; disabled: boolean;
}) {
  const [lpDecimals, setLpDecimals] = React.useState<number>(18);
  const [lpBalance, setLpBalance] = React.useState<string>('0');
  const [staked, setStaked] = React.useState<string>('0');
  const [allowance, setAllowance] = React.useState<string>('0');
  const [pending, setPending] = React.useState<string>('0');
  const [amount, setAmount] = React.useState<string>('');
  const [busy, setBusy] = React.useState<boolean>(false);
  const [msg, setMsg] = React.useState<string>('');

  // --- ДОБАВЛЕНО: расчёт доли пула и эмиссии (ничего не ломаем) ---
  const totalAlloc = (cfg.pools?.reduce((a, b) => a + (b.allocPoint || 0), 0) || 1);
  const rewardPerBlockBig = BigInt(cfg.rewardPerBlock); // общая эмиссия/блок в wei
  const poolPerBlockBig   = (rewardPerBlockBig * BigInt(pool.allocPoint)) / BigInt(totalAlloc);
  const poolPerBlockStr   = formatUnits(poolPerBlockBig, cfg.rewardDecimals);
  const blocksPerDayBig   = BigInt(28800);  const perDayBig         = poolPerBlockBig * blocksPerDayBig;
  const perDayStr         = formatUnits(perDayBig, cfg.rewardDecimals);

  const refresh = React.useCallback(async () => {
    if (!provider || !account) return;
    try {
      const lpAddr = normAddr(pool.lpToken);
      const chefAddr = normAddr(cfg.masterChef);
      if (!lpAddr || !chefAddr) { setMsg('Config error: invalid LP or MasterChef address'); return; }

      const lp   = new Contract(lpAddr,   ERC20_ABI,       provider);
      const chef = new Contract(chefAddr, MASTERCHEF_ABI,  provider);

      const d = await lp.decimals().catch(() => 18);
      setLpDecimals(Number(d));

      const bal = await lp.balanceOf(account);
      setLpBalance(formatUnits(bal, d));

      const userInfo = await chef.userInfo(pool.id, account);
      setStaked(formatUnits(userInfo[0], d));

      const allo = await lp.allowance(account, chefAddr);
      setAllowance(formatUnits(allo, d));

      const pend = await chef.pendingReward(pool.id, account);
      setPending(formatUnits(pend, cfg.rewardDecimals));
    } catch (e: any) {
      setMsg(e?.shortMessage || e?.message || 'Failed to refresh');
    }
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
      const signer   = await provider.getSigner();
      const lpAddr   = normAddr(pool.lpToken)!;
      const chefAddr = normAddr(cfg.masterChef)!;

      const lp = new Contract(lpAddr, ERC20_ABI, signer);
      const tx = await lp.approve(chefAddr, parseUnits('1000000000000', lpDecimals)); // практич.∞
      await tx.wait();
      setMsg('Approved');
      await refresh();
    } catch (e: any) {
      setMsg(e?.shortMessage || e?.message || 'Approve failed');
    } finally { setBusy(false); }
  };

  const deposit = async () => {
    if (!provider || !amount) return;
    setBusy(true); setMsg('');
    try {
      const signer   = await provider.getSigner();
      const chefAddr = normAddr(cfg.masterChef)!;
      const chef = new Contract(chefAddr, MASTERCHEF_ABI, signer);
      const tx = await chef.deposit(pool.id, parseUnits(amount, lpDecimals));
      await tx.wait();
      setAmount(''); setMsg('Staked'); await refresh();
    } catch (e: any) {
      setMsg(e?.shortMessage || e?.message || 'Stake failed');
    } finally { setBusy(false); }
  };

  const withdraw = async () => {
    if (!provider || !amount) return;
    setBusy(true); setMsg('');
    try {
      const signer   = await provider.getSigner();
      const chefAddr = normAddr(cfg.masterChef)!;
      const chef = new Contract(chefAddr, MASTERCHEF_ABI, signer);
      const tx = await chef.withdraw(pool.id, parseUnits(amount, lpDecimals));
      await tx.wait();
      setAmount(''); setMsg('Unstaked'); await refresh();
    } catch (e: any) {
      setMsg(e?.shortMessage || e?.message || 'Unstake failed');
    } finally { setBusy(false); }
  };

  const harvest = async () => {
    if (!provider) return;
    setBusy(true); setMsg('');
    try {
      const signer   = await provider.getSigner();
      const chefAddr = normAddr(cfg.masterChef)!;
      const chef = new Contract(chefAddr, MASTERCHEF_ABI, signer);
      const tx = await chef.deposit(pool.id, 0); // harvest
      await tx.wait();
      setMsg('Harvested'); await refresh();
    } catch (e: any) {
      setMsg(e?.shortMessage || e?.message || 'Harvest failed');
    } finally { setBusy(false); }
  };

  const needApprove = Number(allowance) < Number(amount || '0');

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
      <div className="flex items-center justify-between">
        <h3 className="font-bold">{pool.name}</h3>
        <a href={pool.pairUrl} target="_blank" rel="noreferrer" className="text-xs text-white/70 hover:underline">
          Add Liquidity
        </a>
      </div>

      {/* ДОБАВЛЕНО: понятные метрики по эмиссии пула */}
      <div className="mt-3 text-xs text-white/70">
        Emission: ~{poolPerBlockStr} GAD / block (~{perDayStr} / day) • Share: {pool.allocPoint}/{totalAlloc}
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
          onChange={(e) => setAmount(e.target.value)}
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

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-black/30 rounded-xl p-3 border border-white/10">
      <div className="text-white/60 text-xs">{label}</div>
      <div className="font-bold">{value}</div>
    </div>
  );
}

function btnCls(disabled: boolean, busy: boolean) {
  return clsx('px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15', (disabled || busy) && 'opacity-50 cursor-not-allowed');
}
function btnOutlineCls(disabled: boolean, busy: boolean) {
  return clsx('px-4 py-2 rounded-xl border border-white/20 hover:border-white/40', (disabled || busy) && 'opacity-50 cursor-not-allowed');
}
function btnYellowCls(disabled: boolean, busy: boolean) {
  return clsx('px-4 py-2 rounded-xl bg-[#ffd166] text-[#0b0f17] font-semibold hover:opacity-90', (disabled || busy) && 'opacity-50 cursor-not-allowed');
}
