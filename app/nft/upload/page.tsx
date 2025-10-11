// app/nft/upload/page.tsx
"use client";

import UploadMintWidget from "../../components/nft/upload/UploadMintWidget";

export default function UploadMintPage() {
  return (
    <main className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">Upload & Mint</h1>
      <p className="opacity-70 text-sm">
        Upload an image from your computer or phone, we’ll generate metadata and call <code>mintWithFee</code>.
      </p>
      <UploadMintWidget />
    </main>
  );
}
