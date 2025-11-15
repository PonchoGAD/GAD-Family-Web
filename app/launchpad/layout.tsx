'use client';

import React from 'react';
import NftProvider from '../nft/providers/NftProvider';

export default function LaunchpadLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <NftProvider>{children}</NftProvider>;
}
