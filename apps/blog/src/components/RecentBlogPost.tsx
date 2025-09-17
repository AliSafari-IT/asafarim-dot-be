import React from 'react';
import type { BlogPost } from '@docusaurus/plugin-content-blog/client';
import styles from './HeroMedia.module.css';

const RecentBlogPost = ({ post }: { post: BlogPost }) => {
    const { metadata } = post;
    const formattedDate = metadata.formattedDate || 
        new Date(metadata.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    const readingTime = metadata.readingTime ? Math.round(metadata.readingTime) : 1;

    return (
        <a href={metadata.permalink} className={styles.card}>
            <div>
                <h3 className={styles.cardTitle}>{metadata.title}</h3>
            </div>
            <div>
                <p>{metadata.description}</p>
            </div>
            <div className={styles.cardMeta}>
                <p>{formattedDate} · {readingTime} min read</p>
            </div>
        </a>
    );
};

export default RecentBlogPost;