'use client';

import React from 'react';
import { JsonRpcProvider, Contract, parseEther, formatEther } from 'ethers';
import { launchpadAbi } from '../abis/LaunchpadSaleV3';
import { erc20Abi } from '../abis/ERC20';
import { LAUNCHPAD_ADDRESS, USDT_ADDRESS } from '../config/launchpad';
import { useWallet } from '../nft/hooks/useWallet';
import WalletConnectButton from '../components/WalletConnectButton';

type LaunchpadState = {
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
};

const ZERO: bigint = 0n;

// read-only RPC provider
const RPC_URL =
  process.env.NEXT_PUBLIC_BSC_RPC ?? 'https://bsc-dataseed.binance.org';

const readProvider = new JsonRpcProvider(RPC_URL);

function toDate(ts?: bigint) {
  if (!ts || ts === 0n) return '-';
  const d = new Date(Number(ts) * 1000);
  return d.toUTCString().replace('GMT', 'UTC');
}

export default function LaunchpadClient() {
  // общий хук кошелька из NFT-модуля
  const { signer, account } = useWallet();

  const [data, setData] = React.useState<LaunchpadState | null>(null);
  const [isOwner, setIsOwner] = React.useState(false);
  const [amountBnb, setAmountBnb] = React.useState('0.1');
  const [amountUsdt, setAmountUsdt] = React.useState('10');
  const [loading, setLoading] = React.useState(false);

  // контракт только для чтения
  const lpRead = React.useMemo(
    () => new Contract(LAUNCHPAD_ADDRESS, launchpadAbi, readProvider),
    [],
  );

  // =========================
  // Загрузка данных
  // =========================
  const refresh = React.useCallback(async () => {
    try {
      const [
        owner,
        pendingOwner,
        startTime,
        endTime,
        hardCapUsd,
        minBnbWei,
        maxBnbWei,
        minUsdt,
        maxUsdt,
        tgeBps,
        sliceSeconds,
        slicesCount,
        liquidityBps,
        ratesSet,
        isFinalized,
        paused,
        myBnb,
        myUsdt,
      ] = await Promise.all([
        lpRead.owner(),
        lpRead.pendingOwner(),
        lpRead.startTime(),
        lpRead.endTime(),
        lpRead.hardCapUsd(),
        lpRead.minBnbWei(),
        lpRead.maxBnbWei(),
        lpRead.minUsdt(),
        lpRead.maxUsdt(),
        lpRead.tgeBps(),
        lpRead.sliceSeconds(),
        lpRead.slicesCount(),
        lpRead.liquidityBps(),
        lpRead.ratesSet(),
        lpRead.isFinalized(),
        lpRead.paused(),
        account ? lpRead.contributedBnbWei(account) : Promise.resolve(ZERO),
        account ? lpRead.contributedUsdt(account) : Promise.resolve(ZERO),
      ]);

      const lowerOwner = String(owner).toLowerCase();
      const lowerAcc = (account ?? '').toLowerCase();

      setData({
        owner: lowerOwner,
        pendingOwner,
        startTime,
        endTime,
        hardCapUsd,
        minBnbWei,
        maxBnbWei,
        minUsdt,
        maxUsdt,
        tgeBps,
        sliceSeconds,
        slicesCount,
        liquidityBps,
        ratesSet,
        isFinalized,
        paused,
        myBnb,
        myUsdt,
      });
      setIsOwner(!!lowerAcc && lowerAcc === lowerOwner);
    } catch (e) {
      console.error('Launchpad read error:', e);
    }
  }, [lpRead, account]);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  // =========================
  // helper с signer
  // =========================
  async function withSigner<T>(cb: (c: Contract) => Promise<T>): Promise<T> {
    if (!signer) {
      throw new Error('Wallet not connected');
    }
    const c = new Contract(LAUNCHPAD_ADDRESS, launchpadAbi, signer);
    return cb(c);
  }

  // =========================
  // Actions
  // =========================
  async function buyBNB() {
    if (!account) {
      alert('Connect wallet first');
      return;
    }

    try {
      setLoading(true);
      await withSigner(async (c) => {
        const tx = await c.buyWithBNB({ value: parseEther(amountBnb) });
        await tx.wait();
        return;
      });
      await refresh();
      alert('BNB contribution sent');
    } catch (e) {
      console.error(e);
      alert('BNB contribution failed. Check console/logs.');
    } finally {
      setLoading(false);
    }
  }

  async function buyUSDT() {
    if (!signer || !account) {
      alert('Connect wallet first');
      return;
    }

    try {
      setLoading(true);

      const usdt = new Contract(USDT_ADDRESS, erc20Abi, signer);
      const amt = BigInt(Math.round(Number(amountUsdt) * 1e6)); // USDT 6 decimals

      const allowance: bigint = await usdt.allowance(account, LAUNCHPAD_ADDRESS);
      if (allowance < amt) {
        const tx1 = await usdt.approve(LAUNCHPAD_ADDRESS, amt);
        await tx1.wait();
      }

      const c = new Contract(LAUNCHPAD_ADDRESS, launchpadAbi, signer);
      const tx2 = await c.buyWithUSDT(amt);
      await tx2.wait();

      await refresh();
      alert('USDT contribution sent');
    } catch (e) {
      console.error(e);
      alert('USDT contribution failed. Check console/logs.');
    } finally {
      setLoading(false);
    }
  }

  async function claim() {
    if (!account) {
      alert('Connect wallet first');
      return;
    }

    try {
      setLoading(true);
      await withSigner(async (c) => {
        const tx = await c.claim();
        await tx.wait();
        return;
      });
      await refresh();
      alert('Claimed');
    } catch (e) {
      console.error(e);
      alert('Claim failed. Check console/logs.');
    } finally {
      setLoading(false);
    }
  }

  // Owner only
  async function setStartRates() {
    try {
      setLoading(true);
      const bnbUsd = 933660000n; // $933.66 * 1e6
      const gadPerUsd = 100000000n; // 100 000 GAD (как договаривались)
      await withSigner(async (c) => {
        const tx = await c.setStartRates(bnbUsd, gadPerUsd);
        await tx.wait();
        return;
      });
      await refresh();
      alert('Rates set');
    } catch (e) {
      console.error(e);
      alert('setStartRates failed. Check console/logs.');
    } finally {
      setLoading(false);
    }
  }

  async function pause() {
    try {
      setLoading(true);
      await withSigner(async (c) => {
        const tx = await c.pause();
        await tx.wait();
        return;
      });
      await refresh();
    } finally {
      setLoading(false);
    }
  }

  async function unpause() {
    try {
      setLoading(true);
      await withSigner(async (c) => {
        const tx = await c.unpause();
        await tx.wait();
        return;
      });
      await refresh();
    } finally {
      setLoading(false);
    }
  }

  async function finalize() {
    try {
      setLoading(true);
      await withSigner(async (c) => {
        const tx = await c.finalize();
        await tx.wait();
        return;
      });
      await refresh();
    } finally {
      setLoading(false);
    }
  }

  const d = data;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 text-gray-200">
      <div className="rounded-2xl bg-[#0F1115] border border-[#23262B] p-6 shadow-xl">
        {/* header + connect button */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">GAD Launchpad</h1>
            <span className="text-xs opacity-60 break-all">
              Contract: {LAUNCHPAD_ADDRESS}
            </span>
          </div>

          {/* используем общий, уже рабочий WalletConnectButton */}
          <div className="flex flex-col items-end gap-1">
            {account && (
              <div className="text-xs opacity-70 break-all">{account}</div>
            )}
            <WalletConnectButton />
          </div>
        </div>

        {/* INFO CARDS */}
        <div className="grid md:grid-cols-3 gap-6 mt-6">
          <Card
            title="Timeline"
            items={[
              ['Start', d ? toDate(d.startTime) : '-'],
              ['End', d ? toDate(d.endTime) : '-'],
              ['Paused', d ? String(d.paused) : '-'],
            ]}
          />
          <Card
            title="Caps & Limits"
            items={[
              ['Hard Cap (USD, 1e6)', d ? String(d.hardCapUsd) : '-'],
              [
                'Min BNB',
                d && d.minBnbWei !== ZERO
                  ? `${formatEther(d.minBnbWei)} BNB`
                  : '-',
              ],
              [
                'Max BNB',
                d && d.maxBnbWei !== ZERO
                  ? `${formatEther(d.maxBnbWei)} BNB`
                  : '-',
              ],
              [
                'Min USDT',
                d && d.minUsdt !== ZERO ? `${Number(d.minUsdt) / 1e6} USDT` : '-',
              ],
              [
                'Max USDT',
                d && d.maxUsdt !== ZERO ? `${Number(d.maxUsdt) / 1e6} USDT` : '-',
              ],
            ]}
          />
          <Card
            title="Vesting"
            items={[
              [
                'TGE',
                d && d.tgeBps !== ZERO ? `${Number(d.tgeBps) / 100}%` : '-',
              ],
              [
                'Slice',
                d && d.sliceSeconds !== ZERO
                  ? `${Number(d.sliceSeconds) / 86400} days`
                  : '-',
              ],
              ['Count', d ? String(d.slicesCount) : '-'],
              [
                'Liquidity',
                d && d.liquidityBps !== ZERO
                  ? `${Number(d.liquidityBps) / 100}%`
                  : '-',
              ],
            ]}
          />
        </div>

        {/* CONTRIBUTIONS */}
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
              <button
                onClick={buyBNB}
                disabled={loading || !account}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40"
              >
                Contribute
              </button>
            </div>
            <p className="mt-3 text-sm opacity-70">
              Your BNB:{' '}
              {d && d.myBnb !== ZERO ? `${formatEther(d.myBnb)} BNB` : '0'}
            </p>
          </div>

          <div className="rounded-xl bg-[#12151B] border border-[#2A2F36] p-5">
            <h3 className="font-medium mb-3">Contribute with USDT</h3>
            <div className="flex gap-3">
              <input
                value={amountUsdt}
                onChange={(e) => setAmountUsdt(e.target.value)}
                className="flex-1 bg-[#0E1116] border border-[#2A2F36] rounded-lg px-3 py-2 outline-none"
                placeholder="10"
              />
              <button
                onClick={buyUSDT}
                disabled={loading || !account}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40"
              >
                Contribute
              </button>
            </div>
            <p className="mt-3 text-sm opacity-70">
              Your USDT:{' '}
              {d && d.myUsdt !== ZERO ? `${Number(d.myUsdt) / 1e6} USDT` : '0'}
            </p>
          </div>
        </div>

        {/* CLAIM */}
        <div className="mt-8 rounded-xl bg-[#12151B] border border-[#2A2F36] p-5">
          <h3 className="font-medium mb-3">Claim</h3>
          <button
            onClick={claim}
            disabled={loading || !account}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40"
          >
            Claim vested GAD
          </button>
        </div>

        {/* OWNER CONTROLS */}
        {isOwner && (
          <div className="mt-8 rounded-xl bg-[#191E26] border border-[#2F3842] p-5">
            <h3 className="font-medium mb-4">Owner Controls</h3>
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={setStartRates}
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 disabled:opacity-40"
              >
                Set Start Rates
              </button>
              <button
                onClick={pause}
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 disabled:opacity-40"
              >
                Pause
              </button>
              <button
                onClick={unpause}
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 disabled:opacity-40"
              >
                Unpause
              </button>
              <button
                onClick={finalize}
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 disabled:opacity-40"
              >
                Finalize
              </button>
            </div>
            <p className="text-xs opacity-60 mt-2">
              Owner actions available only for the Safe owner address.
            </p>
          </div>
        )}

        <div className="mt-8 text-xs opacity-60 space-y-1 break-all">
          <div>Owner: {d?.owner ?? '-'}</div>
          <div>Pending owner: {d?.pendingOwner ?? '-'}</div>
          {!account && (
            <div className="text-amber-400">
              Connect your wallet above to participate in the launchpad.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Card(props: { title: string; items: [string, string][] }) {
  const { title, items } = props;
  return (
    <div className="rounded-xl bg-[#12151B] border border-[#2A2F36] p-5">
      <h3 className="font-medium mb-3">{title}</h3>
      <ul className="space-y-1 text-sm">
        {items.map(([k, v]) => (
          <li key={k} className="flex justify-between gap-3">
            <span className="opacity-60">{k}</span>
            <span className="font-mono text-right">{v}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
