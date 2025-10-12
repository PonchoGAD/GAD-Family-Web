import type { Metadata } from "next";
import ClientOnly from "../components/ClientOnly";
import AiMintClient from "./AiMintClient";

export const metadata: Metadata = { title: "AI Mint" };
export const dynamic = "force-dynamic"; // не пререндерим

export default function Page() {
  return (
    <ClientOnly>
      <AiMintClient />
    </ClientOnly>
  );
}
