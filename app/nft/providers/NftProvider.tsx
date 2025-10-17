// app/nft/providers/NftProvider.tsx
"use client";

// ВАЖНО: раньше тут был WagmiProvider, теперь — тонкий провайдер без зависимостей.
// Чтобы ничего не падало и импорты не переписывать, мы оставляем то же имя экспорта.

import React from "react";

export default function NftProvider({ children }: { children: React.ReactNode }) {
  // Ничего не делаем: просто рендерим детей.
  // Весь функционал подключения кошелька теперь в наших лёгких хуках (ethers).
  return <>{children}</>;
}
