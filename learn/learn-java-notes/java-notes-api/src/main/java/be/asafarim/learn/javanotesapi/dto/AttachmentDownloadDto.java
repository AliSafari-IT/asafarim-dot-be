package be.asafarim.learn.javanotesapi.dto;

public class AttachmentDownloadDto {
    private byte[] data;
    private String filename;
    private String contentType;

    public AttachmentDownloadDto(byte[] data, String filename, String contentType) {
        this.data = data;
        this.filename = filename;
        this.contentType = contentType;
    }

    public byte[] getData() {
        return data;
    }

    public String getFilename() {
        return filename;
    }

    public String getContentType() {
        return contentType;
    }
}
