import { SKIP, visit } from 'unist-util-visit';

// A scroll region keeps wide research tables readable without widening the article.
export default function rehypeScrollableTables() {
  return tree => {
    visit(tree, 'element', (node, index, parent) => {
      if (node.tagName !== 'table' || !parent || index === undefined) return;
      const header = node.children.find(child => child.tagName === 'thead');
      const row = header?.children.find(child => child.tagName === 'tr');
      const columns = row?.children.filter(child => child.tagName === 'th').length || 1;
      parent.children[index] = {
        type: 'element', tagName: 'div',
        properties: {
          className: ['markdown-table-scroll'], tabIndex: 0, role: 'region',
          'aria-label': '文章表格，可横向滚动',
          style: `--table-min-width:${Math.max(600, columns * 180)}px`,
        },
        children: [node],
      };
      return SKIP;
    });
  };
}
