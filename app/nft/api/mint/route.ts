import { NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";
import { nft721Abi } from "../../../lib/nft/abis/nft721";
import { ADDR } from "../../../lib/nft/config";

// --- Pinata helpers ---
async function pinataUploadImageFromUrl(url: string) {
  const jwt = process.env.PINATA_JWT!;
  if (!jwt) throw new Error("PINATA_JWT is missing");

  // Скачиваем файл
  const res = await fetch(url);
  if (!res.ok) throw new Error(`fetch image failed: ${res.status}`);
  const blob = await res.blob();

  const form = new FormData();
  form.append("file", blob, "image.png");
  const meta = JSON.stringify({ name: "GAD NFT Image" });
  form.append("pinataMetadata", meta);
  const opts = JSON.stringify({ cidVersion: 1 });
  form.append("pinataOptions", opts);

  const up = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${jwt}`,
    },
    body: form,
    cache: "no-store",
  });
  const data = await up.json();
  if (!up.ok) throw new Error(`pinFileToIPFS: ${JSON.stringify(data)}`);
  return `ipfs://${data.IpfsHash}`;
}

async function pinataUploadJSON(json: any, name = "GAD NFT Metadata") {
  const jwt = process.env.PINATA_JWT!;
  if (!jwt) throw new Error("PINATA_JWT is missing");

  const up = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${jwt}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      pinataMetadata: { name },
      pinataContent: json,
      pinataOptions: { cidVersion: 1 },
    }),
    cache: "no-store",
  });

  const data = await up.json();
  if (!up.ok) throw new Error(`pinJSONToIPFS: ${JSON.stringify(data)}`);
  return `ipfs://${data.IpfsHash}`;
}

// --- get server wallet ---
function getServerWallet() {
  const rpc = process.env.BSC_RPC_URL || process.env.NEXT_PUBLIC_RPC_URL!;
  const pk = process.env.MINTER_PRIVATE_KEY!;
  if (!pk) throw new Error("MINTER_PRIVATE_KEY is missing");
  const provider = new ethers.JsonRpcProvider(rpc, 56);
  return new ethers.Wallet(pk, provider);
}

export async function POST(req: NextRequest) {
  try {
    const { to, name, description, imageUrl, attributes } = await req.json();

    if (!to || typeof to !== "string") {
      return NextResponse.json({ error: "to is required" }, { status: 400 });
    }
    if (!imageUrl || typeof imageUrl !== "string") {
      return NextResponse.json({ error: "imageUrl is required" }, { status: 400 });
    }

    // 1) upload image to IPFS
    const imageCidUri = await pinataUploadImageFromUrl(imageUrl);

    // 2) create & upload metadata
    const metadata = {
      name: name || "GAD NFT",
      description: description || "Minted via GAD Family AI Studio",
      image: imageCidUri,
      attributes: Array.isArray(attributes) ? attributes : [],
    };
    const tokenUri = await pinataUploadJSON(metadata, name || "GAD NFT Metadata");

    // 3) call NFT721.mintWithFee(to, tokenURI) with value = mintFeeWei
    const wallet = getServerWallet();
    const nft = new ethers.Contract(ADDR.NFT721, nft721Abi, wallet);

    // берём актуальный mintFeeWei из контракта
    const mintFeeWei: bigint = await nft.mintFeeWei();
    const tx = await nft.mintWithFee(to, tokenUri, { value: mintFeeWei });
    const receipt = await tx.wait();

    // попытаемся вытащить tokenId из события Transfer
    let tokenId: string | null = null;
    for (const log of receipt.logs) {
      try {
        const parsed = nft.interface.parseLog(log);
        if (parsed?.name === "Transfer") {
          tokenId = (parsed.args?.tokenId ?? "").toString();
          break;
        }
      } catch { /* ignore parse fails */ }
    }

    return NextResponse.json({
      ok: true,
      txHash: receipt.hash,
      tokenId,
      tokenUri,
      imageCidUri,
    });
  } catch (e: any) {
    console.error("[MINT/POST] error:", e?.message || e);
    return NextResponse.json({ ok: false, error: e?.message || "mint error" }, { status: 500 });
  }
}
