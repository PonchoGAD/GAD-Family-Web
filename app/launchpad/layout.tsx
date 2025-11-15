// app/launchpad/layout.tsx
import React from 'react';
import type { ReactNode } from 'react';
import { Web3Providers } from '../nft/wagmi';
import NftProvider from '../nft/providers/NftProvider';

export default function LaunchpadLayout({ children }: { children: ReactNode }) {
  // Важно: здесь НЕТ <html> и <body>, они уже определены в app/layout.tsx
  return (
    <Web3Providers>
      <NftProvider>{children}</NftProvider>
    </Web3Providers>
  );
}
