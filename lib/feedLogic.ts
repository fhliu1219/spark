import type { Profile } from "@/types";

export function getRemainingProfiles(
  allProfiles: Profile[],
  liked: string[],
  passed: string[],
): Profile[] {
  const seenIds = new Set([...liked, ...passed]);
  return allProfiles.filter((profile) => !seenIds.has(profile.id));
}

export function checkForMatch(liked: string[]): string | null {
  if (liked.length < 2) {
    return null;
  }

  return liked[1];
}
