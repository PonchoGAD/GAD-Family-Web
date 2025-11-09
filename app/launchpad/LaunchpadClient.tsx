'use client';
import React from 'react';
import {
  BrowserProvider,
  Contract,
  Eip1193Provider,
  formatEther,
  InterfaceAbi,
  parseEther,
} from 'ethers';
import { launchpadAbi } from '../abis/LaunchpadSaleV3';
import { erc20Abi } from '../abis/ERC20';
import { CHAIN_ID, LAUNCHPAD_ADDRESS, USDT_ADDRESS } from '../config/launchpad';

// ---- Types ----
type RequestArgs = { method: string; params?: unknown[] };
type EthereumLike = Eip1193Provider & { request: (args: RequestArgs) => Promise<unknown> };

interface LaunchpadData {
  owner: string;
  pendingOwner: string;
  startTime: bigint;
  endTime: bigint;

  hardCapUsd: bigint;
  minBnbWei: bigint;
  maxBnbWei: bigint;
  minUsdt: bigint;
  maxUsdt: bigint;

  tgeBps: bigint;
  sliceSeconds: bigint;
  slicesCount: bigint;
  liquidityBps: bigint;

  ratesSet: boolean;
  isFinalized: boolean;
  paused: boolean;

  myBnb: bigint;
  myUsdt: bigint;
}

const EMPTY_DATA: LaunchpadData = {
  owner: '',
  pendingOwner: '0x0000000000000000000000000000000000000000',
  startTime: 0n,
  endTime: 0n,

  hardCapUsd: 0n,
  minBnbWei: 0n,
  maxBnbWei: 0n,
  minUsdt: 0n,
  maxUsdt: 0n,

  tgeBps: 0n,
  sliceSeconds: 0n,
  slicesCount: 0n,
  liquidityBps: 0n,

  ratesSet: false,
  isFinalized: false,
  paused: false,

  myBnb: 0n,
  myUsdt: 0n,
};

// ---- Hooks ----
function useProvider() {
  const [provider, setProvider] = React.useState<BrowserProvider | null>(null);
  const [account, setAccount] = React.useState<string>('');

  React.useEffect(() => {
    const w = window as unknown as { ethereum?: EthereumLike };
    if (!w.ethereum) return;

    const p = new BrowserProvider(w.ethereum);
    setProvider(p);

    (async () => {
      const accs = (await w.ethereum.request({ method: 'eth_requestAccounts' })) as string[] | undefined;
      setAccount((accs?.[0] ?? '').toLowerCase());

      const net = await p.getNetwork();
      if (Number(net.chainId) !== CHAIN_ID) {
        try {
          await w.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x38' }], // 56
          });
        } catch {
          /* ignore */
        }
      }
    })();
  }, []);

  return { provider, account };
}

// ---- Utils ----
function toDate(ts?: bigint) {
  if (!ts || ts === 0n) return '-';
  const d = new Date(Number(ts) * 1000);
  return d.toUTCString().replace('GMT', 'UTC');
}

// ---- Component ----
export default function LaunchpadClient() {
  const { provider, account } = useProvider();
  const [data, setData] = React.useState<LaunchpadData>(EMPTY_DATA);
  const [isOwner, setIsOwner] = React.useState(false);
  const [amountBnb, setAmountBnb] = React.useState('0.1');
  const [amountUsdt, setAmountUsdt] = React.useState('100');

  const lp = React.useMemo(() => {
    if (!provider) return null;
    return new Contract(LAUNCHPAD_ADDRESS, launchpadAbi as InterfaceAbi, provider);
  }, [provider]);

  React.useEffect(() => {
    (async () => {
      if (!lp) return;

      const [
        owner, pendingOwner, startTime, endTime,
        hardCapUsd, minBnbWei, maxBnbWei, minUsdt, maxUsdt,
        tgeBps, sliceSeconds, slicesCount, liquidityBps,
        ratesSet, isFinalized, paused,
        myBnb, myUsdt,
      ] = await Promise.all([
        lp.owner() as Promise<string>,
        lp.pendingOwner() as Promise<string>,
        lp.startTime() as Promise<bigint>,
        lp.endTime() as Promise<bigint>,
        lp.hardCapUsd() as Promise<bigint>,
        lp.minBnbWei() as Promise<bigint>,
        lp.maxBnbWei() as Promise<bigint>,
        lp.minUsdt() as Promise<bigint>,
        lp.maxUsdt() as Promise<bigint>,
        lp.tgeBps() as Promise<bigint>,
        lp.sliceSeconds() as Promise<bigint>,
        lp.slicesCount() as Promise<bigint>,
        lp.liquidityBps() as Promise<bigint>,
        lp.ratesSet() as Promise<boolean>,
        lp.isFinalized() as Promise<boolean>,
        lp.paused() as Promise<boolean>,
        account ? (lp.contributedBnbWei(account) as Promise<bigint>) : Promise.resolve(0n),
        account ? (lp.contributedUsdt(account) as Promise<bigint>) : Promise.resolve(0n),
      ]);

      setData({
        owner: String(owner).toLowerCase(),
        pendingOwner,
        startTime, endTime,
        hardCapUsd, minBnbWei, maxBnbWei, minUsdt, maxUsdt,
        tgeBps, sliceSeconds, slicesCount, liquidityBps,
        ratesSet, isFinalized, paused,
        myBnb, myUsdt,
      });

      setIsOwner(
        Boolean(account) &&
          String(owner).toLowerCase() === String(account).toLowerCase(),
      );
    })();
  }, [lp, account]);

  async function withSigner<T>(cb: (c: Contract) => Promise<T>): Promise<T> {
    if (!provider) throw new Error('Wallet not connected');
    const signer = await provider.getSigner();
    const c = new Contract(LAUNCHPAD_ADDRESS, launchpadAbi as InterfaceAbi, signer);
    return cb(c);
  }

  async function buyBNB() {
    await withSigner(async (c) => {
      const tx = await c.buyWithBNB({ value: parseEther(amountBnb) });
      await tx.wait();
      alert('BNB contribution sent');
    });
  }

  async function buyUSDT() {
    if (!provider) return;
    const signer = await provider.getSigner();
    const usdt = new Contract(USDT_ADDRESS, erc20Abi as InterfaceAbi, signer);
    const amt = BigInt(Math.round(Number(amountUsdt) * 1e6)); // USDT 6 decimals

    const ownerAddr = await signer.getAddress();
    const allowance = (await usdt.allowance(ownerAddr, LAUNCHPAD_ADDRESS)) as bigint;
    if (allowance < amt) {
      const tx1 = await usdt.approve(LAUNCHPAD_ADDRESS, amt);
      await tx1.wait();
    }
    const c = new Contract(LAUNCHPAD_ADDRESS, launchpadAbi as InterfaceAbi, signer);
    const tx2 = await c.buyWithUSDT(amt);
    await tx2.wait();
    alert('USDT contribution sent');
  }

  async function claim() {
    await withSigner(async (c) => {
      const tx = await c.claim();
      await tx.wait();
      alert('Claimed');
    });
  }

  // owner only (hidden for others)
  async function setStartRates() {
    // placeholder values — не ставим реальные цены
    const bnbUsd = 0n;    // 1e6
    const gadPerUsd = 0n; // 1e6
    await withSigner(async (c) => {
      const tx = await c.setStartRates(bnbUsd, gadPerUsd);
      await tx.wait();
      alert('Rates set');
    });
  }
  async function pause()    { await withSigner(async (c) => (await c.pause()).wait()); }
  async function unpause()  { await withSigner(async (c) => (await c.unpause()).wait()); }
  async function finalize() { await withSigner(async (c) => (await c.finalize()).wait()); }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 text-gray-200">
      <div className="rounded-2xl bg-[#0F1115] border border-[#23262B] p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">GAD Launchpad</h1>
          <span className="text-xs opacity-60">Contract: {LAUNCHPAD_ADDRESS}</span>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mt-6">
          <Card title="Timeline" items={[
            ['Start', toDate(data.startTime)],
            ['End', toDate(data.endTime)],
            ['Paused', String(data.paused)],
          ]}/>
          <Card title="Caps & Limits" items={[
            ['Hard Cap (USD, 1e6)', String(data.hardCapUsd ?? '-')],
            ['Min BNB', data.minBnbWei ? `${formatEther(data.minBnbWei)} BNB` : '-'],
            ['Max BNB', data.maxBnbWei ? `${formatEther(data.maxBnbWei)} BNB` : '-'],
            ['Min USDT', data.minUsdt ? `${Number(data.minUsdt)/1e6} USDT` : '-'],
            ['Max USDT', data.maxUsdt ? `${Number(data.maxUsdt)/1e6} USDT` : '-'],
          ]}/>
          <Card title="Vesting" items={[
            ['TGE', data.tgeBps ? `${Number(data.tgeBps)/100}%` : '-'],
            ['Slice', data.sliceSeconds ? `${Number(data.sliceSeconds)/86400} days` : '-'],
            ['Count', String(data.slicesCount ?? '-')],
            ['Liquidity', data.liquidityBps ? `${Number(data.liquidityBps)/100}%` : '-'],
          ]}/>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mt-8">
          <div className="rounded-xl bg-[#12151B] border border-[#2A2F36] p-5">
            <h3 className="font-medium mb-3">Contribute with BNB</h3>
            <div className="flex gap-3">
              <input
                value={amountBnb}
                onChange={(e) => setAmountBnb(e.target.value)}
                className="flex-1 bg-[#0E1116] border border-[#2A2F36] rounded-lg px-3 py-2 outline-none"
                placeholder="0.1"
              />
              <button onClick={buyBNB} className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500">
                Contribute
              </button>
            </div>
            <p className="mt-3 text-sm opacity-70">
              Your BNB: {data.myBnb ? `${formatEther(data.myBnb)} BNB` : '0'}
            </p>
          </div>

          <div className="rounded-xl bg-[#12151B] border border-[#2A2F36] p-5">
            <h3 className="font-medium mb-3">Contribute with USDT</h3>
            <div className="flex gap-3">
              <input
                value={amountUsdt}
                onChange={(e) => setAmountUsdt(e.target.value)}
                className="flex-1 bg-[#0E1116] border border-[#2A2F36] rounded-lg px-3 py-2 outline-none"
                placeholder="100"
              />
              <button onClick={buyUSDT} className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500">
                Contribute
              </button>
            </div>
            <p className="mt-3 text-sm opacity-70">
              Your USDT: {data.myUsdt ? `${Number(data.myUsdt)/1e6} USDT` : '0'}
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-xl bg-[#12151B] border border-[#2A2F36] p-5">
          <h3 className="font-medium mb-3">Claim</h3>
          <button onClick={claim} className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500">
            Claim vested GAD
          </button>
        </div>

        {isOwner && (
          <div className="mt-8 rounded-xl bg-[#191E26] border border-[#2F3842] p-5">
            <h3 className="font-medium mb-4">Owner Controls</h3>
            <div className="flex gap-3 flex-wrap">
              <button onClick={setStartRates} className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500">
                Set Start Rates (dry)
              </button>
              <button onClick={pause} className="px-4 py-2 rounded-lg bg-zinc-700 hover:bg-zinc-600">Pause</button>
              <button onClick={unpause} className="px-4 py-2 rounded-lg bg-zinc-700 hover:bg-zinc-600">Unpause</button>
              <button onClick={finalize} className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500">Finalize</button>
            </div>
            <p className="text-xs opacity-60 mt-2">
              Visible only for the owner address. Rates function is a placeholder (0/0) to prevent accidental launch.
            </p>
          </div>
        )}

        <div className="mt-8 text-xs opacity-60">
          <div>Owner: {data.owner}</div>
          <div>Pending owner: {data.pendingOwner}</div>
        </div>
      </div>
    </div>
  );
}

function Card({ title, items }: { title: string; items: [string, string][] }) {
  return (
    <div className="rounded-xl bg-[#12151B] border border-[#2A2F36] p-5">
      <h3 className="font-medium mb-3">{title}</h3>
      <ul className="space-y-1 text-sm">
        {items.map(([k, v]) => (
          <li key={k} className="flex justify-between gap-3">
            <span className="opacity-60">{k}</span>
            <span className="font-mono">{v}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
