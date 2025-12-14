# KidCode Studio 🎨

> A block-based creative playground where kids learn coding through art, animation, puzzles, and music.

[![React](https://img.shields.io/badge/React-18-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

## 🌟 Overview

KidCode Studio is an educational platform designed for children to explore programming concepts through creative play. No typing required—just drag, drop, and watch your creations come to life!

### Why KidCode?

- **Visual Learning** - Block-based interface eliminates syntax barriers
- **Instant Feedback** - See results immediately as you build
- **Multiple Modes** - Drawing, storytelling, puzzles, and music creation
- **Reward System** - Earn stickers and unlock achievements
- **Safe & Offline** - Works without internet, data stored locally

## 🎮 Creative Modes

### 🖌️ Drawing Studio

Create digital art using code blocks:

- Draw shapes: circles, squares, triangles, stars
- Control pen movement and rotation
- Set colors and brush sizes
- Use "Repeat Magic" to create patterns
- Save and share your artwork

### 🎬 Story Mode

Animate characters and tell stories:

- 8 unique characters to choose from
- Actions: Walk, Jump, Wave, Say
- Multiple backgrounds: Forest, Space, City
- Create interactive narratives

### 🧩 Puzzle Adventures

Solve coding challenges:

- Navigate mazes using logic blocks
- Learn sequential thinking
- Progressive difficulty levels
- Visual success/failure feedback

### 🎵 Music Blocks

Compose music with code:

- Play notes: C, D, E, F, G, A, B
- Drum sounds: kick, snare, hihat, clap
- Visual music visualizer
- Interactive piano keyboard

## 🚀 Quick Start

### Prerequisites

- Node.js 18 or higher
- pnpm package manager

### Installation

```bash
# Install dependencies (from monorepo root)
pnpm install

# Start development server
pnpm --filter @asafarim/kidcode-studio dev
```

Open your browser to `http://localhost:5191`

### Optional: Backend API

For cloud save and challenges:

```bash
cd apis/KidCode.Api
dotnet run
```

API runs at `http://localhost:5190`

## 📦 Tech Stack

| Technology | Purpose |
|------------|----------|
| React 18 | UI framework |
| TypeScript | Type safety |
| Vite | Build tool |
| Zustand | State management |
| IndexedDB | Local storage |
| .NET 8 | Backend API (optional) |

## 📁 Project Structure

```
src/
├── components/
│   ├── BlockEditor/      # Block palette & script area
│   ├── Canvas/           # Drawing canvas & visualizers
│   ├── Layout/           # Main layout wrapper
│   ├── NavTabs/          # Mode navigation
│   └── RewardPopup/      # Achievement notifications
├── core/
│   ├── interpreter/      # Block execution engine
│   └── state/            # Zustand store
├── pages/
│   ├── Home/             # Hub screen
│   ├── DrawingStudio/    # Drawing mode
│   ├── StoryMode/        # Animation mode
│   ├── PuzzleAdventures/ # Puzzle mode
│   └── MusicBlocks/      # Music mode
├── services/
│   ├── storage.ts        # IndexedDB operations
│   └── apiClient.ts      # API client
├── types/
│   ├── blocks.ts         # Block definitions
│   ├── project.ts        # Project types
│   └── progress.ts       # Progress tracking
└── theme/
    └── colors.ts         # Design tokens
```

## 🧩 Available Blocks

| Category | Blocks |
|----------|--------|
| **Draw** | Circle, Square, Triangle, Star |
| **Motion** | Move Forward, Turn Right, Turn Left, Pen Up, Pen Down |
| **Color** | Set Color, Set Brush Size |
| **Control** | Repeat Magic |
| **Animation** | Walk, Jump, Wave, Say, Wait |
| **Music** | Play Note, Play Drum |

## 🏆 Achievements

Kids unlock stickers by completing activities:

| Sticker | Achievement |
|---------|-------------|
| 🔵 First Circle | Draw your first circle |
| 🌈 Rainbow Artist | Use 3+ different colors |
| ✨ Pattern Power | Use Repeat Magic block |
| 🌟 Director Star | Make character walk and jump |
| 💬 Chatty Star | Make character say something |
| 🏆 Maze Master | Complete a maze puzzle |
| 🎵 Music Maker | Create melody with 3+ notes |

## 🎯 Design Philosophy

1. **Play First, Code Second** - Discovery through experimentation
2. **Zero Friction** - No typing, large touch-friendly buttons
3. **Immediate Feedback** - Every block does something instantly
4. **Progressive Depth** - Complexity unlocked through curiosity
5. **Safe Exploration** - No wrong answers, only creative experiments

## 🛠️ Development

### Build for Production

```bash
pnpm --filter @asafarim/kidcode-studio build
```

### Run Tests

```bash
pnpm --filter @asafarim/kidcode-studio test
```

### Lint Code

```bash
pnpm --filter @asafarim/kidcode-studio lint
```

## 🤝 Contributing

Contributions welcome! Please read our contributing guidelines first.

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🔗 Related Projects

- [KidCode API](../../apis/KidCode.Api) - Backend service
- [Shared UI Components](../../packages/shared-ui-react) - Reusable components
- [Design Tokens](../../packages/shared-tokens) - Color system

---

**Made with ❤️ for young creators**
