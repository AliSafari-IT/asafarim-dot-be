import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

// Define the BlogPost interface
export interface BlogPost {
  id: string;
  title: string;
  date: string;
  excerpt: string;
  url: string;
  authors: string[];
}

// Root directory of the blog posts
const BLOG_DIR = path.join(process.cwd(), 'blog');

/**
 * Extract excerpt from blog post content
 */
function extractExcerpt(content: string, maxLength: number = 150): string {
  // Remove frontmatter and HTML tags
  const cleanContent = content
    .replace(/---[\s\S]*?---/, '') // Remove frontmatter
    .replace(/<\/?[^>]+(>|$)/g, '') // Remove HTML tags
    .replace(/\[.*?\]\(.*?\)/g, '') // Remove markdown links
    .replace(/```[\s\S]*?```/g, '') // Remove code blocks
    .trim();

  // Find the first paragraph or use the beginning of the content
  const paragraphs = cleanContent.split('\n\n');
  let excerpt = paragraphs[0] || cleanContent;
  
  // Look for truncate marker
  const truncateMarker = '<!-- truncate -->';
  const truncateIndex = content.indexOf(truncateMarker);
  
  if (truncateIndex !== -1) {
    // Use content before truncate marker
    excerpt = content.substring(0, truncateIndex).trim();
    excerpt = excerpt
      .replace(/---[\s\S]*?---/, '') // Remove frontmatter
      .replace(/<\/?[^>]+(>|$)/g, '') // Remove HTML tags
      .trim();
  }
  
  // Limit excerpt length
  if (excerpt?.length > maxLength) {
    excerpt = excerpt.substring(0, maxLength) + '...';
  }
  
  return excerpt;
}

/**
 * Get all blog posts
 */
export function getAllBlogPosts(): BlogPost[] {
  try {
    // Check if directory exists
    if (!fs.existsSync(BLOG_DIR)) {
      console.error(`Blog directory not found: ${BLOG_DIR}`);
      return [];
    }
    
    // Get all markdown files
    const files = fs.readdirSync(BLOG_DIR).filter(file => 
      file.endsWith('.md') || file.endsWith('.mdx')
    );
    
    // Parse each file
    const posts = files.map(filename => {
      const filePath = path.join(BLOG_DIR, filename);
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const { data, content } = matter(fileContent);
      
      // Extract date from filename or frontmatter
      let date = data.date;
      if (!date && filename.match(/^\d{4}-\d{2}-\d{2}/)) {
        date = filename.substring(0, 10);
      }
      
      // Format date if it's a Date object
      let formattedDate = date;
      if (date instanceof Date) {
        formattedDate = date.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
      }
      
      // Generate URL from filename
      // Example: 2025-04-08-critique-issues-windsurf.md -> /blog/2025/04/08/critique-issues-windsurf
      const urlPath = filename
        .replace(/\.mdx?$/, '') // Remove extension
        .replace(/^(\d{4})-(\d{2})-(\d{2})-(.*)$/, '/blog/$1/$2/$3/$4'); // Format URL
      
      // Extract ID from filename
      const id = filename.replace(/^\d{4}-\d{2}-\d{2}-(.*)\.mdx?$/, '$1');
      
      return {
        id,
        title: data.title || 'Untitled',
        date: formattedDate || 'Unknown date',
        excerpt: data.description || extractExcerpt(content),
        url: urlPath,
        authors: data.authors || []
      };
    });
    
    // Sort by date (newest first)
    return posts.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB.getTime() - dateA.getTime();
    });
  } catch (error) {
    console.error('Error reading blog posts:', error);
    return [];
  }
}

/**
 * Get blog posts by author
 */
export function getBlogPostsByAuthor(authorKey: string): BlogPost[] {
  const allPosts = getAllBlogPosts();
  return allPosts.filter(post => 
    post.authors && post.authors.includes(authorKey)
  );
}
