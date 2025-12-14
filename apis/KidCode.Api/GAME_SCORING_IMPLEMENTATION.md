# KidCode Game Scoring & Leaderboard Implementation Plan

## Overview

Comprehensive game progress tracking with scores, achievements, and leaderboards.

## Database Schema

### GameSession Table

- Id (GUID)
- UserId (string)
- Mode (enum: Drawing, Story, Puzzle, Music)
- Score (int)
- Level (int)
- StarsEarned (int)
- TimeSpentSeconds (int)
- Completed (bool)
- MetadataJson (JSONB)
- CreatedAt (DateTime)

### UserStats Table

- Id (GUID)
- UserId (string, unique)
- Username (string)
- Email (string)
- TotalScore (int)
- TotalGamesPlayed (int)
- TotalStarsEarned (int)
- CurrentLevel (int)
- ExperiencePoints (int)
- DrawingHighScore, StoryHighScore, PuzzleHighScore, MusicHighScore (int)
- DrawingGamesPlayed, StoryGamesPlayed, PuzzleGamesPlayed, MusicGamesPlayed (int)
- TotalStickers (int)
- BadgesJson (JSONB)
- UnlockedLevelsJson (JSONB)
- CompletedChallengesJson (JSONB)
- CurrentStreak, LongestStreak (int)
- LastPlayedAt (DateTime?)
- CreatedAt, UpdatedAt (DateTime)

## API Endpoints

### POST /api/gamesessions

Create new game session and update stats

### GET /api/gamesessions

Get user's game history

### GET /api/stats

Get current user stats

### GET /api/stats/{userId}

Get specific user stats (public)

### GET /api/leaderboard

Query params: mode, period, limit
Returns top players

## Frontend Integration

### Service: gameProgressService.ts

- saveGameSession(data)
- getUserStats()
- getLeaderboard(mode, period)

### Components

- Leaderboard.tsx (homepage)
- UserStatsCard.tsx (profile)
- GameCompletionModal.tsx (after game)

## Scoring Logic

### XP Calculation

XP = Score + (Stars * 10)

### Level Calculation

Level = floor(sqrt(XP / 100)) + 1

### Streak Tracking

- Increment if played yesterday
- Reset if gap > 1 day
- Track longest streak

## Next Steps

1. Create migration
2. Implement controllers
3. Create frontend service
4. Add leaderboard component
5. Integrate into game modes
