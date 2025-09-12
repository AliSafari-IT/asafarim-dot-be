import React, { Children } from "react";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import { usePluginData } from "@docusaurus/useGlobalData";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import { useAuthorsData, Author } from "../../utils/authorsData";
import { BlogPost, useBlogPosts } from "../../utils/authorPosts";
import styles from "./authors.module.css";

// Icons for author details
const LocationIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    fill="currentColor"
    viewBox="0 0 16 16"
    className={styles.authorDetailIcon}
  >
    <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 </div></div>6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z" />
  </svg>
);

const CompanyIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    fill="currentColor"
    viewBox="0 0 16 16"
    className={styles.authorDetailIcon}
  >
    <path d="M8.707 1.5a1 1 0 0 0-1.414 0L.646 8.146a.5.5 0 0 0 .708.708L8 2.207l6.646 6.647a.5.5 0 0 0 .708-.708L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293L8.707 1.5Z" />
    <path d="m8 3.293 6 6V13.5a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 13.5V9.293l6-6Z" />
  </svg>
);

const EmailIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    fill="currentColor"
    viewBox="0 0 16 16"
    className={styles.authorDetailIcon}
  >
    <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4Zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2Zm13 2.383-4.708 2.825L15 11.105V5.383Zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741ZM1 11.105l4.708-2.897L1 5.383v5.722Z" />
  </svg>
);

const ContactIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    fill="currentColor"
    viewBox="0 0 16 16"
    className={styles.authorDetailIcon}
  >
    <path d="M3.654 1.328a.678.678 0 0 0-1.015-.063L1.605 2.3c-.483.484-.661 1.169-.45 1.77a17.568 17.568 0 0 0 4.168 6.608 17.569 17.569 0 0 0 6.608 4.168c.601.211 1.286.033 1.77-.45l1.034-1.034a.678.678 0 0 0-.063-1.015l-2.307-1.794a.678.678 0 0 0-.58-.122l-2.19.547a1.745 1.745 0 0 1-1.657-.459L5.482 8.062a1.745 1.745 0 0 1-.46-1.657l.548-2.19a.678.678 0 0 0-.122-.58L3.654 1.328zM1.884.511a1.745 1.745 0 0 1 2.612.163L6.29 2.98c.329.423.445.974.315 1.494l-.547 2.19a.678.678 0 0 0 .178.643l2.457 2.457a.678.678 0 0 0 .644.178l2.189-.547a1.745 1.745 0 0 1 1.494.315l2.306 1.794c.829.645.905 1.87.163 2.611l-1.034 1.034c-.74.74-1.846 1.065-2.877.702a18.634 18.634 0 0 1-7.01-4.42 18.634 18.634 0 0 1-4.42-7.009c-.362-1.03-.037-2.137.703-2.877L1.885.511z" />
  </svg>
);

// Social media icons
const GithubIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    fill="currentColor"
    viewBox="0 0 16 16"
  >
    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
  </svg>
);

const LinkedinIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    fill="currentColor"
    viewBox="0 0 16 16"
  >
    <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016a5.54 5.54 0 0 1 .016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4z" />
  </svg>
);

const WebsiteIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    fill="currentColor"
    viewBox="0 0 16 16"
  >
    <path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm7.5-6.923c-.67.204-1.335.82-1.887 1.855A7.97 7.97 0 0 0 5.145 4H7.5V1.077zM4.09 4a9.267 9.267 0 0 1 .64-1.539 6.7 6.7 0 0 1 .597-.933A7.025 7.025 0 0 0 2.255 4H4.09zm-.582 3.5c.03-.877.138-1.718.312-2.5H1.674a6.958 6.958 0 0 0-.656 2.5h2.49zM4.847 5a12.5 12.5 0 0 0-.338 2.5H7.5V5H4.847zM8.5 5v2.5h2.99a12.495 12.495 0 0 0-.337-2.5H8.5zM4.51 8.5a12.5 12.5 0 0 0 .337 2.5H7.5V8.5H4.51zm3.99 0V11h2.653c.187-.765.306-1.608.338-2.5H8.5zM5.145 12c.138.386.295.744.468 1.068.552 1.035 1.218 1.65 1.887 1.855V12H5.145zm.182 2.472a6.696 6.696 0 0 1-.597-.933A9.268 9.268 0 0 1 4.09 12H2.255a7.024 7.024 0 0 0 3.072 2.472zM3.82 11a13.652 13.652 0 0 1-.312-2.5h-2.49c.062.89.291 1.733.656 2.5H3.82zm6.853 3.472A7.024 7.024 0 0 0 13.745 12H11.91a9.27 9.27 0 0 1-.64 1.539 6.688 6.688 0 0 1-.597.933zM8.5 12v2.923c.67-.204 1.335-.82 1.887-1.855.173-.324.33-.682.468-1.068H8.5zm3.68-1h2.146c.365-.767.594-1.61.656-2.5h-2.49a13.65 13.65 0 0 1-.312 2.5zm2.802-3.5a6.959 6.959 0 0 0-.656-2.5H12.18c.174.782.282 1.623.312 2.5h2.49zM11.27 2.461c.247.464.462.98.64 1.539h1.835a7.024 7.024 0 0 0-3.072-2.472c.218.284.418.598.597.933zM10.855 4a7.966 7.966 0 0 0-.468-1.068C9.835 1.897 9.17 1.282 8.5 1.077V4h2.355z" />
  </svg>
);

const StackOverflowIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    fill="currentColor"
    viewBox="0 0 16 16"
  >
    <path d="M12.658 14.577v-4.27h1.423V16H1.23v-5.693h1.42v4.27h10.006zm-8.583-1.423h7.16V11.73h-7.16v1.424zm.173-3.948l6.987 1.465.294-1.398L4.272 7.81l-.294 1.396zm.861-3.295l6.47 3.016.585-1.258-6.47-3.016-.585 1.258zm1.723-3.143L10.238 5.13l.88-1.058-4.53-3.77-.88 1.058z" />
  </svg>
);

const TwitterXIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    fill="currentColor"
    viewBox="0 0 16 16"
  >
    <path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.846-5.007-4.425 5.007H.84l5.733-6.57L0 .75h5.063l3.474 4.385L12.6.75Zm-.86 13.028h1.36L4.323 2.145H2.865l8.875 11.633Z" />
  </svg>
);

// Define props interface for type safety
interface AuthorProfileProps {
  authorKey: string;
}

// This component will be used to display any author's profile based on the URL parameter
export default function AuthorProfile({
  authorKey,
}: AuthorProfileProps): JSX.Element {
  const { siteConfig } = useDocusaurusContext();

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
              <CompanyIcon /> {author.company}
            </div>

            <div className={styles.authorDetail}>
              <LocationIcon /> {author.location}
            </div>
            {author.email && !author.contact && (
              <div className={styles.authorDetail}>
                <EmailIcon /> {author.email}
              </div>
            )}

            {author.contact && (
              <div className={styles.authorDetail}>
                <ContactIcon /> <a href={author.contact}>Contact Page</a>
              </div>
            )}

            <div className={styles.authorSocialLinks}>
              {author.urls &&
                author.urls.map((url, index) => {
                  let icon = null;
                  let ariaLabel = "";

                  if (url.includes("github.com")) {
                    icon = <GithubIcon />;
                    ariaLabel = "GitHub";
                  } else if (url.includes("linkedin.com")) {
                    icon = <LinkedinIcon />;
                    ariaLabel = "LinkedIn";
                  } else if (url.includes("stackoverflow.com")) {
                    icon = <StackOverflowIcon />;
                    ariaLabel = "StackOverflow";
                  } else if (url.includes("x.com")) {
                    icon = <TwitterXIcon />;
                    ariaLabel = "X";
                  } else {
                    icon = <WebsiteIcon />;
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
            <h2>Blog Posts by {author.name}</h2>
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
