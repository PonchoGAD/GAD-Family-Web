import type { Metadata } from "next";
import ClientOnly from "../components/ClientOnly";
import SellClient from "./SellClient";

export const metadata: Metadata = { title: "Sell NFT" };
export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <ClientOnly>
      <SellClient />
    </ClientOnly>
  );
}
