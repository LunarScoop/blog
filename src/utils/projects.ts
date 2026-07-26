import { getCollection, type CollectionEntry } from "astro:content";

import {
  compareDatesDescending,
  isVisibleByDraftState,
  shouldIncludeDrafts,
  type DraftQueryOptions,
} from "./content";

export type ProjectEntry = CollectionEntry<"projects">;

const getProjectDate = ({ data }: ProjectEntry) => data.updated ?? data.created;

export async function getProjects(options: DraftQueryOptions = {}) {
  const includeDrafts = shouldIncludeDrafts(options);
  const projects = await getCollection("projects", ({ data }) =>
    isVisibleByDraftState(data.draft, includeDrafts),
  );

  return projects.sort(
    (left, right) =>
      compareDatesDescending(getProjectDate(left), getProjectDate(right)) ||
      left.id.localeCompare(right.id),
  );
}

export async function getFeaturedProjects(options: DraftQueryOptions = {}) {
  return (await getProjects(options)).filter(({ data }) => data.featured);
}
