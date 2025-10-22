'use client';
import dynamic from 'next/dynamic';

const WalletApp = dynamic(() => import('./App'), { ssr: false });

export default function WalletEntry() {
  return <WalletApp />;
}
