import React, { JSX } from "react";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import { useAuthorsData } from "../../utils/authorsData";
import { BlogPost, useBlogPosts } from "../../utils/authorPosts";
import styles from "./authors.module.css";
import { Location, Company, Email, Contact, Github, Linkedin, StackOverflow, TwitterX, Website, Phone } from "@asafarim/shared-ui-react";

// Define props interface for type safety
interface AuthorProfileProps {
  authorKey: string;
}

// This component will be used to display any author's profile based on the URL parameter
export default function AuthorProfile({
  authorKey,
}: AuthorProfileProps): JSX.Element {

  // Get authors data from our hook
  const authorsData = useAuthorsData();

  // Get the specific author by key
  const author = authorsData[authorKey] || null;
  console.log("Author:", author);

  // Get all blog posts using the hook
  const allBlogPosts = useBlogPosts();

  // Filter posts by author
  const blogPosts = allBlogPosts.filter(
    (post: BlogPost) =>
      post.frontMatter.authors && post.frontMatter.authors.includes(authorKey)
  );

  // If author not found, show error message
  if (!author) {
    return (
      <Layout
        title="Author Not Found"
        description="The requested author profile could not be found"
      >
        <main className="container margin-vert--lg">
          <div className="row">
            <div className="col col--6 col--offset-3">
              <h1>Author Not Found</h1>
              <p>The author you're looking for doesn't exist in our records.</p>
              <Link to="/authors">View all authors</Link>
            </div>
          </div>
        </main>
      </Layout>
    );
  }

  return (
    <Layout
      title={`${author.name} | Author Profile`}
      description={`Author profile for ${author.name} - ${author.title}`}
    >
      <main className="container margin-vert--lg">
        <div className={styles.authorProfileContainer}>
          {/* Left Panel - Author Info Card */}
          <div className={styles.authorInfoPanel}>
            <div style={{ textAlign: "center" }}>
              <img
                src={author.image_url}
                alt={author.name}
                className={styles.authorAvatar}
              />
              <h1 className={styles.authorName}>{author.name}</h1>
              <p className={styles.authorTitle}>{author.title}</p>
            </div>

            <p className={styles.authorBio}>{author.bio}</p>

            <div className={styles.authorDetail}>
              <Company /> {author.company}
            </div>

            <div className={styles.authorDetail}>
              <Location /> {author.location}
            </div>
            {author.email && !author.contact && (
              <div className={styles.authorDetail}>
                <Email /> {author.email}
              </div>
            )}

            {author.contact && (
              <div className={styles.authorDetail}>
                <Contact /> <a href={author.contact}>Contact Page</a>
              </div>
            )}

            <div className={styles.authorSocialLinks}>
              {author.urls &&
                author.urls.map((url, index) => {
                  let icon = null;
                  let ariaLabel = "";

                  if (url.includes("github.com")) {
                    icon = <Github />;
                    ariaLabel = "GitHub";
                  } else if (url.includes("linkedin.com")) {
                    icon = <Linkedin />;
                    ariaLabel = "LinkedIn";
                  } else if (url.includes("stackoverflow.com")) {
                    icon = <StackOverflow />;
                    ariaLabel = "StackOverflow";
                  } else if (url.includes("x.com")) {
                    icon = <TwitterX />;
                    ariaLabel = "X";
                  } else if (url.includes("mailto:")) {
                    icon = <Email />;
                    ariaLabel = "Email";
                  } else if (url.includes("tel:")) {
                    icon = <Phone />;
                    ariaLabel = "Phone";
                  } else {
                    icon = <Website />;
                    ariaLabel = "Personal Website";
                  }

                  return (
                    <a
                      key={index}
                      href={url}
                      className={styles.authorSocialLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={ariaLabel}
                    >
                      {icon}
                    </a>
                  );
                })}
            </div>           
          </div>
          {/* Right Panel - Author's Blog Posts */}
          <div className={styles.authorPostsPanel}>
            <h2 className="menu__link">Blog Posts by {author.name}</h2>
            {blogPosts?.length > 0 ? (
              <ul className={styles.authorPostsList}>
                {blogPosts.map((post) => (
                  <li key={post.id} className={styles.authorPostItem}>
                    <h3 className={styles.authorPostTitle}>
                      <Link to={post.permalink}>{post.title}</Link>
                    </h3>
                    <span className={styles.authorPostDate}>{post.date}</span>
                    <p className={styles.authorPostExcerpt}>{post.excerpt}</p>
                    <Link
                      to={post.permalink}
                      className={styles.authorPostReadMore}
                    >
                      Read More →
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No blog posts found for this author.</p>
            )}
          </div>
        </div>
      </main>
    </Layout>
  );
}
