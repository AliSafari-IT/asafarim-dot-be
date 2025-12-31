import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import RewardsPage from './RewardsPage';
import practiceApi from '../api/practiceApi';
import smartpathService from '../api/smartpathService';

vi.mock('../api/practiceApi');
vi.mock('../api/smartpathService');

describe('RewardsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders rewards page with stats', async () => {
    const mockSummary = {
      childUserId: 1,
      childName: 'Test Child',
      totalPoints: 100,
      sessionsCount: 5,
      attemptsCount: 25,
      correctRate: 0.8,
      currentStreak: 3,
      bestStreak: 7,
      recentAchievements: []
    };

    vi.mocked(smartpathService.users.me).mockResolvedValue({
      data: { userId: 1, email: 'test@example.com' }
    });
    vi.mocked(practiceApi.getChildSummary).mockResolvedValue(mockSummary);
    vi.mocked(practiceApi.getChildAchievements).mockResolvedValue([]);

    render(
      <BrowserRouter>
        <RewardsPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('stats-grid')).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument();
      expect(screen.getByText('80%')).toBeInTheDocument();
    });
  });

  it('displays achievements when available', async () => {
    const mockSummary = {
      childUserId: 1,
      childName: 'Test Child',
      totalPoints: 100,
      sessionsCount: 5,
      attemptsCount: 25,
      correctRate: 0.8,
      currentStreak: 3,
      bestStreak: 7,
      recentAchievements: []
    };

    const mockAchievements = [
      {
        id: 1,
        childUserId: 1,
        achievement: {
          id: 1,
          key: 'first_attempt',
          title: 'First Attempt',
          description: 'Submit your first practice attempt',
          icon: '🎯',
          points: 10,
          isActive: true
        },
        awardedAt: new Date().toISOString()
      }
    ];

    vi.mocked(smartpathService.users.me).mockResolvedValue({
      data: { userId: 1, email: 'test@example.com' }
    });
    vi.mocked(practiceApi.getChildSummary).mockResolvedValue(mockSummary);
    vi.mocked(practiceApi.getChildAchievements).mockResolvedValue(mockAchievements);

    render(
      <BrowserRouter>
        <RewardsPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('achievements-grid')).toBeInTheDocument();
      expect(screen.getByText('First Attempt')).toBeInTheDocument();
    });
  });

  it('displays empty state when no achievements', async () => {
    const mockSummary = {
      childUserId: 1,
      childName: 'Test Child',
      totalPoints: 0,
      sessionsCount: 0,
      attemptsCount: 0,
      correctRate: 0,
      currentStreak: 0,
      bestStreak: 0,
      recentAchievements: []
    };

    vi.mocked(smartpathService.users.me).mockResolvedValue({
      data: { userId: 1, email: 'test@example.com' }
    });
    vi.mocked(practiceApi.getChildSummary).mockResolvedValue(mockSummary);
    vi.mocked(practiceApi.getChildAchievements).mockResolvedValue([]);

    render(
      <BrowserRouter>
        <RewardsPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('achievements-empty')).toBeInTheDocument();
      expect(screen.getByText('No achievements yet. Keep practicing!')).toBeInTheDocument();
    });
  });
});
