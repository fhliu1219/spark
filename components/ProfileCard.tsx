"use client";

import type { Profile, Prompt } from "@/types";

type ProfileCardProps = {
  profile: Profile;
  prompts: Prompt[];
  onLike: () => void;
  onPass: () => void;
};

export default function ProfileCard({
  profile,
  prompts,
  onLike,
  onPass,
}: ProfileCardProps) {
  const promptText =
    prompts.find((prompt) => prompt.id === profile.promptId)?.text ?? "Prompt";

  return (
    <div className="mx-auto w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-md">
      <div className="relative aspect-[4/5] w-full">
        <img
          src={profile.photo}
          alt={`${profile.name}, ${profile.age}`}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent p-5">
          <h2 className="text-xl font-semibold text-gray-100">
            {profile.name}, {profile.age}
          </h2>
        </div>
      </div>

      <div className="space-y-4 border-t border-rose-100 px-5 pb-2 pt-4">
        <p className="text-xs text-rose-400">{promptText}</p>
        <p className="text-base font-medium text-gray-800">{profile.promptAnswer}</p>

        <div className="flex items-center justify-center gap-4 pt-1">
          <button
            type="button"
            onClick={onPass}
            className="flex h-14 w-14 items-center justify-center rounded-full border border-gray-300 text-xl text-gray-500 transition hover:border-gray-400 hover:bg-gray-50"
            aria-label="Pass"
          >
            X
          </button>
          <button
            type="button"
            onClick={onLike}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-500 text-xl text-white transition hover:bg-rose-600"
            aria-label="Like"
          >
            ♥
          </button>
        </div>
      </div>
    </div>
  );
}
