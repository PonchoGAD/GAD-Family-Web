import type { Metadata } from "next";
import ClientOnly from "../components/ClientOnly";
import StudioClient from "./StudioClient"; // если у тебя логика в отдельном клиентском компоненте

export const metadata: Metadata = { title: "AI Studio — Mint" };
export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <ClientOnly>
      <StudioClient />
    </ClientOnly>
  );
}
