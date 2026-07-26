import { getCollection, type CollectionEntry } from "astro:content";

import {
  compareDatesDescending,
  isVisibleByDraftState,
  shouldIncludeDrafts,
  type DraftQueryOptions,
} from "./content";

export type NoteEntry = CollectionEntry<"notes">;
export type NoteDomain = NoteEntry["data"]["domain"];
export type NoteSubject = NoteEntry["data"]["subject"];

const getNoteDate = ({ data }: NoteEntry) => data.updated ?? data.created;

export async function getNotes(options: DraftQueryOptions = {}) {
  const includeDrafts = shouldIncludeDrafts(options);
  const notes = await getCollection("notes", ({ data }) =>
    isVisibleByDraftState(data.draft, includeDrafts),
  );

  return notes.sort(
    (left, right) =>
      compareDatesDescending(getNoteDate(left), getNoteDate(right)) ||
      left.id.localeCompare(right.id),
  );
}

export async function getNotesByDomain(domain: NoteDomain, options: DraftQueryOptions = {}) {
  return (await getNotes(options)).filter(({ data }) => data.domain === domain);
}

export async function getNotesBySubject(subject: NoteSubject, options: DraftQueryOptions = {}) {
  return (await getNotes(options)).filter(({ data }) => data.subject === subject);
}

export async function getNotesByTopic(topic: string, options: DraftQueryOptions = {}) {
  return (await getNotes(options)).filter(({ data }) => data.topic === topic);
}

export async function getRecentNotes(limit = 6, options: DraftQueryOptions = {}) {
  const safeLimit = Math.max(0, Math.trunc(limit));
  return (await getNotes(options)).slice(0, safeLimit);
}

export async function getCurrentlyLearning(limit = 3, options: DraftQueryOptions = {}) {
  const safeLimit = Math.max(0, Math.trunc(limit));
  return (await getNotes(options))
    .filter(({ data }) => data.status === "learning" || data.status === "reviewing")
    .slice(0, safeLimit);
}
