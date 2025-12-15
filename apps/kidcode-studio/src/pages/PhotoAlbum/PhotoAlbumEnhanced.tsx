import {
  useState,
  useEffect,
  useRef,
  type ChangeEvent,
  type DragEvent,
} from "react";
import {
  Upload,
  Trash2,
  Image as ImageIcon,
  Video as VideoIcon,
  Download,
  X,
  Plus,
  FolderOpen,
  AlertCircle,
  Edit2,
  Lock,
  Globe,
  Users,
  Filter,
  ArrowLeft,
} from "lucide-react";
import {
  mediaApi,
  type MediaAssetDto,
  type AlbumDto,
  AlbumVisibility,
} from "../../services/mediaApi";
import "./PhotoAlbum.css";
import { characterApi } from "../../services/characterApi";

type ViewMode = "gallery" | "album-detail";
type FilterMode = "all" | "my-media" | "public";

export default function PhotoAlbumEnhanced() {
  const [mediaItems, setMediaItems] = useState<MediaAssetDto[]>([]);
  const [albums, setAlbums] = useState<AlbumDto[]>([]);
  const [selectedItem, setSelectedItem] = useState<MediaAssetDto | null>(null);
  const [selectedAlbum, setSelectedAlbum] = useState<AlbumDto | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("gallery");
  const [filter, setFilter] = useState<"all" | "image" | "video">("all");
  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showNewAlbum, setShowNewAlbum] = useState(false);
  const [showEditAlbum, setShowEditAlbum] = useState(false);
  const [newAlbumName, setNewAlbumName] = useState("");
  const [newAlbumDesc, setNewAlbumDesc] = useState("");
  const [newAlbumVisibility, setNewAlbumVisibility] = useState<AlbumVisibility>(
    AlbumVisibility.Private
  );
  const [savingCharacter, setSavingCharacter] = useState(false);
  const [draggedMedia, setDraggedMedia] = useState<MediaAssetDto | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleSaveAsCharacter(item: MediaAssetDto) {
    setSavingCharacter(true);
    try {
      await characterApi.createCharacter({
        name: item.title || "Custom Character",
        mediaAssetId: item.id,
        description: `Character from ${item.source}`,
      });
      setSelectedItem(null);
      alert("Character saved! You can now use it in Story Mode.");
    } catch (err) {
      console.error("Failed to save character:", err);
      setError(err instanceof Error ? err.message : "Failed to save character");
    } finally {
      setSavingCharacter(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [filterMode]);

  async function loadData() {
    setError(null);
    try {
      const myMediaOnly = filterMode === "my-media";
      const [items, albumList] = await Promise.all([
        mediaApi.listMedia(undefined, undefined, myMediaOnly),
        mediaApi.listAlbums(myMediaOnly),
      ]);
      setMediaItems(items);
      setAlbums(albumList);
    } catch (err) {
      console.error("Failed to load media:", err);
      setError(err instanceof Error ? err.message : "Failed to load media");
    } finally {
      setLoading(false);
    }
  }

  async function handleFileUpload(e: ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      for (const file of Array.from(files)) {
        const isVideo = file.type.startsWith("video/");
        const isImage = file.type.startsWith("image/");
        if (!isVideo && !isImage) continue;

        let width: number | undefined;
        let height: number | undefined;
        let duration: number | undefined;

        if (isImage) {
          const dims = await getImageDimensions(file);
          width = dims.width;
          height = dims.height;
        } else if (isVideo) {
          const meta = await getVideoMetadata(file);
          width = meta.width;
          height = meta.height;
          duration = meta.duration;
        }

        const item = await mediaApi.uploadMedia({
          file,
          title: file.name.replace(/\.[^/.]+$/, ""),
          source: "upload",
          width,
          height,
          duration,
          albumId: selectedAlbum?.id,
        });

        setMediaItems((prev) => [item, ...prev]);
        if (selectedAlbum) {
          setSelectedAlbum((prev) =>
            prev ? { ...prev, mediaCount: prev.mediaCount + 1 } : null
          );
        }
      }
    } catch (err) {
      console.error("Failed to upload:", err);
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this media? This cannot be undone.")) return;
    try {
      await mediaApi.deleteMedia(id);
      setMediaItems((prev) => prev.filter((m) => m.id !== id));
      if (selectedItem?.id === id) {
        setSelectedItem(null);
      }
      if (selectedAlbum) {
        setSelectedAlbum((prev) =>
          prev ? { ...prev, mediaCount: prev.mediaCount - 1 } : null
        );
      }
    } catch (err) {
      console.error("Failed to delete:", err);
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  }

  function handleDownload(item: MediaAssetDto) {
    const url = mediaApi.getContentUrl(item.id);
    const a = document.createElement("a");
    a.href = url;
    a.download = item.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  async function handleCreateAlbum() {
    if (!newAlbumName.trim()) return;
    try {
      const album = await mediaApi.createAlbum(
        newAlbumName.trim(),
        newAlbumDesc.trim() || undefined,
        newAlbumVisibility
      );
      setAlbums((prev) => [album, ...prev]);
      setNewAlbumName("");
      setNewAlbumDesc("");
      setNewAlbumVisibility(AlbumVisibility.Private);
      setShowNewAlbum(false);
    } catch (err) {
      console.error("Failed to create album:", err);
      setError(err instanceof Error ? err.message : "Failed to create album");
    }
  }

  async function handleUpdateAlbum() {
    if (!selectedAlbum) return;
    try {
      const updated = await mediaApi.updateAlbum(selectedAlbum.id, {
        name: newAlbumName.trim() || undefined,
        description: newAlbumDesc.trim() || undefined,
        visibility: newAlbumVisibility,
      });
      setAlbums((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
      setSelectedAlbum(updated);
      setShowEditAlbum(false);
      setNewAlbumName("");
      setNewAlbumDesc("");
    } catch (err) {
      console.error("Failed to update album:", err);
      setError(err instanceof Error ? err.message : "Failed to update album");
    }
  }

  async function handleDeleteAlbum(id: string) {
    if (
      !confirm(
        "Delete this album? Media will not be deleted, only removed from the album."
      )
    )
      return;
    try {
      await mediaApi.deleteAlbum(id);
      setAlbums((prev) => prev.filter((a) => a.id !== id));
      if (selectedAlbum?.id === id) {
        setSelectedAlbum(null);
        setViewMode("gallery");
      }
    } catch (err) {
      console.error("Failed to delete album:", err);
      setError(err instanceof Error ? err.message : "Failed to delete album");
    }
  }

  async function handleOpenAlbum(album: AlbumDto) {
    setSelectedAlbum(album);
    setViewMode("album-detail");
    try {
      const items = await mediaApi.listMedia(album.id);
      setMediaItems(items);
    } catch (err) {
      console.error("Failed to load album media:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load album media"
      );
    }
  }

  function handleBackToGallery() {
    setViewMode("gallery");
    setSelectedAlbum(null);
    loadData();
  }

  // Drag and drop handlers
  function handleDragStart(e: DragEvent<HTMLDivElement>, media: MediaAssetDto) {
    setDraggedMedia(media);
    e.dataTransfer.effectAllowed = "move";
  }

  function handleDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }

  async function handleDropOnAlbum(
    e: DragEvent<HTMLDivElement>,
    album: AlbumDto
  ) {
    e.preventDefault();
    if (!draggedMedia) return;

    try {
      await mediaApi.addMediaToAlbum(album.id, draggedMedia.id);
      setMediaItems((prev) =>
        prev.map((m) =>
          m.id === draggedMedia.id ? { ...m, albumId: album.id } : m
        )
      );
      setAlbums((prev) =>
        prev.map((a) =>
          a.id === album.id ? { ...a, mediaCount: a.mediaCount + 1 } : a
        )
      );
      setDraggedMedia(null);
    } catch (err) {
      console.error("Failed to add media to album:", err);
      setError(err instanceof Error ? err.message : "Failed to add to album");
    }
  }

  async function handleRemoveFromAlbum(mediaId: string) {
    if (!selectedAlbum) return;
    try {
      await mediaApi.removeMediaFromAlbum(selectedAlbum.id, mediaId);
      setMediaItems((prev) => prev.filter((m) => m.id !== mediaId));
      setSelectedAlbum((prev) =>
        prev ? { ...prev, mediaCount: prev.mediaCount - 1 } : null
      );
    } catch (err) {
      console.error("Failed to remove from album:", err);
      setError(
        err instanceof Error ? err.message : "Failed to remove from album"
      );
    }
  }

  const getMediaType = (contentType: string): "image" | "video" =>
    contentType.startsWith("video/") ? "video" : "image";

  const filteredItems = mediaItems.filter((item) => {
    const type = getMediaType(item.contentType);
    if (filter !== "all" && type !== filter) return false;
    if (sourceFilter !== "all" && item.source !== sourceFilter) return false;
    return true;
  });

  const sources = [
    ...new Set(mediaItems.map((m) => m.source).filter(Boolean)),
  ] as string[];

  const getVisibilityIcon = (visibility: AlbumVisibility) => {
    switch (visibility) {
      case AlbumVisibility.Public:
        return <Globe size={14} />;
      case AlbumVisibility.MembersOnly:
        return <Users size={14} />;
      default:
        return <Lock size={14} />;
    }
  };

  const getVisibilityLabel = (visibility: AlbumVisibility) => {
    switch (visibility) {
      case AlbumVisibility.Public:
        return "Public";
      case AlbumVisibility.MembersOnly:
        return "Members Only";
      default:
        return "Private";
    }
  };

  if (loading) {
    return (
      <div className="photo-album loading">
        <div className="loading-spinner">📸</div>
        <p>Loading your gallery...</p>
      </div>
    );
  }

  return (
    <div className="photo-album">
      <header className="album-header">
        <div className="header-left">
          {viewMode === "album-detail" && selectedAlbum ? (
            <>
              <button className="btn-back" onClick={handleBackToGallery}>
                <ArrowLeft size={18} />
              </button>
              <div>
                <h1>📁 {selectedAlbum.name}</h1>
                <p className="album-meta">
                  {getVisibilityIcon(selectedAlbum.visibility)}
                  <span>{getVisibilityLabel(selectedAlbum.visibility)}</span>
                  <span>•</span>
                  <span>{selectedAlbum.mediaCount} items</span>
                </p>
              </div>
            </>
          ) : (
            <>
              <h1>📸 Photo Album</h1>
              <p>Your creations and uploads</p>
            </>
          )}
        </div>
        <div className="header-actions">
          {viewMode === "album-detail" && selectedAlbum && (
            <button
              className="btn-edit"
              onClick={() => {
                setNewAlbumName(selectedAlbum.name);
                setNewAlbumDesc(selectedAlbum.description || "");
                setNewAlbumVisibility(selectedAlbum.visibility);
                setShowEditAlbum(true);
              }}
            >
              <Edit2 size={16} />
              Edit Album
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={handleFileUpload}
            className="file-input"
          />
          <button
            className="btn-upload"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            <Upload size={18} />
            {uploading ? "Uploading..." : "Upload"}
          </button>
          {viewMode === "gallery" && (
            <button className="btn-album" onClick={() => setShowNewAlbum(true)}>
              <Plus size={18} />
              New Album
            </button>
          )}
        </div>
      </header>

      {(showNewAlbum || showEditAlbum) && (
        <div
          className="album-form-modal"
          onClick={() => {
            setShowNewAlbum(false);
            setShowEditAlbum(false);
          }}
        >
          <div className="album-form" onClick={(e) => e.stopPropagation()}>
            <h3>{showEditAlbum ? "Edit Album" : "Create New Album"}</h3>
            <input
              type="text"
              placeholder="Album name..."
              value={newAlbumName}
              onChange={(e) => setNewAlbumName(e.target.value)}
              autoFocus
            />
            <textarea
              placeholder="Description (optional)..."
              value={newAlbumDesc}
              onChange={(e) => setNewAlbumDesc(e.target.value)}
              rows={3}
            />
            <div className="visibility-selector">
              <label>Visibility:</label>
              <div className="visibility-options">
                <button
                  className={
                    newAlbumVisibility === AlbumVisibility.Private
                      ? "active"
                      : ""
                  }
                  onClick={() => setNewAlbumVisibility(AlbumVisibility.Private)}
                >
                  <Lock size={16} />
                  Private
                </button>
                <button
                  className={
                    newAlbumVisibility === AlbumVisibility.MembersOnly
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setNewAlbumVisibility(AlbumVisibility.MembersOnly)
                  }
                >
                  <Users size={16} />
                  Members Only
                </button>
                <button
                  className={
                    newAlbumVisibility === AlbumVisibility.Public
                      ? "active"
                      : ""
                  }
                  onClick={() => setNewAlbumVisibility(AlbumVisibility.Public)}
                >
                  <Globe size={16} />
                  Public
                </button>
              </div>
            </div>
            <div className="form-actions">
              <button
                className="btn-primary"
                onClick={showEditAlbum ? handleUpdateAlbum : handleCreateAlbum}
              >
                {showEditAlbum ? "Update" : "Create"}
              </button>
              <button
                className="btn-cancel"
                onClick={() => {
                  setShowNewAlbum(false);
                  setShowEditAlbum(false);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {viewMode === "gallery" && (
        <div className="filter-bar">
          <div className="filter-group">
            <Filter size={16} />
            <label>Show:</label>
            <select
              value={filterMode}
              onChange={(e) => setFilterMode(e.target.value as FilterMode)}
            >
              <option value="all">All Media</option>
              <option value="my-media">My Media Only</option>
              <option value="public">Public Media</option>
            </select>
          </div>
        </div>
      )}

      {error && (
        <div className="error-banner">
          <AlertCircle size={18} />
          <span>{error}</span>
          <button onClick={() => setError(null)}>
            <X size={16} />
          </button>
        </div>
      )}

      {viewMode === "gallery" && albums.length > 0 && (
        <section className="albums-section">
          <h2>
            <FolderOpen size={20} /> Albums
          </h2>
          <div className="albums-grid">
            {albums.map((album) => (
              <div
                key={album.id}
                className="album-card"
                onClick={() => handleOpenAlbum(album)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDropOnAlbum(e, album)}
              >
                <div className="album-cover">
                  {album.coverUrl ? (
                    <img src={album.coverUrl} alt={album.name} />
                  ) : (
                    <span className="album-icon">📁</span>
                  )}
                </div>
                <div className="album-info">
                  <span className="album-name">{album.name}</span>
                  <div className="album-meta">
                    {getVisibilityIcon(album.visibility)}
                    <span className="album-count">
                      {album.mediaCount} items
                    </span>
                  </div>
                </div>
                <button
                  className="album-delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteAlbum(album.id);
                  }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="gallery-section">
        <div className="gallery-filters">
          <div className="filter-group">
            <label>Type:</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as typeof filter)}
            >
              <option value="all">All</option>
              <option value="image">Images</option>
              <option value="video">Videos</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Source:</label>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
            >
              <option value="all">All Sources</option>
              {sources.map((src) => (
                <option key={src} value={src}>
                  {src}
                </option>
              ))}
            </select>
          </div>
          <span className="item-count">{filteredItems.length} items</span>
        </div>

        {filteredItems.length === 0 ? (
          <div className="empty-gallery">
            <span className="empty-icon">🖼️</span>
            <p>No media yet!</p>
            <p className="empty-hint">
              {viewMode === "album-detail"
                ? "Upload photos/videos or drag media from the gallery into this album"
                : "Upload photos/videos or save your creations from Drawing Studio"}
            </p>
          </div>
        ) : (
          <div className="gallery-grid">
            {filteredItems.map((item) => {
              const type = getMediaType(item.contentType);
              return (
                <div
                  key={item.id}
                  className={`gallery-item ${type}`}
                  onClick={() => setSelectedItem(item)}
                  draggable={viewMode === "gallery"}
                  onDragStart={(e) => handleDragStart(e, item)}
                >
                  {type === "image" ? (
                    <img
                      src={mediaApi.getContentUrl(item.id)}
                      alt={item.title}
                      loading="lazy"
                    />
                  ) : (
                    <div className="video-thumb">
                      <VideoIcon size={32} />
                      {item.duration && (
                        <span className="duration">
                          {formatDuration(item.duration)}
                        </span>
                      )}
                    </div>
                  )}
                  <div className="item-overlay">
                    <span className="item-title">{item.title}</span>
                    <span className="item-source">{item.source}</span>
                  </div>
                  <div className="item-type-badge">
                    {type === "image" ? (
                      <ImageIcon size={14} />
                    ) : (
                      <VideoIcon size={14} />
                    )}
                  </div>
                  {viewMode === "album-detail" && (
                    <button
                      className="item-remove"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFromAlbum(item.id);
                      }}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {selectedItem && (
        <div className="lightbox" onClick={() => setSelectedItem(null)}>
          <div
            className="lightbox-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="lightbox-close"
              onClick={() => setSelectedItem(null)}
            >
              <X size={24} />
            </button>
            {getMediaType(selectedItem.contentType) === "image" ? (
              <img
                src={mediaApi.getContentUrl(selectedItem.id)}
                alt={selectedItem.title}
              />
            ) : (
              <video
                src={mediaApi.getContentUrl(selectedItem.id)}
                controls
                autoPlay
              />
            )}
            <div className="lightbox-info">
              <h3>{selectedItem.title}</h3>
              <p>Source: {selectedItem.source}</p>
              {selectedItem.width && selectedItem.height && (
                <p>
                  Size: {selectedItem.width} × {selectedItem.height}
                </p>
              )}
              <p>
                Created: {new Date(selectedItem.createdAt).toLocaleDateString()}
              </p>
              <div className="lightbox-actions">
                {getMediaType(selectedItem.contentType) === "image" && (
                  <button
                    className="btn-character"
                    onClick={() => handleSaveAsCharacter(selectedItem)}
                    disabled={savingCharacter}
                  >
                    {savingCharacter ? "Saving..." : "💾 Save as Character"}
                  </button>
                )}
                <button onClick={() => handleDownload(selectedItem)}>
                  <Download size={16} /> Download
                </button>
                <button
                  className="btn-delete"
                  onClick={() => handleDelete(selectedItem.id)}
                >
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getImageDimensions(
  file: File
): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.width, height: img.height });
    img.onerror = () => resolve({ width: 0, height: 0 });
    img.src = URL.createObjectURL(file);
  });
}

function getVideoMetadata(
  file: File
): Promise<{ width: number; height: number; duration: number }> {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.onloadedmetadata = () => {
      resolve({
        width: video.videoWidth,
        height: video.videoHeight,
        duration: video.duration,
      });
    };
    video.onerror = () => resolve({ width: 0, height: 0, duration: 0 });
    video.src = URL.createObjectURL(file);
  });
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
