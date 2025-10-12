// app/nft/activity/page.tsx
import ActivityClient from "./ActivityClient";

// ВАЖНО: это серверный файл (без "use client")
// Отключаем пререндер/кэш, чтобы на сервере ничего клиентского не выполнялось
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "default-no-store";

export default function ActivityPage() {
  return <ActivityClient />;
}
