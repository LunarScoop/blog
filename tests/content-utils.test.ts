import assert from "node:assert/strict";
import test from "node:test";

import {
  compareDatesDescending,
  isVisibleByDraftState,
  shouldIncludeDrafts,
} from "../src/utils/content.ts";

test("生产查询会隐藏草稿喵~", () => {
  assert.equal(isVisibleByDraftState(true, false), false);
  assert.equal(isVisibleByDraftState(false, false), true);
});

test("显式预览模式会包含草稿喵~", () => {
  assert.equal(isVisibleByDraftState(true, true), true);
  assert.equal(shouldIncludeDrafts({ includeDrafts: true }), true);
  assert.equal(shouldIncludeDrafts({ includeDrafts: false }), false);
});

test("日期比较器按照最新日期优先排序喵~", () => {
  const older = new Date("2026-07-20T00:00:00.000Z");
  const newer = new Date("2026-07-24T00:00:00.000Z");
  const dates = [older, newer].sort(compareDatesDescending);

  assert.deepEqual(dates, [newer, older]);
});
