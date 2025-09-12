import { usePluginData } from '@docusaurus/useGlobalData';

// Define the BlogPost interface
export interface BlogPost {
  id: string;
  title: string;
  date: string | number | Date;
  description: string;
  excerpt: string;
  permalink: string;
  frontMatter: {
    authors: string[];
  };
}
/**
 * Hook to get all blog posts from Docusaurus or fallback to sample data
 */
export function useBlogPosts() {
  try {
    // Try to access blog data using the new plugin ID
    const blogData = usePluginData('docusaurus-plugin-content-blog') as any;

    // If we have valid blog data with posts, use it
    if (blogData && Array.isArray(blogData.posts) && blogData.posts.length > 0) {
      console.log("Found blog posts from plugin:", blogData.posts.length);

      // Transform the blog data into our BlogPost format
      return blogData.posts.map((post: BlogPost) => ({
        id: post.id,
        title: post.title,
        date: new Date(post.date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        excerpt: post.description || post.excerpt,
        permalink: post.permalink,
        frontMatter: {
          authors: post.frontMatter?.authors || []
        }
      }));
    }
  } catch (error) {
    console.log("Error accessing blog data, using sample data", error);
  }

  // If we couldn't get blog data or there was an error, use sample data
  return getSampleBlogPosts();
}

/**
 * Get sample blog posts for testing and fallback
 */
export function getSampleBlogPosts(): BlogPost[] {
  // Sample blog posts by author
  const sampleBlogPosts: Record<string, BlogPost[]> = {
    alisafari: [
      {
        id: 'critique-issues-windsurf',
        title: 'My Frustrating Journey with Windsurf AI: A Critical Analysis',
        date: 'April 8, 2025',
        excerpt: 'As a recent purchaser of the Codeium Pro Ultimate subscription from Windsurf, I embarked on a journey to leverage cutting-edge AI-assisted coding technologies...',
        permalink: '/blog/2025/04/08/critique-issues-windsurf',
        frontMatter: {
          authors: ['alisafari', 'asafarim']
        },
        description: 'As a recent purchaser of the Codeium Pro Ultimate subscription from Windsurf, I embarked on a journey to leverage cutting-edge AI-assisted coding technologies...'
      },
      {
        id: 'creating-angular-portfolio-builder',
        title: 'Building a Portfolio Builder Kit with Angular 19 & .NET 9',
        date: 'April 1, 2025',
        excerpt: 'Learn how to create a modern portfolio builder application using the latest Angular 19 and .NET 9 technologies...',
        permalink: '/blog/2025/04/01/creating-angular-portfolio-builder',
        frontMatter: {
          authors: ['alisafari']
        },
        description: 'Learn how to create a modern portfolio builder application using the latest Angular 19 and .NET 9 technologies...'
      },
      {
        id: 'welcome-to-asafarim-blog',
        title: 'Welcome to ASafariM Blog',
        date: 'March 21, 2025',
        excerpt: 'Welcome to my technical blog where I share insights about software development, clean architecture, and AI technologies...',
        permalink: '/blog/2025/03/21/welcome-to-asafarim-blog',
        frontMatter: {
          authors: ['alisafari', 'asafarim']
        },
        description: 'Welcome to my technical blog where I share insights about software development, clean architecture, and AI technologies...'
      }
    ],
    asafarim: [
      {
        id: 'welcome-to-asafarim-blog',
        title: 'Welcome to ASafariM Blog',
        date: 'March 21, 2025',
        excerpt: 'Welcome to my technical blog where I share insights about software development, clean architecture, and AI technologies...',
        permalink: '/blog/2025/03/21/welcome-to-asafarim-blog',
        frontMatter: {
          authors: ['alisafari', 'asafarim']
        },
        description: 'Welcome to my technical blog where I share insights about software development, clean architecture, and AI technologies...'
      },
      {
        id: 'lab-automation-benefits',
        title: 'Some general benefits of lab automation',
        date: 'May 12, 2023',
        excerpt: 'Exploring the various benefits that lab automation brings to scientific research and development...',
        permalink: '/blog/2023/05/12/lab-automation-benefits',
        frontMatter: {
          authors: ['asafarim']
        },
        description: 'Exploring the various benefits that lab automation brings to scientific research and development...'
      },
      {
        id: 'start-post',
        title: 'Start Post',
        date: 'June 16, 2021',
        excerpt: 'My first blog post about software development and technology...',
        permalink: '/blog/2021/06/16/start-post',
        frontMatter: {
          authors: ['asafarim']
        },
        description: 'My first blog post about software development and technology...'
      }
    ]
  };

  // Combine all posts from all authors
  const allPosts: BlogPost[] = [];

  Object.values(sampleBlogPosts).forEach(authorPosts => {
    authorPosts.forEach(post => {
      // Check if post is already in the list (to avoid duplicates)
      if (!allPosts.some(p => p.id === post.id)) {
        allPosts.push(post);
      }
    });
  });

  // Sort by date (newest first)
  return allPosts.sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateB.getTime() - dateA.getTime();
  });
}

/**
 * Get all blog posts
 * 
 * Note: This is a client component function that uses the useBlogPosts hook.
 * It should be used within a React component.
 */
export function getAllBlogPosts(): BlogPost[] {
  try {
    // This is a fallback for when the function is called outside of a React component
    // In a real implementation, you would use the useBlogPosts hook directly in your component
    const posts = typeof window !== 'undefined' ?
      window.__DOCUSAURUS__?.globalData?.['docusaurus-plugin-content-blog']?.default?.posts || [] :
      [];
    console.log("Blog posts:", posts);

    if (posts.length === 0) {
      return getSampleBlogPosts();
    }

    return posts.map(post => ({
      id: post.id,
      title: post.title,
      date: new Date(post.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      description: post.description || post.excerpt,
      excerpt: post.description || post.excerpt,
      permalink: post.permalink,
      frontMatter: {
        authors: post.frontMatter?.authors || []
      }
    }));
  } catch (error) {
    console.error('Error getting blog posts:', error);
    return getSampleBlogPosts();
  }
}

/**
 * Get blog posts by author
 * 
 * @param authorKey The key of the author to get posts for
 * @returns An array of blog posts by the specified author
 */
export function getBlogPostsByAuthor(authorKey: string): BlogPost[] {
  const allPosts = getAllBlogPosts();
  console.log("All blog posts:", allPosts);
  const authorPosts = allPosts.filter(post =>
    post.frontMatter?.authors && post.frontMatter.authors.includes(authorKey)
  );

  return authorPosts;
}

// Add this for TypeScript to recognize the global Docusaurus object
declare global {
  interface Window {
    __DOCUSAURUS__?: {
      globalData?: {
        [key: string]: {
          default?: {
            posts: any[];
          };
        };
      };
    };
  }
}
