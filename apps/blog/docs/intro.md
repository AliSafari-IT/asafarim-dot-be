---
sidebar_position: 1
---

# ASafariM Blog

This is the official blog for the ASafariM project, a modern, enterprise-grade full-stack application built with .NET 8 and React TypeScript, utilizing multiple APIs for authentication, data management and AI integration.

## Getting Started

### Prerequisites

- Node.js version 18.0 or above
- pnpm package manager

### Installation

```bash
# Clone the repository
git clone https://github.com/asafarim-dot-be.git
cd apps/blog

# Install dependencies
pnpm install
```

### Local Development

```bash
# Start the development server
pnpm start
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

### Build

```bash
# Build the static site
pnpm run build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

### Deployment

```bash
# Deploy to GitHub Pages
pnpm run deploy
```

If you are using GitHub pages for hosting, this command is a convenient way to build the website and push to the `gh-pages` branch.

## Project Structure

- `/blog/` - Contains the blog posts
- `/docs/` - Contains the documentation
- `/src/` - Contains the React components and pages
- `/static/` - Contains static assets like images
- `/docusaurus.config.ts` - Main configuration file
- `/sidebars.ts` - Configuration for documentation sidebar

## License

This project is licensed under the MIT License - see the LICENSE file for details.
