import { getCollection, type CollectionEntry } from "astro:content";

import {
  compareDatesDescending,
  isVisibleByDraftState,
  shouldIncludeDrafts,
  type DraftQueryOptions,
} from "./content";

export type ThoughtEntry = CollectionEntry<"thoughts">;

export async function getThoughts(options: DraftQueryOptions = {}) {
  const includeDrafts = shouldIncludeDrafts(options);
  const thoughts = await getCollection("thoughts", ({ data }) =>
    isVisibleByDraftState(data.draft, includeDrafts),
  );

  return thoughts.sort(
    (left, right) =>
      compareDatesDescending(left.data.published, right.data.published) ||
      left.id.localeCompare(right.id),
  );
}

export async function getLatestThoughts(limit = 3, options: DraftQueryOptions = {}) {
  const safeLimit = Math.max(0, Math.trunc(limit));
  return (await getThoughts(options)).slice(0, safeLimit);
}
