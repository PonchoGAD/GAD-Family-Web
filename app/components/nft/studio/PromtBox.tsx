"use client";
import { useState } from "react";

export default function PromptBox({ onSubmit }: { onSubmit: (p: string) => void }) {
  const [prompt, setPrompt] = useState("");
  return (
    <div className="flex gap-2">
      <input
        className="border p-2 rounded w-full"
        placeholder="Describe your NFT artwork…"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />
      <button className="border px-3 py-2 rounded" onClick={() => onSubmit(prompt)}>
        Generate
      </button>
    </div>
  );
}
