package be.asafarim.learn.javanotesapi.services;

import be.asafarim.learn.javanotesapi.dto.citation.*;
import be.asafarim.learn.javanotesapi.entities.*;
import be.asafarim.learn.javanotesapi.enums.CitationStyle;
import be.asafarim.learn.javanotesapi.repositories.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.*;
import java.util.regex.*;

@Service
public class CitationFormattingService {
    @Autowired private NoteCitationRepository citationRepo;
    @Autowired private StudyNoteRepository noteRepo;
    private static final Pattern PAT = Pattern.compile("@note:([A-Za-z0-9_-]+)");

    public CitationRenderResult renderCitations(UUID noteId, CitationStyle style) {
        StudyNote note = noteRepo.findById(noteId).orElseThrow();
        List<NoteCitation> cits = citationRepo.findByNoteIdOrderByCitationOrderAsc(noteId);
        
        // Build map of existing citations by publicId
        Map<String,NoteCitation> byPub = new HashMap<>();
        for(NoteCitation c:cits) if(c.getReferencedNote().getPublicId()!=null) byPub.put(c.getReferencedNote().getPublicId(),c);
        
        String md = note.getContent()!=null?note.getContent():"";
        
        // Extract all @note:ID markers from content
        List<String> markers = new ArrayList<>();
        Matcher m = PAT.matcher(md); 
        while(m.find()){
            String p=m.group(1);
            if(!markers.contains(p)) markers.add(p);
        }
        
        Map<String,String> labels = new LinkedHashMap<>();
        List<ReferenceEntryDto> refs = new ArrayList<>();
        int n=1;
        
        // Process all markers found in content (not just those in citation table)
        for(String markerId : markers) {
            StudyNote refNote = null;
            
            // First check if it's in the citation table by publicId
            if(byPub.containsKey(markerId)) {
                refNote = byPub.get(markerId).getReferencedNote();
            } else {
                // Try to find note by publicId directly
                refNote = noteRepo.findByPublicId(markerId).orElse(null);
                
                // If not found by publicId, try as UUID (for backwards compatibility)
                if(refNote == null) {
                    try {
                        UUID uuid = UUID.fromString(markerId);
                        refNote = noteRepo.findById(uuid).orElse(null);
                    } catch(IllegalArgumentException e) {
                        // Not a valid UUID, ignore
                    }
                }
            }
            
            if(refNote != null) {
                // Use the original markerId as the key so frontend can match it
                labels.put(markerId, fmtInline(refNote, style, n));
                ReferenceEntryDto e = new ReferenceEntryDto();
                e.setReferencedNoteId(refNote.getId());
                e.setPublicId(markerId); // Use markerId to match what's in content
                e.setFormatted(fmtRef(refNote, style, n));
                e.setTitle(refNote.getTitle());
                e.setAuthors(refNote.getAuthors());
                e.setYear(refNote.getPublicationYear());
                refs.add(e);
                n++;
            }
        }
        
        CitationRenderResult res = new CitationRenderResult(noteId, style);
        res.setProcessedMarkdown(md);
        res.setInlineLabels(labels);
        res.setReferences(refs);
        return res;
    }
    private String getSur(String a){if(a==null||a.isBlank())return"Unknown";String[]p=a.split(",")[0].trim().split("\\s+");return p[p.length-1];}
    private String fmtInline(StudyNote n,CitationStyle s,int o){String sur=getSur(n.getAuthors()),yr=n.getPublicationYear()!=null?""+n.getPublicationYear():"n.d.";
        switch(s){case APA:case HARVARD:return"("+sur+", "+yr+")";case MLA:return"("+sur+")";case IEEE:case VANCOUVER:return"["+o+"]";case CHICAGO:return"("+sur+" "+yr+")";case BIBTEX:return"@"+(n.getCitationKey()!=null?n.getCitationKey():n.getPublicId());default:return"("+sur+", "+yr+")";}}
    private String fmtRef(StudyNote n,CitationStyle s,int o){String a=n.getAuthors()!=null?n.getAuthors():"Unknown",t=n.getTitle(),y=n.getPublicationYear()!=null?""+n.getPublicationYear():"n.d.";return a+" ("+y+"). "+t+".";}
}
