"use client";

import type { Prompt } from "@/types";

type PromptSelectorProps = {
  prompts: Prompt[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

export default function PromptSelector({
  prompts,
  selectedId,
  onSelect,
}: PromptSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {prompts.map((prompt) => {
        const isSelected = selectedId === prompt.id;

        return (
          <button
            key={prompt.id}
            type="button"
            onClick={() => onSelect(prompt.id)}
            className={`rounded-2xl border p-4 text-center text-sm leading-snug transition-colors hover:border-rose-300 hover:bg-rose-50 ${
              isSelected
                ? "border-2 border-rose-400 bg-rose-50 text-rose-700 font-medium"
                : "border-gray-200 bg-white text-gray-600"
            }`}
          >
            {prompt.text}
          </button>
        );
      })}
    </div>
  );
}
