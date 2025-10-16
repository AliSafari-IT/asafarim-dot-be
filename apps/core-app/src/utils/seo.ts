interface PageMetaOptions {
  title: string;
  description?: string;
  author?: string;
  keywords?: string[];
  image?: string;
  url?: string;
}

/**
 * Updates page meta tags for SEO and social sharing
 */
export const updatePageMeta = (options: PageMetaOptions): void => {
  const { title, description, author, keywords, image, url } = options;

  // Update document title
  document.title = title;

  // Helper to update or create meta tag
  const setMetaTag = (name: string, content: string, isProperty = false) => {
    const attribute = isProperty ? 'property' : 'name';
    let element = document.querySelector(`meta[${attribute}="${name}"]`);
    
    if (!element) {
      element = document.createElement('meta');
      element.setAttribute(attribute, name);
      document.head.appendChild(element);
    }
    
    element.setAttribute('content', content);
  };

  // Standard meta tags
  if (description) {
    setMetaTag('description', description);
  }

  if (author) {
    setMetaTag('author', author);
  }

  if (keywords && keywords.length > 0) {
    setMetaTag('keywords', keywords.join(', '));
  }

  // Open Graph tags (Facebook, LinkedIn)
  setMetaTag('og:title', title, true);
  if (description) {
    setMetaTag('og:description', description, true);
  }
  if (image) {
    setMetaTag('og:image', image, true);
  }
  if (url) {
    setMetaTag('og:url', url, true);
  }
  setMetaTag('og:type', 'website', true);

  // Twitter Card tags
  setMetaTag('twitter:card', 'summary_large_image');
  setMetaTag('twitter:title', title);
  if (description) {
    setMetaTag('twitter:description', description);
  }
  if (image) {
    setMetaTag('twitter:image', image);
  }
};

/**
 * Generates structured data (JSON-LD) for a person/portfolio
 */
export const generatePersonSchema = (portfolio: {
  displayName: string;
  headline?: string;
  bio?: string;
  profileImageUrl?: string;
  contact?: {
    email?: string;
    location?: string;
  };
  workExperiences?: Array<{
    company: string;
    position: string;
    startDate: string;
    endDate?: string;
  }>;
}): string => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: portfolio.displayName,
    ...(portfolio.headline && { jobTitle: portfolio.headline }),
    ...(portfolio.bio && { description: portfolio.bio }),
    ...(portfolio.profileImageUrl && { image: portfolio.profileImageUrl }),
    ...(portfolio.contact?.email && { email: portfolio.contact.email }),
    ...(portfolio.contact?.location && { address: portfolio.contact.location }),
    ...(portfolio.workExperiences && portfolio.workExperiences.length > 0 && {
      worksFor: portfolio.workExperiences.map(exp => ({
        '@type': 'Organization',
        name: exp.company,
      })),
    }),
  };

  return JSON.stringify(schema);
};

/**
 * Injects structured data script into the page
 */
export const injectStructuredData = (jsonLd: string): void => {
  // Remove existing structured data
  const existingScript = document.querySelector('script[type="application/ld+json"]');
  if (existingScript) {
    existingScript.remove();
  }

  // Add new structured data
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = jsonLd;
  document.head.appendChild(script);
};
