/**
 * Author Pages - README
 * 
 * Docusaurus doesn't support dynamic routes with file patterns like [authorKey].tsx
 * 
 * Instead, we create individual files for each author:
 * - alisafari.tsx
 * - asafarim.tsx
 * - etc.
 * 
 * Each file imports the shared AuthorProfile component and passes the appropriate
 * author key as a prop.
 * 
 * To add a new author:
 * 1. Add the author data to blog/authors.yml
 * 2. Create a new file named [authorKey].tsx in this directory
 * 3. Import and use the AuthorProfile component with the author key
 */

// This file is just documentation and not used in the actual site
