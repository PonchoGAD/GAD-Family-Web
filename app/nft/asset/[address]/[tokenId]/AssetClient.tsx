"use client";

import React from "react";

type Props = {
  addressProp: string;
  tokenIdProp: string;
};

export default function AssetClient({ addressProp, tokenIdProp }: Props) {
  // тут твой UI/логика (wagmi, эффекты, т.д.)
  return (
    <section className="p-6">
      <h1 className="text-xl font-bold">NFT Asset</h1>
      <p className="text-white/70 mt-2">Address: {addressProp}</p>
      <p className="text-white/70">Token ID: {tokenIdProp}</p>
    </section>
  );
}
