// app/nft/history/page.tsx
import HistoryClient from "./HistoryClient";

// отключаем SSR/кэш, чтобы сервер не выполнял клиентские хуки
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "default-no-store";

export default function HistoryPage() {
  return <HistoryClient />;
}
