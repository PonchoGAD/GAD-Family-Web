import { NextRequest, NextResponse } from "next/server";
import { ethers, Contract, Interface, type LogDescription } from "ethers";
import { nft721Abi } from "../../../lib/nft/abis/nft721";
import { ADDR } from "../../../lib/nft/config";

/** Ответ Pinata для pinFile/pinJSON */
type PinataPinResp = { IpfsHash: string; PinSize?: number; Timestamp?: string };

/** Метаданные NFT */
type NftMetadata = {
  name?: string;
  description?: string;
  image: string;
  attributes?: Array<Record<string, unknown>>;
};

// --- Pinata helpers ---
async function pinataUploadImageFromUrl(url: string): Promise<string> {
  const jwt = process.env.PINATA_JWT!;
  if (!jwt) throw new Error("PINATA_JWT is missing");

  const res = await fetch(url);
  if (!res.ok) throw new Error(`fetch image failed: ${res.status}`);
  const blob = await res.blob();

  const form = new FormData();
  form.append("file", blob, "image.png");
  form.append("pinataMetadata", JSON.stringify({ name: "GAD NFT Image" }));
  form.append("pinataOptions", JSON.stringify({ cidVersion: 1 }));

  const up = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST",
    headers: { Authorization: `Bearer ${jwt}` },
    body: form,
    cache: "no-store",
  });

  const data = (await up.json()) as PinataPinResp;
  if (!up.ok) throw new Error(`pinFileToIPFS: ${JSON.stringify(data)}`);
  return `ipfs://${data.IpfsHash}`;
}

async function pinataUploadJSON(json: NftMetadata, name = "GAD NFT Metadata"): Promise<string> {
  const jwt = process.env.PINATA_JWT!;
  if (!jwt) throw new Error("PINATA_JWT is missing");

  const up = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${jwt}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      pinataMetadata: { name },
      pinataContent: json,
      pinataOptions: { cidVersion: 1 },
    }),
    cache: "no-store",
  });

  const data = (await up.json()) as PinataPinResp;
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
    const body = (await req.json()) as {
      to?: string;
      name?: string;
      description?: string;
      imageUrl?: string;
      attributes?: Array<Record<string, unknown>>;
    };

    const { to, name, description, imageUrl, attributes } = body;

    if (!to || typeof to !== "string") {
      return NextResponse.json({ error: "to is required" }, { status: 400 });
    }
    if (!imageUrl || typeof imageUrl !== "string") {
      return NextResponse.json({ error: "imageUrl is required" }, { status: 400 });
    }

    // 1) upload image to IPFS
    const imageCidUri = await pinataUploadImageFromUrl(imageUrl);

    // 2) metadata → IPFS
    const metadata: NftMetadata = {
      name: name || "GAD NFT",
      description: description || "Minted via GAD Family AI Studio",
      image: imageCidUri,
      attributes: Array.isArray(attributes) ? attributes : [],
    };
    const tokenUri = await pinataUploadJSON(metadata, name || "GAD NFT Metadata");

    // 3) mintWithFee
    const wallet = getServerWallet();
    const nft = new Contract(ADDR.NFT721, nft721Abi, wallet);

    const mintFeeWei: bigint = await nft.mintFeeWei();
    const tx = await nft.mintWithFee(to, tokenUri, { value: mintFeeWei });
    const receipt = await tx.wait();

    // try parse tokenId from Transfer
    let tokenId: string | null = null;
    const iface = new Interface(nft721Abi);
    for (const log of receipt.logs) {
      try {
        const parsed: LogDescription = iface.parseLog(log);
        if (parsed?.name === "Transfer") {
          const v = parsed.args?.tokenId;
          tokenId = typeof v === "bigint" ? v.toString() : String(v ?? "");
          if (tokenId) break;
        }
      } catch {
        // ignore
      }
    }

    return NextResponse.json({
      ok: true,
      txHash: receipt.hash,
      tokenId,
      tokenUri,
      imageCidUri,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[MINT/POST] error:", msg);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
