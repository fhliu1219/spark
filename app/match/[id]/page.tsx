"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { profiles } from "@/data/profiles";
import { prompts } from "@/data/prompts";
import { loadState } from "@/lib/storage";
import type { UserState } from "@/types";

export default function MatchPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [userState, setUserState] = useState<UserState | null>(null);

  useEffect(() => {
    const state = loadState();
    if (!state) {
      router.push("/setup");
      return;
    }

    setUserState(state);
  }, [router]);

  const matchedProfile = useMemo(() => {
    return profiles.find((profile) => profile.id === params.id) ?? null;
  }, [params.id]);

  const userPromptText = useMemo(() => {
    if (!userState) {
      return "";
    }

    return prompts.find((prompt) => prompt.id === userState.promptId)?.text ?? "";
  }, [userState]);

  const matchedPromptText = useMemo(() => {
    if (!matchedProfile) {
      return "";
    }

    return prompts.find((prompt) => prompt.id === matchedProfile.promptId)?.text ?? "";
  }, [matchedProfile]);

  if (!userState || !matchedProfile) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white px-6 py-10">
        <p className="text-sm text-gray-400">Loading...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-sm bg-white px-6 py-10">
      <div className="text-center text-4xl text-rose-500">❤️</div>
      <h1 className="mt-2 text-center text-2xl font-semibold text-gray-900">
        It&apos;s a Match! ✨
      </h1>
      <p className="mb-6 mt-2 text-center text-sm text-gray-500">
        You both liked each other. Here&apos;s what you have to work with:
      </p>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-rose-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-rose-400">
            You said:
          </p>
          <p className="mb-1 mt-1 text-xs text-gray-400">{userPromptText}</p>
          <p className="text-sm font-medium text-gray-800">{userState.promptAnswer}</p>
        </div>

        <div className="rounded-2xl bg-rose-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-rose-400">
            They said:
          </p>
          <p className="mb-1 mt-1 text-xs text-gray-400">{matchedPromptText}</p>
          <p className="text-sm font-medium text-gray-800">
            {matchedProfile.promptAnswer}
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-2xl bg-gray-50 p-4">
        <p className="mb-1 text-xs uppercase tracking-wide text-gray-400">
          💬 Try this opener:
        </p>
        <p className="text-sm italic text-gray-700">{matchedProfile.suggestedOpener}</p>
      </div>

      <div className="mt-8 flex flex-col gap-3">
        <button
          type="button"
          title="Messaging coming soon"
          disabled
          className="w-full cursor-not-allowed rounded-full bg-rose-500 py-3 font-medium text-white opacity-50"
        >
          Send First Message
        </button>
        <button
          type="button"
          onClick={() => router.push("/feed")}
          className="w-full rounded-full border border-gray-200 py-3 text-gray-600"
        >
          Keep Browsing
        </button>
      </div>
    </main>
  );
}
