"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import PromptSelector from "@/components/PromptSelector";
import { prompts } from "@/data/prompts";
import { loadState, saveState } from "@/lib/storage";
import type { UserState } from "@/types";

const MAX_ANSWER_LENGTH = 150;

export default function SetupPage() {
  const router = useRouter();
  const [selectedPromptId, setSelectedPromptId] = useState<string | null>(null);
  const [promptAnswer, setPromptAnswer] = useState("");

  useEffect(() => {
    const existingState = loadState();
    if (existingState?.promptId) {
      router.push("/feed");
    }
  }, [router]);

  const canSubmit = useMemo(() => {
    return Boolean(selectedPromptId) && promptAnswer.trim().length > 0;
  }, [selectedPromptId, promptAnswer]);

  const handleSubmit = () => {
    if (!selectedPromptId || promptAnswer.trim().length === 0) {
      return;
    }

    const nextState: UserState = {
      promptId: selectedPromptId,
      promptAnswer: promptAnswer.trim(),
      liked: [],
      passed: [],
      matched: [],
    };

    saveState(nextState);
    router.push("/feed");
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-sm flex-col justify-center bg-rose-50 px-6 py-10">
      <h1 className="text-center text-2xl font-semibold text-gray-900">
        What&apos;s one thing people should know about you?
      </h1>
      <p className="mt-3 text-center text-sm text-gray-500">
        Pick a prompt and write a short answer. This is the first thing people
        will see.
      </p>

      <div className="mt-8">
        <PromptSelector
          prompts={prompts}
          selectedId={selectedPromptId}
          onSelect={setSelectedPromptId}
        />
      </div>

      <div className="mt-6">
        <textarea
          value={promptAnswer}
          onChange={(event) =>
            setPromptAnswer(event.target.value.slice(0, MAX_ANSWER_LENGTH))
          }
          maxLength={MAX_ANSWER_LENGTH}
          placeholder="Write your answer..."
          className="h-28 w-full resize-none rounded-xl border border-gray-200 bg-white p-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-rose-400 focus:ring-2 focus:ring-rose-400"
        />
        <p className="mt-2 text-right text-xs text-gray-400">
          {promptAnswer.length} / {MAX_ANSWER_LENGTH}
        </p>
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!canSubmit}
        className="mt-6 rounded-full px-4 py-3 text-sm font-medium transition disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400 enabled:bg-rose-500 enabled:text-white enabled:hover:bg-rose-600"
      >
        Start Meeting People
      </button>
      <button
        type="button"
        onClick={() => {
          window.localStorage.removeItem("spark_user_state");
          window.location.reload();
        }}
        className="mt-4 block w-full text-center text-xs text-gray-400 underline"
      >
        Start over
      </button>
    </main>
  );
}
