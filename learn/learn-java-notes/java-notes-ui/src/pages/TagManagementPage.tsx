import { useEffect, useState } from "react";
import { getTagUsage, renameTag, mergeTags, deleteTag, type TagUsage } from "../api/notesApi";
import { ButtonComponent as Button } from "@asafarim/shared-ui-react";
import "./TagManagementPage.css";

export default function TagManagementPage() {
  const [tags, setTags] = useState<TagUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [mergeTargetName, setMergeTargetName] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "usage">("usage");

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    try {
      setLoading(true);
      console.log("Loading tags from /api/tags/manage/usage");
      const data = await getTagUsage();
      console.log("Tags loaded successfully:", data);
      setTags(data);
      setError(null);
    } catch (err) {
      console.error("Failed to load tags:", err);
      const errorMsg = err instanceof Error ? err.message : "Failed to load tags";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleRename = async (tagId: string) => {
    if (!editingName.trim()) {
      alert("Tag name cannot be empty");
      return;
    }

    try {
      const updated = await renameTag({ tagId, newName: editingName });
      setTags(tags.map(t => t.id === tagId ? updated : t));
      setEditingTagId(null);
      setEditingName("");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to rename tag";
      alert(message);
    }
  };

  const handleDelete = async (tagId: string, usageCount: number) => {
    const force = usageCount > 0;
    const message = force
      ? `This tag is used by ${usageCount} note(s). Are you sure you want to delete it?`
      : "Are you sure you want to delete this tag?";

    if (!window.confirm(message)) return;

    try {
      await deleteTag({ tagId, force });
      setTags(tags.filter(t => t.id !== tagId));
      setSelectedTags(prev => {
        const next = new Set(prev);
        next.delete(tagId);
        return next;
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete tag";
      alert(message);
    }
  };

  const handleMerge = async () => {
    if (selectedTags.size < 2) {
      alert("Please select at least 2 tags to merge");
      return;
    }

    if (!mergeTargetName.trim()) {
      alert("Please enter a target tag name");
      return;
    }

    const message = `This will merge ${selectedTags.size} tags into "${mergeTargetName}". Continue?`;
    if (!window.confirm(message)) return;

    try {
      const result = await mergeTags({
        sourceTagIds: Array.from(selectedTags),
        targetName: mergeTargetName,
      });

      // Remove merged tags and add/update target
      const remainingTags = tags.filter(t => !selectedTags.has(t.id));
      const existingTarget = remainingTags.find(t => t.id === result.id);
      
      if (existingTarget) {
        setTags(remainingTags.map(t => t.id === result.id ? result : t));
      } else {
        setTags([result, ...remainingTags]);
      }

      setSelectedTags(new Set());
      setMergeTargetName("");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to merge tags";
      alert(message);
    }
  };

  const toggleSelection = (tagId: string) => {
    setSelectedTags(prev => {
      const next = new Set(prev);
      if (next.has(tagId)) {
        next.delete(tagId);
      } else {
        next.add(tagId);
      }
      return next;
    });
  };

  const sortedTags = [...tags].sort((a, b) => {
    if (sortBy === "usage") {
      return b.usageCount - a.usageCount || a.name.localeCompare(b.name);
    }
    return a.name.localeCompare(b.name);
  });

  const topTags = sortedTags.slice(0, 10);
  const maxUsage = topTags[0]?.usageCount || 1;

  if (loading) {
    return (
      <div className="tag-management-page">
        <div className="loading-spinner">🏷️</div>
        <p>Loading tags...</p>
      </div>
    );
  }

  return (
    <div className="tag-management-page">
      <div className="page-header">
        <h1>🏷️ Tag Management</h1>
        <p className="page-subtitle">Manage, rename, merge, and organize your tags</p>
      </div>

      {error && (
        <div className="error-banner">
          ❌ {error}
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      {/* Top Tags Summary */}
      <div className="top-tags-section">
        <h2>📊 Top Tags</h2>
        <div className="top-tags-list">
          {topTags.map(tag => (
            <div key={tag.id} className="top-tag-item">
              <span className="top-tag-name">{tag.name}</span>
              <div className="top-tag-bar">
                <div
                  className="top-tag-bar-fill"
                  style={{ width: `${(tag.usageCount / maxUsage) * 100}%` }}
                />
              </div>
              <span className="top-tag-count">{tag.usageCount}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bulk Merge Bar */}
      {selectedTags.size > 0 && (
        <div className="merge-bar">
          <span className="merge-bar-text">
            {selectedTags.size} tag(s) selected
          </span>
          <input
            type="text"
            placeholder="Target tag name..."
            value={mergeTargetName}
            onChange={(e) => setMergeTargetName(e.target.value)}
            className="merge-input"
          />
          <Button variant="primary" onClick={handleMerge} size="sm">
            Merge Tags
          </Button>
          <Button
            variant="secondary"
            onClick={() => setSelectedTags(new Set())}
            size="sm"
          >
            Clear Selection
          </Button>
        </div>
      )}

      {/* Tags Table */}
      <div className="tags-table-section">
        <div className="table-header">
          <h2>All Tags ({tags.length})</h2>
          <div className="sort-controls">
            <label>
              Sort by:
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value as "name" | "usage")}>
                <option value="usage">Usage Count</option>
                <option value="name">Name</option>
              </select>
            </label>
          </div>
        </div>

        <table className="tags-table">
          <thead>
            <tr>
              <th className="checkbox-col">
                <input
                  type="checkbox"
                  checked={selectedTags.size === tags.length && tags.length > 0}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedTags(new Set(tags.map(t => t.id)));
                    } else {
                      setSelectedTags(new Set());
                    }
                  }}
                />
              </th>
              <th>Tag Name</th>
              <th>Usage Count</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedTags.map(tag => (
              <tr key={tag.id} className={selectedTags.has(tag.id) ? "selected" : ""}>
                <td className="checkbox-col">
                  <input
                    type="checkbox"
                    checked={selectedTags.has(tag.id)}
                    onChange={() => toggleSelection(tag.id)}
                  />
                </td>
                <td className="tag-name-cell">
                  {editingTagId === tag.id ? (
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleRename(tag.id);
                        if (e.key === "Escape") {
                          setEditingTagId(null);
                          setEditingName("");
                        }
                      }}
                      autoFocus
                      className="rename-input"
                    />
                  ) : (
                    <>
                      <span className="tag-name">{tag.name}</span>
                      {tag.usageCount === 0 && (
                        <span className="unused-badge">unused</span>
                      )}
                    </>
                  )}
                </td>
                <td className="usage-count">{tag.usageCount}</td>
                <td className="actions-cell">
                  {editingTagId === tag.id ? (
                    <>
                      <Button
                        variant="success"
                        onClick={() => handleRename(tag.id)}
                        size="sm"
                      >
                        ✓ Save
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setEditingTagId(null);
                          setEditingName("");
                        }}
                        size="sm"
                      >
                        ✕ Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="primary"
                        onClick={() => {
                          setEditingTagId(tag.id);
                          setEditingName(tag.name);
                        }}
                        size="sm"
                      >
                        ✏️ Rename
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => handleDelete(tag.id, tag.usageCount)}
                        size="sm"
                      >
                        🗑️ Delete
                      </Button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
