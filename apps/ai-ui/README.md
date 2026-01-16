# AI UI - Intelligent Career Assistant

> A modern React-based web application providing AI-powered career tools including chat assistance, resume generation, and job application optimization.

[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.1-646CFF.svg)](https://vitejs.dev/)

## 🚀 Features

### 🤖 AI Chat Assistant

- Real-time conversational AI powered by OpenAI
- Session management with persistent chat history
- Context-aware responses for career-related queries
- Markdown rendering for formatted responses

### 📝 Resume Maker

- AI-powered resume generation from detailed CVs
- Functional resume format optimization
- Professional templates and suggestions
- Export capabilities (PDF/Canvas)

### 💼 Job Tools

- **Job Description Analysis**: Extract key requirements and keywords from job postings
- **Skills Matching**: Calculate compatibility scores between candidate skills and job requirements
- **Cover Letter Generator**: Create tailored cover letters with AI assistance
- Professional tone and formatting

## 🏗️ Architecture

### Tech Stack

- **Frontend Framework**: React 18.3 with TypeScript
- **Build Tool**: Vite 7.1
- **Routing**: React Router DOM 6.30
- **Styling**: CSS with Design Tokens (@asafarim/design-tokens)
- **Animations**: Framer Motion 12.23
- **Markdown**: React Markdown with GFM support
- **UI Components**: Shared UI library (@asafarim/shared-ui-react)
- **Theming**: React Themes (@asafarim/react-themes)
- **Internationalization**: Shared i18n (@asafarim/shared-i18n)
- **Notifications**: Custom Toast system (@asafarim/toast)

### Project Structure

```
ai-ui/
├── src/
│   ├── api/              # API client utilities
│   ├── components/       # Reusable UI components
│   │   ├── Navbar.tsx
│   │   ├── Hero.tsx
│   │   ├── ToolCard.tsx
│   │   └── ChatSessionList.tsx
│   ├── pages/            # Route pages
│   │   ├── Home.tsx
│   │   ├── chat/         # Chat feature
│   │   │   ├── ChatPage.tsx
│   │   │   ├── MessageBubble.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── TypingIndicator.tsx
│   │   ├── JobTools.tsx
│   │   └── ResumeMaker.tsx
│   ├── theme/            # Theme configuration
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Utility functions
│   ├── App.tsx           # Main application component
│   └── main.tsx          # Application entry point
├── public/               # Static assets
├── dist/                 # Production build output
└── vite.config.ts        # Vite configuration
```

## 🛠️ Installation

### Prerequisites

- Node.js 18+ and pnpm
- Access to the AI API backend (see `/apis/Ai.Api`)

### Setup

1. **Install dependencies**:

   ```bash
   pnpm install
   ```

2. **Configure environment variables**:
   Create a `.env` file in the root directory:

   ```env
   VITE_AI_API_BASE=http://ai.asafarim.local:5103
   VITE_IDENTITY_API_URL=http://identity.asafarim.local:5101/api
   VITE_AUTH_API_BASE=http://core.asafarim.local:5100/api
   VITE_IS_PRODUCTION=false
   ```

3. **Start development server**:

   ```bash
   pnpm dev
   # or
   pnpm start  # Runs on ai.asafarim.local:5173
   ```

4. **Build for production**:

   ```bash
   pnpm build
   ```

5. **Preview production build**:

   ```bash
   pnpm preview
   ```

## 🔧 Development

### Available Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start development server on default port |
| `pnpm start` | Start development server on ai.asafarim.local:5173 |
| `pnpm build` | Build for production (TypeScript + Vite) |
| `pnpm lint` | Run ESLint |
| `pnpm preview` | Preview production build |

### Code Quality

- **TypeScript**: Strict type checking enabled
- **ESLint**: Configured with React and TypeScript rules
- **Code Style**: Follows React best practices

## 🌐 API Integration

The application communicates with the AI API backend through the `api.ts` module:

```typescript
import { aiApi } from './api';

// Example: Send chat message
const response = await aiApi<ChatResponse>('/chat', {
  method: 'POST',
  body: JSON.stringify({ message: 'Hello', sessionId: '...' })
});
```

### API Endpoints Used

- `POST /chat` - Send chat messages
- `GET /chat-sessions` - Retrieve chat sessions
- `POST /resume/functional` - Generate functional resume
- `POST /extract/job` - Extract job requirements
- `POST /score/match` - Calculate skills match score
- `POST /generate/cover-letter` - Generate cover letter

## 🎨 Theming

The application uses a comprehensive design token system:

- **Colors**: Semantic color scales (primary, success, warning, danger, info)
- **Typography**: Font families, sizes, weights, and line heights
- **Spacing**: Consistent spacing scale (0-16)
- **Motion**: Standardized transitions and animations
- **Shadows**: Elevation system for depth

Theme switching is handled automatically based on system preferences or user selection.

## 📦 Workspace Dependencies

This application is part of a monorepo and uses shared workspace packages:

- `@asafarim/design-tokens` - Design system tokens
- `@asafarim/react-themes` - Theme provider and utilities
- `@asafarim/shared-ui-react` - Shared React components
- `@asafarim/shared-i18n` - Internationalization utilities
- `@asafarim/toast` - Toast notification system

## 🚢 Deployment

### Production Build

```bash
pnpm build
```

The build output will be in the `dist/` directory, ready for deployment to any static hosting service.

### Environment Configuration

For production deployment, ensure the following environment variables are set:

```env
VITE_IS_PRODUCTION=true
VITE_AI_API_BASE=https://ai.asafarim.be/api/ai
VITE_IDENTITY_API_URL=https://identity.asafarim.be/api
VITE_AUTH_API_BASE=https://core.asafarim.be/api
```

## 🔐 Authentication

The application supports JWT-based authentication:

- Tokens are stored in HTTP-only cookies (`atk`)
- Credentials are included in API requests
- Integration with Identity API for user management

## 🐛 Troubleshooting

### Common Issues

1. **API Connection Errors**
   - Verify the AI API backend is running
   - Check `VITE_AI_API_BASE` environment variable
   - Ensure CORS is properly configured on the backend

2. **Build Errors**
   - Clear `node_modules` and reinstall: `pnpm install`
   - Clear Vite cache: `rm -rf node_modules/.vite`

3. **TypeScript Errors**
   - Rebuild workspace packages: `pnpm -r build`
   - Check `tsconfig.json` configuration

## 📄 License

Part of the asafarim.be monorepo. All rights reserved.

## 🤝 Contributing

This is a private monorepo project. For internal development guidelines, see the main repository documentation.

## 📞 Support

For issues or questions, contact the development team or create an issue in the repository.

---

**Version**: 0.5.0  
**Last Updated**: December 2025
