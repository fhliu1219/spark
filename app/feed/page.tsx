"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ProfileCard from "@/components/ProfileCard";
import { profiles } from "@/data/profiles";
import { prompts } from "@/data/prompts";
import { checkForMatch, getRemainingProfiles } from "@/lib/feedLogic";
import { loadState, saveState } from "@/lib/storage";
import type { UserState } from "@/types";

export default function FeedPage() {
  const router = useRouter();
  const [userState, setUserState] = useState<UserState | null>(null);

  useEffect(() => {
    const state = loadState();
    if (!state?.promptId) {
      router.push("/setup");
      return;
    }

    setUserState(state);
  }, [router]);

  const remainingProfiles = useMemo(() => {
    if (!userState) {
      return [];
    }

    return getRemainingProfiles(profiles, userState.liked, userState.passed);
  }, [userState]);

  const currentProfile = remainingProfiles[0];
  const seenCount = userState ? profiles.length - remainingProfiles.length : 0;

  const handleLike = () => {
    if (!userState || !currentProfile) {
      return;
    }

    const newLiked = [...userState.liked, currentProfile.id];
    const matchedId = checkForMatch(newLiked);
    const nextState: UserState = {
      ...userState,
      liked: newLiked,
      matched: matchedId
        ? Array.from(new Set([...userState.matched, matchedId]))
        : userState.matched,
    };

    saveState(nextState);
    setUserState(nextState);

    if (matchedId) {
      router.push(`/match/${matchedId}`);
    }
  };

  const handlePass = () => {
    if (!userState || !currentProfile) {
      return;
    }

    const nextState: UserState = {
      ...userState,
      passed: [...userState.passed, currentProfile.id],
    };

    saveState(nextState);
    setUserState(nextState);
  };

  const handleReset = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("spark_user_state");
    }
    router.push("/setup");
  };

  if (!userState) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-rose-50 px-4 py-8">
        <p className="text-sm text-gray-400">Loading...</p>
      </main>
    );
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-rose-50 px-4 py-8">
      <button
        type="button"
        onClick={handleReset}
        className="absolute right-4 top-4 text-xs text-gray-300"
      >
        ↩ Reset demo
      </button>
      <p className="mb-4 text-xs text-gray-400">
        {seenCount} of {profiles.length} profiles
      </p>

      {currentProfile ? (
        <ProfileCard
          profile={currentProfile}
          prompts={prompts}
          onLike={handleLike}
          onPass={handlePass}
        />
      ) : (
        <div className="mx-auto flex w-full max-w-sm flex-col items-center rounded-3xl bg-white px-6 py-10 text-center shadow-md">
          <p className="text-lg font-semibold text-gray-900">
            You&apos;ve seen everyone for now 👀
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Check back later for new people
          </p>
          <button
            type="button"
            onClick={handleReset}
            className="mt-4 text-sm text-rose-500 transition hover:text-rose-600"
          >
            Back to setup to reset
          </button>
        </div>
      )}
    </main>
  );
}
