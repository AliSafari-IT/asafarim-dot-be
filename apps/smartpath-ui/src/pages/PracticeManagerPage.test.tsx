import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import PracticeManagerPage from './PracticeManagerPage';
import practiceApi from '../api/practiceApi';
import smartpathService from '../api/smartpathService';

vi.mock('../api/practiceApi');
vi.mock('../api/smartpathService');

describe('PracticeManagerPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders practice manager page', async () => {
    vi.mocked(smartpathService.families.getMyFamilies).mockResolvedValue({
      data: [{ familyId: 1, familyName: 'Test Family' }]
    });

    render(
      <BrowserRouter>
        <PracticeManagerPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('practice-manager-page')).toBeInTheDocument();
      expect(screen.getByTestId('family-select')).toBeInTheDocument();
    });
  });

  it('loads lessons when family is selected', async () => {
    const user = userEvent.setup();

    vi.mocked(smartpathService.families.getMyFamilies).mockResolvedValue({
      data: [{ familyId: 1, familyName: 'Test Family' }]
    });
    vi.mocked(smartpathService.courses.getAll).mockResolvedValue({
      data: [{ courseId: 1, title: 'Test Course' }]
    });
    vi.mocked(smartpathService.courses.getChapters).mockResolvedValue({
      data: [{ chapterId: 1, title: 'Test Chapter' }]
    });
    vi.mocked(smartpathService.courses.getLessons).mockResolvedValue({
      data: [{ lessonId: 1, title: 'Test Lesson' }]
    });

    render(
      <BrowserRouter>
        <PracticeManagerPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('family-select')).toBeInTheDocument();
    });

    const familySelect = screen.getByTestId('family-select');
    await user.selectOptions(familySelect, '1');

    await waitFor(() => {
      expect(screen.getByTestId('lesson-select')).toBeInTheDocument();
    });
  });

  it('creates practice item', async () => {
    const user = userEvent.setup();

    vi.mocked(smartpathService.families.getMyFamilies).mockResolvedValue({
      data: [{ familyId: 1, familyName: 'Test Family' }]
    });
    vi.mocked(smartpathService.courses.getAll).mockResolvedValue({
      data: [{ courseId: 1, title: 'Test Course' }]
    });
    vi.mocked(smartpathService.courses.getChapters).mockResolvedValue({
      data: [{ chapterId: 1, title: 'Test Chapter' }]
    });
    vi.mocked(smartpathService.courses.getLessons).mockResolvedValue({
      data: [{ lessonId: 1, title: 'Test Lesson' }]
    });
    vi.mocked(practiceApi.getItemsByLesson).mockResolvedValue([]);
    vi.mocked(practiceApi.createItem).mockResolvedValue({
      id: 1,
      lessonId: 1,
      questionText: 'Test Question',
      points: 10,
      difficulty: 'Medium',
      isActive: true,
      createdAt: new Date().toISOString()
    });

    render(
      <BrowserRouter>
        <PracticeManagerPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('family-select')).toBeInTheDocument();
    });

    const familySelect = screen.getByTestId('family-select');
    await user.selectOptions(familySelect, '1');

    await waitFor(() => {
      expect(screen.getByTestId('lesson-select')).toBeInTheDocument();
    });

    const lessonSelect = screen.getByTestId('lesson-select');
    await user.selectOptions(lessonSelect, '1');

    await waitFor(() => {
      expect(screen.getByTestId('create-item-btn')).toBeInTheDocument();
    });

    const createBtn = screen.getByTestId('create-item-btn');
    await user.click(createBtn);

    await waitFor(() => {
      expect(screen.getByTestId('item-modal')).toBeInTheDocument();
    });
  });
});
