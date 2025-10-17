"use client";

import dynamic from "next/dynamic";

// клиентский импорт
const CollectionClient = dynamic(() => import("./CollectionClient"), { ssr: false });

export default function CollectionPageClient() {
  return <CollectionClient />;
}
