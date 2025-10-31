"use client";

import { useState } from "react";

export default function PromptBox({
  onGenerateAction,
  disabled,
}: {
  /** ✅ имя оканчивается на Action — соответствует TS71007 */
  onGenerateAction: (prompt: string) => void;
  disabled?: boolean;
}) {
  const [text, setText] = useState("");

  const submit = () => {
    const v = text.trim();
    if (!v) return;
    onGenerateAction(v);
  };

  return (
    <div className="border rounded p-3 bg-[#0E0E12]/70 text-white">
      <div className="font-semibold mb-2">AI Image Generator</div>
      <textarea
        className="w-full bg-transparent border rounded p-2 text-sm"
        rows={3}
        placeholder="Describe your NFT idea (e.g. ‘golden guardian under aurora sky’)"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button
        onClick={submit}
        disabled={disabled}
        className="mt-2 border border-mint-400 text-mint-300 rounded px-4 py-2 hover:bg-mint-400 hover:text-black transition"
      >
        {disabled ? "Generating…" : "Generate Image"}
      </button>
    </div>
  );
}
