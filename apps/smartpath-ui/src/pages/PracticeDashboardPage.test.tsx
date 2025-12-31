import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import PracticeDashboardPage from './PracticeDashboardPage';
import practiceApi from '../api/practiceApi';
import smartpathService from '../api/smartpathService';

vi.mock('../api/practiceApi');
vi.mock('../api/smartpathService');

describe('PracticeDashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders practice dashboard page', async () => {
    vi.mocked(smartpathService.families.getMyFamilies).mockResolvedValue({
      data: [{ familyId: 1, familyName: 'Test Family' }]
    });

    render(
      <BrowserRouter>
        <PracticeDashboardPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('practice-dashboard-page')).toBeInTheDocument();
      expect(screen.getByTestId('family-select')).toBeInTheDocument();
    });
  });

  it('displays child dashboard when family selected', async () => {
    const user = userEvent.setup();

    vi.mocked(smartpathService.families.getMyFamilies).mockResolvedValue({
      data: [{ familyId: 1, familyName: 'Test Family' }]
    });

    vi.mocked(practiceApi.getFamilyDashboard).mockResolvedValue({
      children: [
        {
          childUserId: 1,
          childName: 'Test Child',
          totalPoints: 100,
          currentStreak: 3,
          accuracy: 0.8,
          recentAttempts: [
            {
              attemptId: 1,
              questionPreview: 'What is 2+2?',
              isCorrect: true,
              pointsAwarded: 10,
              lessonId: 1,
              lessonTitle: 'Math',
              attemptedAt: new Date().toISOString()
            }
          ],
          weakLessons: [
            {
              lessonId: 2,
              lessonTitle: 'Science',
              accuracy: 0.5,
              attemptCount: 10
            }
          ]
        }
      ]
    });

    render(
      <BrowserRouter>
        <PracticeDashboardPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('family-select')).toBeInTheDocument();
    });

    const familySelect = screen.getByTestId('family-select');
    await user.selectOptions(familySelect, '1');

    await waitFor(() => {
      expect(screen.getByTestId('dashboard-content')).toBeInTheDocument();
      expect(screen.getByText('Test Child')).toBeInTheDocument();
    });
  });

  it('displays child stats correctly', async () => {
    const user = userEvent.setup();

    vi.mocked(smartpathService.families.getMyFamilies).mockResolvedValue({
      data: [{ familyId: 1, familyName: 'Test Family' }]
    });

    vi.mocked(practiceApi.getFamilyDashboard).mockResolvedValue({
      children: [
        {
          childUserId: 1,
          childName: 'Test Child',
          totalPoints: 150,
          currentStreak: 5,
          accuracy: 0.75,
          recentAttempts: [],
          weakLessons: []
        }
      ]
    });

    render(
      <BrowserRouter>
        <PracticeDashboardPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('family-select')).toBeInTheDocument();
    });

    const familySelect = screen.getByTestId('family-select');
    await user.selectOptions(familySelect, '1');

    await waitFor(() => {
      expect(screen.getByText('150')).toBeInTheDocument();
      expect(screen.getByText('5 days')).toBeInTheDocument();
      expect(screen.getByText('75%')).toBeInTheDocument();
    });
  });

  it('displays empty state when no data', async () => {
    const user = userEvent.setup();

    vi.mocked(smartpathService.families.getMyFamilies).mockResolvedValue({
      data: [{ familyId: 1, familyName: 'Test Family' }]
    });

    vi.mocked(practiceApi.getFamilyDashboard).mockResolvedValue({
      children: []
    });

    render(
      <BrowserRouter>
        <PracticeDashboardPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('family-select')).toBeInTheDocument();
    });

    const familySelect = screen.getByTestId('family-select');
    await user.selectOptions(familySelect, '1');

    await waitFor(() => {
      expect(screen.getByTestId('dashboard-empty')).toBeInTheDocument();
    });
  });
});
