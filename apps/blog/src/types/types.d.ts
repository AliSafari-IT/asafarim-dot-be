// apps/blog/src/types/types.d.ts
declare module '@docusaurus/plugin-content-blog/client' {
    export interface BlogPost {
      id: string;
      metadata: {
        permalink: string;
        title: string;
        description: string;
        date: string;
        formattedDate: string;
        readingTime?: number;
      };
    }
  
    export default function useBlogPosts(): {
      posts: BlogPost[];
    };
  }