'use client';

import React from 'react';
import { BrowserProvider, Contract } from 'ethers';
import clsx from 'clsx';

const AIRDROP_ADDR = '0x022cE9320Ea1AB7E03F14D8C0dBD14903A940F79'; // GADAirdropV1
const BSC_CHAIN_ID = 56;

// минимальный ABI под наш контракт
const AIRDROP_ABI = [
  'function baseRoot() view returns (bytes32)',
  'function bonusRoot() view returns (bytes32)',
  'function baseAmount() view returns (uint256)',
  'function bonusAmount() view returns (uint256)',
  'function deadline() view returns (uint256)',
  'function baseClaimed(address) view returns (bool)',
  'function bonusClaimed(address) view returns (bool)',
  'function claimBase(bytes32[] calldata proof)',
  'function claimBonus(bytes32[] calldata proof)',
  'function claimBoth(bytes32[] calldata baseProof, bytes32[] calldata bonusProof)',
];

type ProofResponse = {
  address: string;
  inBase: boolean;
  inBonus: boolean;
  baseProof: string[];   // bytes32[] в hex
  bonusProof: string[];  // bytes32[] в hex
};

function fmt(num: bigint, decimals = 18) {
  const s = num.toString().padStart(decimals + 1, '0');
  const int = s.slice(0, -decimals) || '0';
  const frac = s.slice(-decimals).replace(/0+$/, '');
  return frac ? `${int}.${frac}` : int;
}

// START: 25 Sep 12:00 UTC (month 0-based: Sep=8)
const CLAIM_START_TS = Date.UTC(2025, 8, 25, 12, 0, 0);

function useCountdown(target: number) {
  const [left, setLeft] = React.useState(target - Date.now());
  React.useEffect(() => {
    const id = setInterval(() => setLeft(target - Date.now()), 1000);
    return () => clearInterval(id);
  }, [target]);
  if (left <= 0) return null;
  const sec = Math.floor(left / 1000);
  const d = Math.floor(sec / 86400);
  const h = Math.floor((sec % 86400) / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return `${d}d ${h}h ${m}m ${s}s`;
}

export default function ClaimAirdropPage() {
  const [provider, setProvider] = React.useState<BrowserProvider | null>(null);
  const [account, setAccount] = React.useState<string>('');
  const [chainId, setChainId] = React.useState<number | null>(null);
  const [msg, setMsg] = React.useState<string>('');
  const [loading, setLoading] = React.useState<boolean>(false);

  // из контракта
  const [baseAmount, setBaseAmount] = React.useState<bigint | null>(null);
  const [bonusAmount, setBonusAmount] = React.useState<bigint | null>(null);
  const [deadline, setDeadline] = React.useState<number | null>(null);
  const [baseClaimed, setBaseClaimed] = React.useState<boolean>(false);
  const [bonusClaimed, setBonusClaimed] = React.useState<boolean>(false);

  // eligibility + proofs
  const [eligible, setEligible] = React.useState<ProofResponse | null>(null);

  const countdown = useCountdown(CLAIM_START_TS);
  const claimOpen = !countdown;

  const connect = async () => {
    setMsg('');
    try {
      const eth = (window as any).ethereum;
      if (!eth) return setMsg('MetaMask not found');
      const prov = new BrowserProvider(eth);
      const net = await prov.getNetwork();
      setChainId(Number(net.chainId));
      const accs = await prov.send('eth_requestAccounts', []);
      setProvider(prov);
      setAccount(accs?.[0] || '');
      eth.on?.('accountsChanged', (a: string[]) => setAccount(a?.[0] || ''));
      eth.on?.('chainChanged', () => window.location.reload());
    } catch (e: any) {
      setMsg(e?.message || 'Failed to connect wallet');
    }
  };

  const loadOnchain = React.useCallback(async () => {
    if (!provider || !account) return;
    try {
      const airdrop = new Contract(AIRDROP_ADDR, AIRDROP_ABI, provider);
      const [bA, bB, dl, bc, boc] = await Promise.all([
        airdrop.baseAmount(),
        airdrop.bonusAmount(),
        airdrop.deadline(),
        airdrop.baseClaimed(account),
        airdrop.bonusClaimed(account),
      ]);
      setBaseAmount(BigInt(bA.toString()));
      setBonusAmount(BigInt(bB.toString()));
      setDeadline(Number(dl));
      setBaseClaimed(Boolean(bc));
      setBonusClaimed(Boolean(boc));
    } catch (e: any) {
      setMsg(e?.shortMessage || e?.message || 'Failed to load airdrop info');
    }
  }, [provider, account]);

  const loadProofs = React.useCallback(async () => {
    if (!account) return;
    setMsg('');
    try {
      const r = await fetch(`/api/airdrop-proof?address=${account}`);
      if (!r.ok) {
        setEligible(null);
        setMsg('Not found in airdrop list (make sure you use the same wallet as in the form).');
        return;
      }
      const data: ProofResponse = await r.json();
      setEligible(data);
    } catch (e: any) {
      setMsg(e?.message || 'Failed to load proof');
    }
  }, [account]);

  React.useEffect(() => { loadOnchain(); }, [loadOnchain]);
  React.useEffect(() => { loadProofs(); }, [loadProofs]);

  const claimBase = async () => {
    if (!provider || !eligible) return;
    if (!claimOpen) return setMsg('Claim is not open yet');
    setLoading(true); setMsg('');
    try {
      const signer = await provider.getSigner();
      const airdrop = new Contract(AIRDROP_ADDR, AIRDROP_ABI, signer);
      const tx = await airdrop.claimBase(eligible.baseProof || []);
      await tx.wait();
      setMsg('Claimed base reward ✅');
      await loadOnchain();
    } catch (e: any) {
      setMsg(e?.shortMessage || e?.message || 'Claim failed');
    } finally { setLoading(false); }
  };

  const claimBonus = async () => {
    if (!provider || !eligible) return;
    if (!claimOpen) return setMsg('Claim is not open yet');
    setLoading(true); setMsg('');
    try {
      const signer = await provider.getSigner();
      const airdrop = new Contract(AIRDROP_ADDR, AIRDROP_ABI, signer);
      const tx = await airdrop.claimBonus(eligible.bonusProof || []);
      await tx.wait();
      setMsg('Claimed bonus reward ✅');
      await loadOnchain();
    } catch (e: any) {
      setMsg(e?.shortMessage || e?.message || 'Claim failed');
    } finally { setLoading(false); }
  };

  const claimBoth = async () => {
    if (!provider || !eligible) return;
    if (!claimOpen) return setMsg('Claim is not open yet');
    setLoading(true); setMsg('');
    try {
      const signer = await provider.getSigner();
      const airdrop = new Contract(AIRDROP_ADDR, AIRDROP_ABI, signer);
      const tx = await airdrop.claimBoth(eligible.baseProof || [], eligible.bonusProof || []);
      await tx.wait();
      setMsg('Claimed both rewards ✅');
      await loadOnchain();
    } catch (e: any) {
      setMsg(e?.shortMessage || e?.message || 'Claim failed');
    } finally { setLoading(false); }
  };

  const wrongNet = chainId !== null && chainId !== BSC_CHAIN_ID;
  const canClaimBase = eligible?.inBase && !baseClaimed;
  const canClaimBonus = eligible?.inBonus && !bonusClaimed;
  const canClaimBoth = eligible?.inBase && eligible?.inBonus && !baseClaimed && !bonusClaimed;

  return (
    <main className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-3xl md:text-4xl font-extrabold">Claim Airdrop — Season 1</h1>
        <button onClick={connect} className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15">
          {account ? `${account.slice(0,6)}…${account.slice(-4)}` : 'Connect Wallet'}
        </button>
      </div>

      <div className="mt-4 rounded-2xl p-4 bg-[#ffd166] text-[#0b0f17] border border-yellow-300/40">
        <div className="text-sm">
          <b>Airdrop S1:</b> 15,000 GAD to all eligible + 30,000 GAD bonus to 100 winners.
          Claim opens on <b>25 Sep, 12:00 UTC</b> — window 14 days.
          {' '}Contract:{' '}
          <a className="underline font-semibold" href={`https://bscscan.com/address/${AIRDROP_ADDR}`} target="_blank" rel="noreferrer">
            {AIRDROP_ADDR}
          </a>
          {countdown ? <span className="ml-2">Countdown: <b>{countdown}</b></span> : <span className="ml-2 font-semibold">Claim is OPEN!</span>}
        </div>
      </div>

      <div className="mt-6 rounded-2xl p-4 bg-white/5 border border-white/10">
        <div className="text-sm text-white/80">
          <div>Connected: <span className="font-mono">{account || '—'}</span></div>
          <div>Network: {wrongNet ? <span className="text-red-400">Wrong (switch to BSC)</span> : 'BSC'}</div>
          <div className="mt-2">
            Status: {eligible
              ? <>
                  {eligible.inBase ? <span className="text-green-400">Eligible (base)</span> : <span className="text-red-400">Not in base list</span>}
                  {' • '}
                  {eligible.inBonus ? <span className="text-green-400">Eligible (bonus)</span> : <span className="text-white/60">Not in bonus list</span>}
                </>
              : 'No data yet'}
          </div>
          <div className="mt-2">Already claimed: base <b>{baseClaimed ? 'yes' : 'no'}</b>, bonus <b>{bonusClaimed ? 'yes' : 'no'}</b></div>
          <div className="mt-2">
            Rewards per user:&nbsp;
            {baseAmount !== null && <span>Base ≈ <b>{fmt(baseAmount)} GAD</b></span>}
            {bonusAmount !== null && <span>{' • '}Bonus ≈ <b>{fmt(bonusAmount)} GAD</b></span>}
          </div>
          {deadline && deadline > 0 && <div className="mt-1">Deadline: <b>{new Date(deadline * 1000).toUTCString()}</b></div>}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={claimBase}
            disabled={loading || wrongNet || !claimOpen || !canClaimBase}
            className={clsx('px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15',
              (loading || wrongNet || !claimOpen || !canClaimBase) && 'opacity-50 cursor-not-allowed')}
          >
            Claim Base
          </button>
          <button
            onClick={claimBonus}
            disabled={loading || wrongNet || !claimOpen || !canClaimBonus}
            className={clsx('px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15',
              (loading || wrongNet || !claimOpen || !canClaimBonus) && 'opacity-50 cursor-not-allowed')}
          >
            Claim Bonus
          </button>
          <button
            onClick={claimBoth}
            disabled={loading || wrongNet || !claimOpen || !canClaimBoth}
            className={clsx('px-4 py-2 rounded-xl bg-[#ffd166] text-[#0b0f17] font-semibold hover:opacity-90',
              (loading || wrongNet || !claimOpen || !canClaimBoth) && 'opacity-50 cursor-not-allowed')}
          >
            Claim Both
          </button>
        </div>

        {msg && <div className="mt-3 text-sm">{msg}</div>}
        {wrongNet && <div className="mt-2 text-xs text-red-400">Wrong network: switch to BNB Chain (56).</div>}
      </div>
    </main>
  );
}
