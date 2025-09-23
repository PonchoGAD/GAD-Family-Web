'use client';

import React from 'react';
import { BrowserProvider, Contract } from 'ethers';
import clsx from 'clsx';

const AIRDROP_ADDR = '0x022cE9320Ea1AB7E03F14D8C0dBD14903A940F79'; // GADAirdropV1
const BSC_CHAIN_ID = 56;

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
  baseProof: string[];
  bonusProof: string[];
};

function fmt(num: bigint, decimals = 18) {
  const s = num.toString().padStart(decimals + 1, '0');
  const int = s.slice(0, -decimals) || '0';
  const frac = s.slice(-decimals).replace(/0+$/, '');
  return frac ? `${int}.${frac}` : int;
}

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

// --- safe chainId getter
async function getChainIdSafe(eth: any): Promise<number | null> {
  try {
    const hex = await eth.request?.({ method: 'eth_chainId' });
    if (hex) return parseInt(String(hex), 16);
  } catch {}
  try {
    const id = await eth.request?.({ method: 'net_version' });
    if (id) return Number(id);
  } catch {}
  return null;
}

// --- switch network helper
async function switchToBSC(eth: any) {
  try {
    await eth.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0x38' }], // 56 = 0x38
    });
  } catch (switchError: any) {
    // если сеть не добавлена в MetaMask — добавить
    if (switchError.code === 4902) {
      try {
        await eth.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: '0x38',
            chainName: 'BNB Smart Chain',
            nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
            rpcUrls: ['https://bsc-dataseed.binance.org/'],
            blockExplorerUrls: ['https://bscscan.com/'],
          }],
        });
      } catch (addError) {
        console.error(addError);
      }
    } else {
      console.error(switchError);
    }
  }
}

export default function ClaimAirdropPage() {
  const [provider, setProvider] = React.useState<BrowserProvider | null>(null);
  const [account, setAccount] = React.useState<string>('');
  const [chainId, setChainId] = React.useState<number | null>(null);
  const [msg, setMsg] = React.useState<string>('');
  const [loading, setLoading] = React.useState<boolean>(false);

  const [baseAmount, setBaseAmount] = React.useState<bigint | null>(null);
  const [bonusAmount, setBonusAmount] = React.useState<bigint | null>(null);
  const [deadline, setDeadline] = React.useState<number | null>(null);
  const [baseClaimed, setBaseClaimed] = React.useState<boolean>(false);
  const [bonusClaimed, setBonusClaimed] = React.useState<boolean>(false);

  const [eligible, setEligible] = React.useState<ProofResponse | null>(null);

  const countdown = useCountdown(CLAIM_START_TS);
  const claimOpen = !countdown;

  const connect = async () => {
    setMsg('');
    try {
      const eth = (window as any).ethereum;
      if (!eth) { setMsg('MetaMask not found'); return; }
      const prov = new BrowserProvider(eth, 'any');
      const cid = await getChainIdSafe(eth);
      setChainId(cid);
      const accs = await prov.send('eth_requestAccounts', []);
      setProvider(prov);
      setAccount(accs?.[0] || '');
      eth.on?.('accountsChanged', (a: string[]) => setAccount(a?.[0] || ''));
      eth.on?.('chainChanged', async () => {
        const ncid = await getChainIdSafe(eth);
        setChainId(ncid);
        loadOnchainRef.current?.();
        loadProofsRef.current?.();
      });
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

  const loadOnchainRef = React.useRef<(() => void) | null>(null);
  const loadProofsRef = React.useRef<(() => void) | null>(null);
  loadOnchainRef.current = () => { loadOnchain(); };
  loadProofsRef.current = () => { loadProofs(); };

  React.useEffect(() => { loadOnchain(); }, [loadOnchain]);
  React.useEffect(() => { loadProofs(); }, [loadProofs]);

  // === CLAIM FUNCTIONS unchanged ===
  const claimBase = async () => { /* ... как у тебя ... */ };
  const claimBonus = async () => { /* ... как у тебя ... */ };
  const claimBoth = async () => { /* ... как у тебя ... */ };

  const wrongNet = chainId !== null && chainId !== BSC_CHAIN_ID;
  const canClaimBase = eligible?.inBase && !baseClaimed;
  const canClaimBonus = eligible?.inBonus && !bonusClaimed;
  const canClaimBoth = eligible?.inBase && eligible?.inBonus && !baseClaimed && !bonusClaimed;

  return (
    <main className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-3xl md:text-4xl font-extrabold">Claim Airdrop — Season 1</h1>
        <div className="flex gap-2">
          <button onClick={connect} className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15">
            {account ? `${account.slice(0,6)}…${account.slice(-4)}` : 'Connect Wallet'}
          </button>
          {wrongNet && (
            <button
              onClick={() => switchToBSC((window as any).ethereum)}
              className="px-4 py-2 rounded-xl bg-red-500/80 hover:bg-red-500 text-white"
            >
              Switch to BSC
            </button>
          )}
        </div>
      </div>
      {/* --- остальная часть твоего JSX без изменений --- */}
    </main>
  );
}
