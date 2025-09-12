import { usePluginData } from '@docusaurus/useGlobalData';

// Define the Author interface
export interface Author {
  name: string;
  title: string;
  urls: string[];
  image_url: string;
  email: string;
  company: string;
  location: string;
  bio: string;
  contact: string;
  key?: string; // Added when returning from getAllAuthors
}

// Define an interface for the plugin data structure
interface DocusaurusPluginData {
  posts?: any[];
  authors?: Record<string, Author>;
}

// This is a fallback for when the data isn't available yet
// This is used during static site generation or when the plugin data isn't loaded
const fallbackAuthorsData: Record<string, Author> = {
  alisafari: {
    key: 'alisafari',
    name: 'Ali Safari',
    title: 'Full-Stack Software Engineer | Clean Architecture | AI & Data Enthusiast',
    urls: ['https://alisafarim.com',
      'https://github.com/AliSafari-IT',
      'https://www.linkedin.com/in/ali-safari-m/',
      'https://stackoverflow.com/users/10703628/ali-safari',
      'https://x.com/asafarim'
    ],
    image_url: '/img/authors/ali-photo.jpg',
    email: 'alisafari@asafarim.com',
    company: 'ASafariM',
    location: 'Hasselt, Belgium',
    bio: 'A passionate software engineer with a deep love for coding and problem-solving.',
    contact: 'https://www.asafarim.com/contact',
  },
};

/**
 * Hook to get authors data from Docusaurus blog plugin
 * @returns The authors data from the blog plugin or fallback data if not available
 */
export function useAuthorsData(): Record<string, Author> {
  try {
    // Ensure we're in a browser environment
    if (typeof window === 'undefined') {
      console.warn('useAuthorsData: Not in browser environment, returning fallback');
      return fallbackAuthorsData;
    }

    // Try to get authors data from the blog plugin
    const globalData = window.__DOCUSAURUS__?.globalData;

    if (!globalData) {
      console.warn('useAuthorsData: No global data found');
      return fallbackAuthorsData;
    }

    // Try different plugin data sources with type casting
    const blogPluginData = globalData['docusaurus-plugin-content-blog']?.default as DocusaurusPluginData | undefined;
    const pagesPluginData = globalData['docusaurus-plugin-content-pages']?.default as DocusaurusPluginData | undefined;
    const docsPluginData = globalData['docusaurus-plugin-content-docs']?.default as DocusaurusPluginData | undefined;

    // Log raw plugin data for debugging
    console.log('Blog Plugin Data:', blogPluginData);
    console.log('Pages Plugin Data:', pagesPluginData);
    console.log('Docs Plugin Data:', docsPluginData);

    // Attempt to extract authors from blog or pages plugin
    const authorsData =
      (blogPluginData?.authors || pagesPluginData?.authors || {}) as Record<string, Author>;

    if (Object.keys(authorsData).length > 0) {
      console.log("Found authors data:", authorsData);
      return authorsData;
    } else {
      console.warn('useAuthorsData: No authors data found in plugins');
      return fallbackAuthorsData;
    }
  } catch (e) {
    console.error('Error retrieving authors data:', e);
    return fallbackAuthorsData;
  }
}

/**
 * Get a specific author by key
 * @param authorKey The key of the author to retrieve
 * @returns The author object or null if not found
 */
export function getAuthor(authorKey: string): Author | null {
  // For server-side rendering and static site generation
  return fallbackAuthorsData[authorKey] || null;
}

/**
 * Get all authors with their keys
 * @returns An array of all authors with their keys included
 */
export function getAllAuthors(): Author[] {
  // For server-side rendering and static site generation
  return Object.entries(fallbackAuthorsData).map(([key, data]) => ({
    key,
    ...data as Author,
  }));
}

// Export the fallback data as default for static site generation
export default fallbackAuthorsData;
