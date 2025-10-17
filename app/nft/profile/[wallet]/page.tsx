"use client";

import dynamic from "next/dynamic";

// Загружаем компонент без SSR (чтобы избежать ошибок indexedDB)
const ProfileClient = dynamic(() => import("./ProfileClient"), { ssr: false });

export default function Page() {
  return <ProfileClient />;
}
