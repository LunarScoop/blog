import { getSubjectOrder, getTopicOrder } from "../config/subjects.ts";

export interface KnowledgeNoteLike {
  id: string;
  data: {
    subject: string;
    topic: string;
    tags: readonly string[];
    related: readonly string[];
  };
}

export const sortKnowledgeNotes = <T extends KnowledgeNoteLike>(notes: readonly T[]) =>
  [...notes].sort(
    (left, right) =>
      getSubjectOrder(left.data.subject) - getSubjectOrder(right.data.subject) ||
      getTopicOrder(left.data.subject, left.data.topic) -
        getTopicOrder(right.data.subject, right.data.topic) ||
      left.id.localeCompare(right.id),
  );

export const groupNotesByTopic = <T extends KnowledgeNoteLike>(notes: readonly T[]) => {
  const groups = new Map<string, T[]>();

  for (const note of sortKnowledgeNotes(notes)) {
    const topicNotes = groups.get(note.data.topic) ?? [];
    topicNotes.push(note);
    groups.set(note.data.topic, topicNotes);
  }

  return Array.from(groups, ([topic, topicNotes]) => ({ topic, notes: topicNotes }));
};

export const getAdjacentNotes = <T extends KnowledgeNoteLike>(
  currentNote: T,
  notes: readonly T[],
) => {
  const subjectNotes = sortKnowledgeNotes(
    notes.filter(({ data }) => data.subject === currentNote.data.subject),
  );
  const currentIndex = subjectNotes.findIndex(({ id }) => id === currentNote.id);

  if (currentIndex === -1) {
    return { previous: undefined, next: undefined };
  }

  return {
    previous: subjectNotes[currentIndex - 1],
    next: subjectNotes[currentIndex + 1],
  };
};

const getSharedTagCount = (left: KnowledgeNoteLike, right: KnowledgeNoteLike) => {
  const leftTags = new Set(left.data.tags);
  return right.data.tags.filter((tag) => leftTags.has(tag)).length;
};

export const getRelatedNotes = <T extends KnowledgeNoteLike>(
  currentNote: T,
  notes: readonly T[],
  limit = 3,
) => {
  const safeLimit = Math.max(0, Math.trunc(limit));
  const knowledgeOrder = new Map(
    sortKnowledgeNotes(notes).map(({ id }, index) => [id, index] as const),
  );

  return notes
    .filter(({ id }) => id !== currentNote.id)
    .map((candidate) => {
      const explicitPosition = currentNote.data.related.indexOf(candidate.id);
      const sharedTagCount = getSharedTagCount(currentNote, candidate);
      let priority = Number.MAX_SAFE_INTEGER;
      let secondary = 0;

      if (explicitPosition !== -1) {
        priority = 0;
        secondary = explicitPosition;
      } else if (currentNote.data.topic !== "" && candidate.data.topic === currentNote.data.topic) {
        priority = 1;
      } else if (sharedTagCount > 0) {
        priority = 2;
        secondary = -sharedTagCount;
      } else if (candidate.data.subject === currentNote.data.subject) {
        priority = 3;
      }

      return {
        candidate,
        priority,
        secondary,
        knowledgeOrder: knowledgeOrder.get(candidate.id) ?? Number.MAX_SAFE_INTEGER,
      };
    })
    .filter(({ priority }) => Number.isFinite(priority) && priority < Number.MAX_SAFE_INTEGER)
    .sort(
      (left, right) =>
        left.priority - right.priority ||
        left.secondary - right.secondary ||
        left.knowledgeOrder - right.knowledgeOrder ||
        left.candidate.id.localeCompare(right.candidate.id),
    )
    .slice(0, safeLimit)
    .map(({ candidate }) => candidate);
};
