import assert from "node:assert/strict";
import test from "node:test";
import remarkCallouts from "../src/plugins/remark-callouts.mjs";
import remarkMermaid from "../src/plugins/remark-mermaid.mjs";

interface TestNode {
  type: string;
  lang?: string;
  value?: string;
  data?: {
    hName?: string;
    hProperties?: Record<string, unknown>;
  };
  children?: TestNode[];
}

const childAt = (node: TestNode, index: number) => {
  const child = node.children?.[index];
  assert.ok(child);
  return child;
};

test("Callout 标记会转换为带语义和类型的 aside 喵~", () => {
  const tree: TestNode = {
    type: "root",
    children: [
      {
        type: "blockquote",
        children: [
          {
            type: "paragraph",
            children: [{ type: "text", value: "[!TIP]" }],
          },
          {
            type: "paragraph",
            children: [{ type: "text", value: "先估算复杂度喵~" }],
          },
        ],
      },
    ],
  };

  remarkCallouts()(tree);

  const callout = childAt(tree, 0);
  const properties = callout.data?.hProperties;
  assert.ok(properties);
  assert.equal(callout.data?.hName, "aside");
  assert.equal(properties["data-callout"], "tip");
  assert.deepEqual(properties.className, ["callout", "callout-tip"]);
  const title = childAt(childAt(callout, 0), 0);
  assert.equal(title.type, "strong");
  assert.equal(childAt(title, 0).value, "提示");
});

test("普通引用不会被误识别为 Callout 喵~", () => {
  const tree: TestNode = {
    type: "root",
    children: [
      {
        type: "blockquote",
        children: [
          {
            type: "paragraph",
            children: [{ type: "text", value: "这是一段普通引用喵~" }],
          },
        ],
      },
    ],
  };

  remarkCallouts()(tree);

  assert.equal(childAt(tree, 0).data, undefined);
});

test("Mermaid 代码块会绕过代码高亮并保留图表源码喵~", () => {
  const source = "flowchart LR\n  A --> B";
  const tree: TestNode = {
    type: "root",
    children: [
      {
        type: "code",
        lang: "mermaid",
        value: source,
      },
      {
        type: "code",
        lang: "ts",
        value: "const answer = 42;",
      },
    ],
  };

  remarkMermaid()(tree);

  const diagram = childAt(tree, 0);
  const properties = diagram.data?.hProperties;
  assert.ok(properties);
  assert.equal(diagram.type, "paragraph");
  assert.equal(diagram.data?.hName, "pre");
  assert.deepEqual(properties.className, ["mermaid"]);
  assert.equal(childAt(diagram, 0).value, source);
  assert.equal(childAt(tree, 1).type, "code");
});
