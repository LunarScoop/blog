import assert from "node:assert/strict";
import test from "node:test";
import { getNoteHref } from "../src/config/subjects.ts";
import {
  getAdjacentNotes,
  getRelatedNotes,
  sortKnowledgeNotes,
  type KnowledgeNoteLike,
} from "../src/utils/knowledge.ts";

const createNote = (
  id: string,
  subject: string,
  topic: string,
  tags: string[] = [],
  related: string[] = [],
): KnowledgeNoteLike => ({
  id,
  data: { subject, topic, tags, related },
});

test("知识笔记路径会映射为规格约定的公开 URL 喵~", () => {
  assert.equal(
    getNoteHref("mathematics/calculus/limits/lhopital-rule"),
    "/learn/math/calculus/limits/lhopital-rule",
  );
  assert.equal(
    getNoteHref("computer-science/operating-systems/memory/virtual-memory"),
    "/learn/cs/os/memory/virtual-memory",
  );
});

test("知识排序优先遵循学科与章节配置喵~", () => {
  const notes = [
    createNote("mathematics/calculus/limits/z-note", "calculus", "limits"),
    createNote(
      "computer-science/data-structures/complexity/a-note",
      "data-structures",
      "complexity",
    ),
    createNote("mathematics/calculus/functions/a-note", "calculus", "functions"),
    createNote("mathematics/calculus/limits/a-note", "calculus", "limits"),
  ];

  assert.deepEqual(
    sortKnowledgeNotes(notes).map(({ id }) => id),
    [
      "mathematics/calculus/functions/a-note",
      "mathematics/calculus/limits/a-note",
      "mathematics/calculus/limits/z-note",
      "computer-science/data-structures/complexity/a-note",
    ],
  );
});

test("上一篇与下一篇只在当前学科的知识顺序中选择喵~", () => {
  const previous = createNote(
    "mathematics/calculus/limits/equivalent-infinitesimal",
    "calculus",
    "limits",
  );
  const current = createNote("mathematics/calculus/limits/lhopital-rule", "calculus", "limits");
  const otherSubject = createNote(
    "computer-science/operating-systems/memory/virtual-memory",
    "operating-systems",
    "memory",
  );

  assert.deepEqual(getAdjacentNotes(current, [otherSubject, current, previous]), {
    previous,
    next: undefined,
  });
});

test("相关文章按照显式关联、同主题、同标签与同学科排序喵~", () => {
  const current = createNote("current", "calculus", "limits", ["极限"], ["explicit"]);
  const explicit = createNote("explicit", "operating-systems", "memory");
  const sameTopic = createNote("same-topic", "probability", "limits");
  const sameTag = createNote("same-tag", "data-structures", "complexity", ["极限"]);
  const sameSubject = createNote("same-subject", "calculus", "functions");

  assert.deepEqual(
    getRelatedNotes(current, [sameSubject, sameTag, sameTopic, explicit], 4).map(({ id }) => id),
    ["explicit", "same-topic", "same-tag", "same-subject"],
  );
});
