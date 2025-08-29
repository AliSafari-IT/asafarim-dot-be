# Core App

This application provides core functionality for the ASafariM platform, built with React, TypeScript, and Vite.

## Features

### Job Tracker

The Job Tracker feature allows users to manage their job applications with the following capabilities:

- View all job applications in a table format
- Add new job applications with company, role, status, and other details
- Edit existing job applications
- Delete job applications
- Track application status (Applied, Interview, Offer, Rejected)

#### Components

- `JobTracker`: Main container component that manages state between list and form views
- `JobList`: Displays all job applications in a table with actions
- `JobForm`: Form for adding and editing job applications
- `JobStatusBadge`: Visual indicator for application status

#### API Integration

The Job Tracker connects to the Core.Api backend with the following endpoints:

- `GET /api/JobApplications`: Fetch all job applications
- `GET /api/JobApplications/{id}`: Fetch a specific job application
- `POST /api/JobApplications`: Create a new job application
- `PUT /api/JobApplications/{id}`: Update an existing job application
- `DELETE /api/JobApplications/{id}`: Delete a job application

#### Setup and Configuration

1. Ensure Core.Api is running on port 5102
2. The frontend expects the API at `http://localhost:5102/api/JobApplications`
3. CORS is configured to allow requests from `http://core.asafarim.local:5174` and `http://localhost:5174`

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
