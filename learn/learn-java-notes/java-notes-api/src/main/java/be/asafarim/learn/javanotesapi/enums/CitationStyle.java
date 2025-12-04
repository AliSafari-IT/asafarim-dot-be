package be.asafarim.learn.javanotesapi.enums;

/**
 * Citation formatting styles for academic references.
 */
public enum CitationStyle {
    /**
     * APA (American Psychological Association) - Author, Year format.
     * Example: (Smith, 2021)
     */
    APA("APA", "American Psychological Association", "(Author, Year)"),
    
    /**
     * MLA (Modern Language Association) - Author Page format.
     * Example: (Smith 45)
     */
    MLA("MLA", "Modern Language Association", "(Author Page)"),
    
    /**
     * IEEE (Institute of Electrical and Electronics Engineers) - Numbered format.
     * Example: [1]
     */
    IEEE("IEEE", "Institute of Electrical and Electronics Engineers", "[Number]"),
    
    /**
     * Chicago - Author-Date or Notes-Bibliography format.
     * Example: (Smith 2021, 45)
     */
    CHICAGO("Chicago", "Chicago Manual of Style", "(Author Year, Page)"),
    
    /**
     * Harvard - Author-Date format similar to APA.
     * Example: (Smith 2021)
     */
    HARVARD("Harvard", "Harvard Referencing System", "(Author Year)"),
    
    /**
     * Vancouver - Numbered format for medical/scientific papers.
     * Example: (1)
     */
    VANCOUVER("Vancouver", "Vancouver System", "(Number)"),
    
    /**
     * BibTeX - Technical format for LaTeX documents.
     * Example: \cite{smith2021}
     */
    BIBTEX("BibTeX", "BibTeX Format", "@key");

    private final String code;
    private final String fullName;
    private final String inlineFormat;

    CitationStyle(String code, String fullName, String inlineFormat) {
        this.code = code;
        this.fullName = fullName;
        this.inlineFormat = inlineFormat;
    }

    public String getCode() {
        return code;
    }

    public String getFullName() {
        return fullName;
    }

    public String getInlineFormat() {
        return inlineFormat;
    }
}
