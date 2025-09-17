// apps/blog/my-remark-plugin.js
// Minimal remark plugin used by docusaurus.config.ts
// Keeps behavior simple (no-op) but satisfies module resolution.

/**
 * @returns {(tree: import('unist').Node) => void}
 */
function myRemarkPlugin() {
  return function transformer(tree) {
    // no-op: add transformations here if needed
  };
}

module.exports = myRemarkPlugin;
