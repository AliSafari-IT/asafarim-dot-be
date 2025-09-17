// apps/blog/src/components/HeroMedia.tsx
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import RecentBlogPosts from './RecentBlogPosts';
import type { Config } from '@docusaurus/types';
import { isProduction } from '@asafarim/shared-ui-react';

export default function HeroMedia() {
  const { siteConfig } = useDocusaurusContext() as { siteConfig: Config };
  const nrRecentBlogPosts = siteConfig.customFields?.recentBlogPostsOnHomePage || "3";

  return (
    <RecentBlogPosts 
      nrPosts={parseInt(nrRecentBlogPosts as string)} 
      posts={[
        {id: "1", metadata: {permalink: isProduction ? 'https://blog.asafarim.be/blog/2025/04/10/windsurf' : '/blog/2025/04/10/windsurf', title: "Finding Value in Windsurf: A Balanced Perspective", description: "Where cautious use of Windsurf might benefit your development workflow", date: "2025-04-10", formattedDate: "April 10, 2025", readingTime: 2}},
        {id: "2", metadata: {permalink: isProduction ? 'https://blog.asafarim.be/blog/2025/04/08/critique-issues-windsurf' : '/blog/2025/04/08/critique-issues-windsurf', title: "My Frustrating Journey with Windsurf AI: A Critical Analysis", description: "As a recent purchaser of the Codeium Pro Ultimate subscription from Windsurf, I embarked on a journey to leverage cutting-edge AI-assisted coding technologies...", date: "2025-04-08", formattedDate: "April 8, 2025", readingTime: 3}},
        {id: "3", metadata: {permalink: isProduction ? 'https://blog.asafarim.be/blog/2025/03/21/welcome-to-asafarim-blog' : '/blog/2025/03/21/welcome-to-asafarim-blog', title: "Welcome to ASafariM Blog", description: "Welcome to my technical blog where I share insights about software development, clean architecture, and AI technologies...", date: "2025-03-21", formattedDate: "March 21, 2025", readingTime: 1}}
      ]} 
    />
  );
}