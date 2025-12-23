# KidCode Studio - Educational Creative Coding Playground

> A block-based creative playground where kids learn coding through art, animation, puzzles, and music. No typing required—just drag, drop, and watch your creations come to life!

[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF.svg)](https://vitejs.dev/)
[![Zustand](https://img.shields.io/badge/Zustand-5.0-brown.svg)](https://github.com/pmndrs/zustand)

## 🚀 Features

### 🎨 Creative Modes

#### 🖌️ Drawing Studio
Create digital art using code blocks:
- **Shapes**: Draw circles, squares, triangles, stars
- **Motion**: Control pen movement and rotation
- **Colors**: Set colors and brush sizes
- **Patterns**: Use "Repeat Magic" to create intricate patterns
- **Save & Share**: Store artwork locally and in cloud

#### 🎬 Story Mode
Animate characters and tell interactive stories:
- **8 Unique Characters**: Different characters with distinct personalities
- **Actions**: Walk, Jump, Wave, Say, Dance
- **Backgrounds**: Forest, Space, City, Beach, and more
- **Interactive Narratives**: Create branching stories with choices
- **Sound Effects**: Add audio to enhance storytelling

#### 🧩 Puzzle Adventures
Solve coding challenges and learn logic:
- **Maze Navigation**: Use logic blocks to navigate mazes
- **Sequential Thinking**: Learn step-by-step problem solving
- **Progressive Difficulty**: 5 difficulty levels
- **Visual Feedback**: Clear success/failure indicators
- **Hints System**: Helpful guidance without spoiling solutions

#### 🎵 Music Blocks
Compose music with visual programming:
- **Notes**: Play C, D, E, F, G, A, B notes
- **Drums**: Kick, snare, hihat, clap sounds
- **Visualizer**: Real-time music visualization
- **Piano Keyboard**: Interactive keyboard interface
- **Tempo Control**: Adjust playback speed

### 🏆 Achievement System
- **Sticker Rewards**: Earn stickers for completing activities
- **Badge Unlocking**: Unlock new content as you progress
- **Progress Tracking**: Monitor learning journey
- **Leaderboards**: Compare progress with friends
- **Milestone Celebrations**: Special rewards for major achievements

### 💾 Data Management
- **Local Storage**: IndexedDB for offline access
- **Cloud Sync**: Optional cloud backup via API
- **Project Management**: Save, load, and organize projects
- **Auto-Save**: Automatic saving of work
- **Version History**: Track project changes

### 🎓 Educational Features
- **Block-Based Programming**: Visual coding without syntax
- **Instant Feedback**: See results immediately
- **Progressive Learning**: Complexity unlocks through curiosity
- **Safe Exploration**: No wrong answers, only creative experiments
- **Guided Challenges**: Daily challenges with hints

### 🌐 Accessibility
- **Touch-Friendly**: Large buttons optimized for touch
- **Dark Mode**: Full dark mode support
- **Keyboard Navigation**: Full keyboard support
- **Screen Reader Support**: WCAG compliant
- **Multiple Languages**: Internationalization ready

## 🏗️ Architecture

### Tech Stack
- **Framework**: React 18.3 with TypeScript 5.6
- **Build Tool**: Vite 6.0
- **Routing**: React Router DOM 7.0
- **State Management**: Zustand 5.0
- **Storage**: IndexedDB (idb 8.0)
- **Icons**: Lucide React
- **Theming**: React Themes (@asafarim/react-themes)
- **UI Components**: Shared UI library (@asafarim/shared-ui-react)
- **Design Tokens**: @asafarim/design-tokens

### Project Structure
```
kidcode-studio/
├── src/
│   ├── pages/
│   │   ├── Home.tsx                   # Hub/landing page
│   │   ├── DrawingStudio.tsx          # Drawing mode
│   │   ├── StoryMode.tsx              # Animation mode
│   │   ├── PuzzleAdventures.tsx       # Puzzle mode
│   │   ├── MusicBlocks.tsx            # Music mode
│   │   └── ProjectManager.tsx         # Project management
│   ├── components/
│   │   ├── BlockEditor/
│   │   │   ├── BlockPalette.tsx       # Available blocks
│   │   │   ├── ScriptArea.tsx         # Block script area
│   │   │   └── BlockRenderer.tsx      # Block rendering
│   │   ├── Canvas/
│   │   │   ├── DrawingCanvas.tsx      # Drawing visualization
│   │   │   ├── StoryCanvas.tsx        # Story animation
│   │   │   ├── PuzzleCanvas.tsx       # Puzzle visualization
│   │   │   └── MusicVisualizer.tsx    # Music visualization
│   │   ├── Layout/
│   │   │   ├── MainLayout.tsx         # Main layout wrapper
│   │   │   ├── Header.tsx             # Header with navigation
│   │   │   └── Sidebar.tsx            # Sidebar navigation
│   │   ├── UI/
│   │   │   ├── RewardPopup.tsx        # Achievement notifications
│   │   │   ├── ProgressBar.tsx        # Progress indicators
│   │   │   └── Modal.tsx              # Modal dialogs
│   │   └── NavTabs/
│   │       └── ModeSelector.tsx       # Mode navigation
│   ├── core/
│   │   ├── interpreter/
│   │   │   ├── BlockInterpreter.ts    # Block execution engine
│   │   │   ├── DrawingEngine.ts       # Drawing operations
│   │   │   ├── StoryEngine.ts         # Story animation engine
│   │   │   ├── PuzzleEngine.ts        # Puzzle logic engine
│   │   │   └── MusicEngine.ts         # Music playback engine
│   │   └── state/
│   │       ├── store.ts               # Zustand store
│   │       ├── projectSlice.ts        # Project state
│   │       ├── progressSlice.ts       # Progress state
│   │       └── uiSlice.ts             # UI state
│   ├── services/
│   │   ├── storage.ts                 # IndexedDB operations
│   │   ├── apiClient.ts               # KidCode.Api client
│   │   ├── authService.ts             # Authentication
│   │   └── syncService.ts             # Cloud sync
│   ├── types/
│   │   ├── blocks.ts                  # Block definitions
│   │   ├── project.ts                 # Project types
│   │   ├── progress.ts                # Progress tracking
│   │   ├── story.ts                   # Story types
│   │   └── puzzle.ts                  # Puzzle types
│   ├── hooks/
│   │   ├── useProject.ts              # Project management hook
│   │   ├── useProgress.ts             # Progress tracking hook
│   │   ├── useBlockExecution.ts       # Block execution hook
│   │   └── useStorage.ts              # Storage operations hook
│   ├── theme/
│   │   ├── colors.ts                  # Design tokens
│   │   └── styles.css                 # Global styles
│   ├── App.tsx                        # Main app component
│   └── main.tsx                       # Entry point
├── public/                            # Static assets
├── dist/                              # Production build
└── vite.config.ts                     # Vite configuration
```

## 🛠️ Installation

### Prerequisites
- Node.js 18+
- pnpm 8+
- KidCode.Api running on port 5190 (optional, for cloud features)

### Setup

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Configure environment** (optional):
   Create a `.env` file in the root directory:
   ```env
   VITE_API_URL=http://localhost:5190
   VITE_ENABLE_CLOUD_SYNC=true
   ```

3. **Start development server**:
   ```bash
   pnpm dev
   # or
   pnpm start  # Runs on kidcode.asafarim.local:5191
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
| `pnpm start` | Start development server on kidcode.asafarim.local:5191 |
| `pnpm build` | Build for production (TypeScript + Vite) |
| `pnpm lint` | Run ESLint |
| `pnpm preview` | Preview production build |

### Configuration

#### Environment Variables
```bash
# API Configuration
VITE_API_URL=http://localhost:5190              # KidCode.Api URL
VITE_ENABLE_CLOUD_SYNC=true                     # Enable cloud features
VITE_ENABLE_LEADERBOARDS=true                   # Enable leaderboards
```

## 🧩 Block System

### Available Blocks

#### Drawing Blocks
| Block | Purpose |
|-------|---------|
| **Circle** | Draw a circle at current position |
| **Square** | Draw a square at current position |
| **Triangle** | Draw a triangle at current position |
| **Star** | Draw a star at current position |

#### Motion Blocks
| Block | Purpose |
|-------|---------|
| **Move Forward** | Move pen forward by specified distance |
| **Turn Right** | Rotate pen clockwise by angle |
| **Turn Left** | Rotate pen counter-clockwise by angle |
| **Pen Up** | Stop drawing (lift pen) |
| **Pen Down** | Start drawing (put pen down) |

#### Color Blocks
| Block | Purpose |
|-------|---------|
| **Set Color** | Change pen color |
| **Set Brush Size** | Change pen thickness |

#### Control Blocks
| Block | Purpose |
|-------|---------|
| **Repeat Magic** | Repeat blocks inside N times |
| **Wait** | Pause for specified duration |

#### Animation Blocks
| Block | Purpose |
|-------|---------|
| **Walk** | Make character walk |
| **Jump** | Make character jump |
| **Wave** | Make character wave |
| **Say** | Make character speak text |
| **Dance** | Make character dance |

#### Music Blocks
| Block | Purpose |
|-------|---------|
| **Play Note** | Play musical note (C-B) |
| **Play Drum** | Play drum sound |
| **Set Tempo** | Set playback speed |

## 🏆 Achievement System

### Stickers & Badges

Kids unlock stickers by completing activities:

| Sticker | Achievement | Requirement |
|---------|-------------|-------------|
| 🔵 First Circle | Draw your first circle | Draw 1 circle |
| 🌈 Rainbow Artist | Use multiple colors | Use 3+ different colors |
| ✨ Pattern Power | Master repeat blocks | Use Repeat Magic block |
| 🌟 Director Star | Animate characters | Make character walk and jump |
| 💬 Chatty Star | Make characters speak | Make character say something |
| 🏆 Maze Master | Complete a maze puzzle | Complete 1 puzzle |
| 🎵 Music Maker | Create a melody | Create melody with 3+ notes |
| 🚀 Speed Demon | Complete challenge quickly | Complete in under 30 seconds |
| 🎨 Master Creator | Create many projects | Create 10+ projects |

### Progression System
- **Level 1-5**: Progressive difficulty unlocking
- **Badges**: Special achievements for milestones
- **Leaderboards**: Global and friend rankings
- **Daily Challenges**: Fresh challenges every day

## 💾 Data Management

### Local Storage
- **IndexedDB**: All projects stored locally
- **Auto-Save**: Automatic saving every 30 seconds
- **Offline Support**: Full functionality without internet
- **Version History**: Track project changes

### Cloud Sync (Optional)
- **Cloud Backup**: Optional backup to KidCode.Api
- **Project Sharing**: Share projects with friends
- **Progress Sync**: Sync progress across devices
- **Challenge Tracking**: Track completed challenges

## 🎨 Design System

The application uses design tokens from `@asafarim/design-tokens`:

- **Colors**: Semantic color scales (primary, success, warning, danger, info, neutral)
- **Typography**: Font families, sizes, weights, line heights
- **Spacing**: Consistent spacing scale
- **Motion**: Standardized transitions and animations
- **Shadows**: Elevation system for depth
- **Radius**: Border radius tokens

Theme switching is handled automatically based on system preferences or user selection.

## 🎯 Design Philosophy

1. **Play First, Code Second** - Discovery through experimentation
2. **Zero Friction** - No typing, large touch-friendly buttons
3. **Immediate Feedback** - Every block does something instantly
4. **Progressive Depth** - Complexity unlocked through curiosity
5. **Safe Exploration** - No wrong answers, only creative experiments
6. **Celebrate Success** - Reward every achievement
7. **Encourage Sharing** - Easy project sharing and collaboration

## 🌐 API Integration

The UI integrates with KidCode.Api (optional):

### Projects
- `GET /api/projects` - Get user's projects
- `POST /api/projects` - Create new project
- `PUT /api/projects/{id}` - Update project
- `DELETE /api/projects/{id}` - Delete project

### Progress
- `GET /api/progress` - Get user progress
- `POST /api/progress/update` - Update progress

### Challenges
- `GET /api/challenges` - Get challenges
- `GET /api/challenges/daily` - Get daily challenge

### Leaderboards
- `GET /api/leaderboards` - Get global leaderboard
- `GET /api/leaderboards/{mode}` - Get mode-specific leaderboard

## 🚢 Deployment

### Production Build
```bash
pnpm build
```

The build output will be in the `dist/` directory.

### Environment Configuration

For production deployment:

```env
VITE_API_URL=https://kidcode-api.asafarim.be
VITE_ENABLE_CLOUD_SYNC=true
VITE_ENABLE_LEADERBOARDS=true
```

### Nginx Configuration
```nginx
server {
    listen 80;
    server_name kidcode.asafarim.be;
    
    root /var/www/kidcode-studio;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://localhost:5190;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection keep-alive;
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🐛 Troubleshooting

### Common Issues

1. **Projects Not Saving**
   - Check browser's IndexedDB is enabled
   - Verify localStorage quota
   - Check browser console for errors

2. **Cloud Sync Not Working**
   - Verify KidCode.Api is running on port 5190
   - Check environment variables
   - Ensure CORS is properly configured

3. **Blocks Not Executing**
   - Check block syntax
   - Verify block connections
   - Review browser console for errors

4. **Build Errors**
   - Clear `node_modules` and reinstall: `pnpm install`
   - Clear Vite cache: `rm -rf node_modules/.vite`
   - Rebuild workspace packages: `pnpm -r build`

## 📊 Performance Optimization

- **Code Splitting**: Dynamic imports for heavy components
- **Lazy Loading**: Routes loaded on demand
- **Memoization**: React.memo for expensive components
- **Canvas Optimization**: Efficient drawing operations
- **State Management**: Zustand for minimal re-renders

## 📄 License

Part of the asafarim.be monorepo. All rights reserved.

## 🤝 Contributing

This is a private monorepo project. For internal development guidelines, see the main repository documentation.

## 📞 Support

For issues or questions, contact the development team or create an issue in the repository.

---

**Version**: 0.2.1  
**Port**: 5191  
**Last Updated**: December 2025
