import React from "react";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import { useAuthorsData, Author } from "../../utils/authorsData";
import styles from "./authors.module.css";

export default function AuthorsPage() {
  const { siteConfig } = useDocusaurusContext();

  // Get authors data using the hook
  const authorsData = useAuthorsData();

  // Convert to array with keys included
  const authors = Object.entries(authorsData).map(([key, data]) => ({
    key,
    ...(data as Author),
  }));

  return (
    <Layout title="Authors" description="Blog authors at ASafariM">
      <main className="container margin-vert--lg">
        <h1>Blog Authors</h1>
        <div className={styles.authorsGrid}>
          {authors.map((author) => (
            <div key={author.key} className={styles.authorCard}>
              <Link
                to={`/authors/${author.key}`}
                className={styles.authorCardLink}
              >
                <div className={styles.authorCardContent}>
                  <img
                    src={author.image_url}
                    alt={author.name}
                    className={styles.authorAvatar}
                  />
                  <h2 className={styles.authorName}>{author.name}</h2>
                  <p className={styles.authorTitle}>{author.title}</p>
                </div>
              </Link>
              <div className={styles.authorBio}>
                <p>{author?.bio}</p>
              </div>
              <div className={styles.authorLinks}>
                <Link
                  to={`/authors/${author.key}`}
                  className={styles.authorLink}
                >
                  View Profile
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>
    </Layout>
  );
}
