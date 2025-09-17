'use client';

export default function SwitchNetworkButton() {
  const switchToBsc = async () => {
    const ethereum = (window as any).ethereum;
    if (!ethereum) return alert('MetaMask not found');

    try {
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x38' }], // 56
      });
    } catch (switchError: any) {
      // Если сеть не добавлена — добавим
      if (switchError?.code === 4902) {
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
        alert(switchError?.message || 'Failed to switch network');
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
