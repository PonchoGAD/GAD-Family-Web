import type { Metadata } from "next";
import ClientOnly from "../components/ClientOnly";
import UploadMintWidget from "../../components/nft/upload/UploadMintWidget";

export const metadata: Metadata = { title: "Upload & Mint" };
export const dynamic = "force-dynamic"; // не пререндерим на сервере

export default function Page() {
  return (
    <ClientOnly>
      <main className="p-6 max-w-3xl mx-auto space-y-6">
        <h1 className="text-2xl font-semibold">Upload & Mint</h1>
        <p className="opacity-70 text-sm">
          Загрузите изображение (с компьютера или телефона), мы сформируем metadata и вызовем <code>mintWithFee</code>.
        </p>
        <UploadMintWidget />
      </main>
    </ClientOnly>
  );
}
