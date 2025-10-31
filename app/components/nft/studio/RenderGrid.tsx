"use client";

import Image from "next/image";

export default function RenderGrid({
  images,
  onSelectAction,
  selected,
}: {
  images: string[];
  /** ✅ имя оканчивается на Action — соответствует TS71007 */
  onSelectAction: (url: string) => void;
  selected?: string;
}) {
  return (
    <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
      {images.map((url, i) => (
        <button
          key={i}
          onClick={() => onSelectAction(url)}
          className={`relative border rounded overflow-hidden ${
            selected === url
              ? "border-mint-400 shadow-[0_0_10px_#80FFD3]"
              : "border-gray-700"
          }`}
          title="Use this image"
        >
          <Image
            src={url}
            alt="AI render"
            width={400}
            height={400}
            className="object-cover w-full h-full"
            unoptimized
            priority={i < 3}
          />
        </button>
      ))}
    </div>
  );
}
