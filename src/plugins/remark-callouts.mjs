const CALLOUTS = {
  note: "说明",
  tip: "提示",
  important: "重要",
  warning: "警告",
  caution: "注意",
};

const markerPattern = /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\][ \t]*(?:\r?\n)?/i;

const mergeClassNames = (current, next) => {
  const values = Array.isArray(current) ? current : current ? [current] : [];
  return [...values, next];
};

const transformBlockquote = (node) => {
  if (node.type !== "blockquote") {
    return;
  }

  const firstParagraph = node.children[0];
  const firstText = firstParagraph?.type === "paragraph" ? firstParagraph.children[0] : null;

  if (firstText?.type !== "text") {
    return;
  }

  const match = firstText.value.match(markerPattern);

  if (!match) {
    return;
  }

  const kind = match[1].toLowerCase();
  const label = CALLOUTS[kind];
  const remainder = firstText.value.slice(match[0].length);
  const title = {
    type: "strong",
    data: {
      hProperties: {
        className: ["callout-title"],
      },
    },
    children: [{ type: "text", value: label }],
  };

  firstParagraph.children = remainder
    ? [title, { type: "break" }, { type: "text", value: remainder }]
    : [title];

  const properties = node.data?.hProperties ?? {};
  node.data = {
    ...node.data,
    hName: "aside",
    hProperties: {
      ...properties,
      className: mergeClassNames(properties.className, "callout").concat(`callout-${kind}`),
      "data-callout": kind,
    },
  };
};

const walk = (node) => {
  if (!Array.isArray(node.children)) {
    return;
  }

  for (const child of node.children) {
    transformBlockquote(child);
    walk(child);
  }
};

export default function remarkCallouts() {
  return (tree) => {
    walk(tree);
  };
}
