// app/nft/activity/ActivityClient.tsx
"use client";

import { useEffect, useState } from "react";

// здесь ваша прежняя логика страницы /nft/activity, только без export const revalidate/…
// и без импортов из "next/cache". Всё, что работает с браузером (indexedDB, web3modal),
// оставляем здесь — это клиент.
export default function ActivityClient() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // пример: лениво инициализировать web3modal/индекседДБ только на клиенте
    setReady(true);
  }, []);

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Activity</h1>
      {!ready ? <div>Loading…</div> : <div>/* your activity UI here */</div>}
    </main>
  );
}
