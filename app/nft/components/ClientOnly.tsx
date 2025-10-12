"use client";

// импортируем инициализацию модалки как можно выше по дереву клиентских компонентов,
// чтобы createWeb3Modal гарантированно отработал до использования хука
import "../web3modal-init";

import { useEffect, useState } from "react";

export default function ClientOnly({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return <>{children}</>;
}
