'use client';

type EIP1193 = {
  request(args: { method: string; params?: unknown[] | Record<string, unknown> }): Promise<unknown>;
};

function getEth(): EIP1193 | undefined {
  return (window as unknown as { ethereum?: EIP1193 }).ethereum;
}

export default function SwitchNetworkButton() {
  const switchToBsc = async () => {
    const ethereum = getEth();
    if (!ethereum) return alert('MetaMask not found');

    try {
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x38' }], // 56
      });
    } catch (switchError: unknown) {
      const e = switchError as { code?: number; message?: string };
      // Если сеть не добавлена — добавим
      if (e?.code === 4902) {
        await ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: '0x38',
            chainName: 'BNB Smart Chain',
            nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
            rpcUrls: ['https://bsc-dataseed.binance.org/'],
            blockExplorerUrls: ['https://bscscan.com']
          }]
        });
      } else {
        alert(e?.message || 'Failed to switch network');
      }
    }
  };

  return (
    <button
      onClick={switchToBsc}
      className="px-4 py-2 rounded-xl border border-white/20 hover:border-white/40"
    >
      Switch to BNB Chain
    </button>
  );
}
