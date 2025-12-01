package be.asafarim.learn.javanotesapi.dto.citation;

import java.util.List;
import java.util.UUID;

/**
 * DTO representing a citation graph for visualization.
 */
public class CitationGraphDto {
    private UUID rootNoteId;
    private int depth;
    private List<GraphNodeDto> nodes;
    private List<GraphEdgeDto> edges;

    public CitationGraphDto() {}

    public CitationGraphDto(UUID rootNoteId, int depth) {
        this.rootNoteId = rootNoteId;
        this.depth = depth;
    }

    // Getters and Setters
    public UUID getRootNoteId() { return rootNoteId; }
    public void setRootNoteId(UUID rootNoteId) { this.rootNoteId = rootNoteId; }

    public int getDepth() { return depth; }
    public void setDepth(int depth) { this.depth = depth; }

    public List<GraphNodeDto> getNodes() { return nodes; }
    public void setNodes(List<GraphNodeDto> nodes) { this.nodes = nodes; }

    public List<GraphEdgeDto> getEdges() { return edges; }
    public void setEdges(List<GraphEdgeDto> edges) { this.edges = edges; }

    /**
     * A node in the citation graph
     */
    public static class GraphNodeDto {
        private UUID id;
        private String publicId;
        private String title;
        private String noteType;
        private String authors;
        private Integer year;
        private boolean isRoot;

        public GraphNodeDto() {}

        public GraphNodeDto(UUID id, String publicId, String title, String noteType) {
            this.id = id;
            this.publicId = publicId;
            this.title = title;
            this.noteType = noteType;
        }

        // Getters and Setters
        public UUID getId() { return id; }
        public void setId(UUID id) { this.id = id; }

        public String getPublicId() { return publicId; }
        public void setPublicId(String publicId) { this.publicId = publicId; }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getNoteType() { return noteType; }
        public void setNoteType(String noteType) { this.noteType = noteType; }

        public String getAuthors() { return authors; }
        public void setAuthors(String authors) { this.authors = authors; }

        public Integer getYear() { return year; }
        public void setYear(Integer year) { this.year = year; }

        public boolean isRoot() { return isRoot; }
        public void setRoot(boolean root) { isRoot = root; }
    }

    /**
     * An edge (citation relationship) in the graph
     */
    public static class GraphEdgeDto {
        private UUID from;  // citing note
        private UUID to;    // cited note
        private String label;  // optional label

        public GraphEdgeDto() {}

        public GraphEdgeDto(UUID from, UUID to) {
            this.from = from;
            this.to = to;
        }

        // Getters and Setters
        public UUID getFrom() { return from; }
        public void setFrom(UUID from) { this.from = from; }

        public UUID getTo() { return to; }
        public void setTo(UUID to) { this.to = to; }

        public String getLabel() { return label; }
        public void setLabel(String label) { this.label = label; }
    }
}
