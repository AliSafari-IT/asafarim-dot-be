import React from 'react';
import type { BlogPost } from '@docusaurus/plugin-content-blog/client';
import RecentBlogPost from './RecentBlogPost';
import styles from './HeroMedia.module.css';

interface RecentBlogPostsProps {
    nrPosts: number;
    posts?: BlogPost[];
}

const RecentBlogPosts = ({ nrPosts, posts = [] }: RecentBlogPostsProps) => {
    const recentPosts = Array.from(posts).slice(0, nrPosts);

    if (recentPosts.length === 0) {
        return null;
    }

    return (
        <div className={styles.media}>
            <h1>Recent Blog Posts</h1>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
                {recentPosts.map((post, index) => (
                    <RecentBlogPost key={post.id || index} post={post} />
                ))}
            </div>
        </div>
    );
};

export default RecentBlogPosts;