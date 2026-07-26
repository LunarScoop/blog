const walk = (node) => {
  if (!Array.isArray(node.children)) {
    return;
  }

  node.children = node.children.map((child) => {
    if (child.type === "code" && child.lang?.toLowerCase() === "mermaid") {
      return {
        type: "paragraph",
        data: {
          hName: "pre",
          hProperties: {
            className: ["mermaid"],
            "data-mermaid-diagram": "",
          },
        },
        children: [{ type: "text", value: child.value }],
      };
    }

    walk(child);
    return child;
  });
};

export default function remarkMermaid() {
  return (tree) => {
    walk(tree);
  };
}
