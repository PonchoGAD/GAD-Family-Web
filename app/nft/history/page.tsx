import type { Metadata } from "next";
import ClientOnly from "../components/ClientOnly";
import HistoryClient from "./HistoryClient";

export const metadata: Metadata = { title: "NFT History" };
export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <ClientOnly>
      <HistoryClient />
    </ClientOnly>
  );
}
