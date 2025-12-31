import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, CheckCircle, Award, ChevronDown, BookOpen } from 'lucide-react';
import { ButtonComponent } from '@asafarim/shared-ui-react';
import practiceApi, { PracticeSession, CreateAttemptRequest } from '../api/practiceApi';
import smartpathService from '../api/smartpathService';
import './PracticePage.css';

interface CourseWithLessons {
  courseId: number;
  name: string;
  description?: string;
  colorCode?: string;
  chapters: ChapterWithLessons[];
}

interface ChapterWithLessons {
  chapterId: number;
  name: string;
  lessons: any[];
}

export default function PracticePage() {
  const navigate = useNavigate();
  const [families, setFamilies] = useState<any[]>([]);
  const [selectedFamily, setSelectedFamily] = useState<number | null>(null);
  const [courses, setCourses] = useState<CourseWithLessons[]>([]);
  const [currentSession, setCurrentSession] = useState<PracticeSession | null>(null);
  const [currentItem, setCurrentItem] = useState<any | null>(null);
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    loadUserAndFamilies();
  }, []);

  const loadUserAndFamilies = async () => {
    try {
      const me = await smartpathService.users.me();
      setUserId(me.data.userId);
      const familiesData = await smartpathService.families.getMyFamilies();
      setFamilies(Array.isArray(familiesData.data) ? familiesData.data : []);
    } catch (err) {
      console.error('Failed to load families:', err);
      setError('Failed to load families');
    }
  };

  const loadCourses = async (familyId: number) => {
    try {
      setError(null);
      const coursesData = await smartpathService.courses.getAll();
      const allCourses = Array.isArray(coursesData.data) ? coursesData.data : [];
      const familyCourses = allCourses.filter(course => course.familyId === familyId);

      const coursesWithLessons: CourseWithLessons[] = [];

      for (const course of familyCourses) {
        try {
          const chaptersData = await smartpathService.courses.getChapters(course.courseId);
          const chapters = Array.isArray(chaptersData.data) ? chaptersData.data : [];

          const chaptersWithLessons: ChapterWithLessons[] = [];
          for (const chapter of chapters) {
            try {
              const lessonsData = await smartpathService.courses.getLessons(chapter.chapterId);
              const chapterLessons = Array.isArray(lessonsData.data) ? lessonsData.data : [];

              chaptersWithLessons.push({
                chapterId: chapter.chapterId,
                name: chapter.name,
                lessons: chapterLessons,
              });
            } catch (err) {
              console.error(`Failed to load lessons for chapter ${chapter.chapterId}:`, err);
            }
          }

          coursesWithLessons.push({
            courseId: course.courseId,
            name: course.name,
            description: course.description,
            colorCode: course.colorCode,
            chapters: chaptersWithLessons,
          });
        } catch (err) {
          console.error(`Failed to load chapters for course ${course.courseId}:`, err);
        }
      }

      setCourses(coursesWithLessons);

      if (coursesWithLessons.length === 0) {
        setError('No courses found. Please create courses with chapters and lessons first.');
      }
    } catch (err) {
      console.error('Failed to load courses:', err);
      setError('Failed to load courses');
    }
  };

  const startSession = async (lessonId: number) => {
    if (!selectedFamily || !userId) {
      setError('Please select a family');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log(`🚀 Starting practice session for lesson ${lessonId}`);
      
      const session = await practiceApi.createSession({
        familyId: selectedFamily,
        childUserId: userId,
        lessonId: lessonId,
      });
      console.log('✅ Session created:', session);

      // Get the first practice item
      try {
        const nextItem = await practiceApi.getNextItem(session.id);
        console.log('📝 Next item loaded:', nextItem);
        setCurrentSession(session);
        setCurrentItem(nextItem);
        setAnswer('');
      } catch (itemErr: any) {
        // No practice items available
        console.error('❌ No practice items available for lesson', lessonId, itemErr);
        const errorMsg = itemErr?.response?.data?.error || `No practice items found for this lesson. Create items in Practice Manager.`;
        setError(errorMsg);
        setCurrentSession(null);
        setCurrentItem(null);
      }
    } catch (err: any) {
      console.error('❌ Failed to start session:', err);
      const errorMsg = err?.response?.data?.error || 'Failed to start session. Please try again.';
      setError(errorMsg);
      setCurrentSession(null);
      setCurrentItem(null);
    } finally {
      setLoading(false);
    }
  };

  const submitAttempt = async () => {
    if (!currentSession || !currentItem) return;

    try {
      setLoading(true);
      setError(null);
      const attemptRequest: CreateAttemptRequest = {
        sessionId: currentSession.id,
        practiceItemId: currentItem.id,
        answer,
      };

      const result = await practiceApi.submitAttempt(attemptRequest);
      console.log('✅ Attempt submitted:', result);

      // Try to get the next item
      try {
        const nextItem = await practiceApi.getNextItem(currentSession.id);
        console.log('📝 Next item loaded:', nextItem);
        setCurrentItem(nextItem);
        setAnswer('');
      } catch (err: any) {
        // No more items, complete the session
        console.log('✨ No more items, completing session...', err?.response?.data?.error);
        try {
          const completed = await practiceApi.completeSession(currentSession.id);
          console.log('✅ Session completed:', completed);
          setCurrentSession(completed);
          setCurrentItem(null);
        } catch (completeErr) {
          console.error('Failed to complete session:', completeErr);
          setError('Session complete! All practice items finished.');
        }
      }
    } catch (err: any) {
      console.error('❌ Failed to submit attempt:', err);
      setError(err?.response?.data?.error || 'Failed to submit attempt');
    } finally {
      setLoading(false);
    }
  };

  const completeSession = async () => {
    if (!currentSession) return;

    try {
      const completed = await practiceApi.completeSession(currentSession.id);
      setCurrentSession(completed);
    } catch (err) {
      console.error('Failed to complete session:', err);
      setError('Failed to complete session');
    }
  };

  if (currentSession && currentSession.status === 'Completed') {
    return (
      <div className="practice-page container" data-testid="practice-page">
        <div className="session-complete" data-testid="session-complete">
          <CheckCircle size={64} className="success-icon" />
          <h2>Session Complete!</h2>
          <p>Total Points: {currentSession.totalPoints}</p>
          <p>Attempts: {currentSession.attempts.length}</p>
          <ButtonComponent onClick={() => navigate('/rewards')} variant="primary">
            <Award size={20} />
            View Rewards
          </ButtonComponent>
        </div>
      </div>
    );
  }

  if (currentSession) {
    return (
      <div className="practice-page container" data-testid="practice-page">
        {currentSession && currentItem && (
          <div className="practice-session">
            <h3>Practice Session</h3>
            <div className="question-card">
              <h4>Question:</h4>
              <p>{currentItem.questionText}</p>
            </div>
            <div className="form-group">
              <label htmlFor="answer">Your Answer</label>
              <input
                id="answer"
                type="text"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Enter your answer"
                onKeyPress={(e) => e.key === 'Enter' && answer && submitAttempt()}
              />
            </div>
            <button onClick={submitAttempt} disabled={loading || !answer}>
              Submit Answer
            </button>
          </div>
        )}
        {currentSession && !currentItem && !loading && (
          <div className="session-complete">
            <h3>Session Complete!</h3>
            <p>Great job! You've completed all practice items.</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="practice-page container" data-testid="practice-page">
      <header className="practice-header">
        <h1>Practice</h1>
        <p>Select a lesson and start practicing</p>
      </header>

      {error && (
        <div className="error-block" role="alert" aria-live="polite">
          <div className="error-banner">
            <p className="error-text">{error}</p>
            <button
              type="button"
              onClick={() => setError(null)}
              className="error-dismiss"
              aria-label="Dismiss message"
              title="Dismiss"
            >
              ×
            </button>
          </div>

          <div className="error-actions-row">
            <div className="error-actions-left">
              {error.includes("No practice items") && (
                <button
                  type="button"
                  onClick={() => navigate("/practice-manager")}
                  className="error-cta"
                >
                  Go to Practice Manager
                </button>
              )}
            </div>

            <div className="error-actions-right">
              <span className="error-hint">
                Tip: Add practice items for this lesson in Practice Manager.
              </span>
            </div>
          </div>
        </div>
      )}

      {!selectedFamily ? (
        <div className="family-selector-container">
          <div className="selector-card">
            <label htmlFor="family-select">Choose a Family</label>
            <select
              id="family-select"
              value={selectedFamily || ''}
              onChange={(e) => {
                const familyId = parseInt(e.target.value);
                setSelectedFamily(familyId);
                loadCourses(familyId);
              }}
              data-testid="family-select"
            >
              <option value="">Select family...</option>
              {families.map((family) => (
                <option key={family.familyId} value={family.familyId}>
                  {family.familyName}
                </option>
              ))}
            </select>
          </div>
        </div>
      ) : (
        <div className="practice-content">
          <div className="family-header">
            <button
              className="back-btn"
              onClick={() => {
                setSelectedFamily(null);
                setCourses([]);
              }}
            >
              ← Change Family
            </button>
            <h2>{families.find(f => f.familyId === selectedFamily)?.familyName}</h2>
          </div>

          {courses.length > 0 ? (
            <div className="lessons-list">
              {courses.map((course) => (
                <div key={course.courseId} className="course-section">
                  <div className="course-header-minimal">
                    <div className="course-badge" style={{ backgroundColor: course.colorCode || '#3B82F6' }}>
                      <BookOpen size={20} />
                    </div>
                    <div className="course-meta">
                      <h3>{course.name}</h3>
                      {course.description && <p>{course.description}</p>}
                    </div>
                  </div>

                  {course.chapters.map((chapter) => (
                    <div key={chapter.chapterId} className="chapter-group">
                      <h4>{chapter.name}</h4>
                      <div className="lessons-stack">
                        {chapter.lessons.length > 0 ? (
                          chapter.lessons.map((lesson) => (
                            <button
                              key={lesson.lessonId}
                              className="lesson-button"
                              onClick={() => startSession(lesson.lessonId)}
                              disabled={loading}
                            >
                              <div className="lesson-info">
                                <span className="lesson-title">{lesson.title}</span>
                                {lesson.description && (
                                  <span className="lesson-desc">{lesson.description}</span>
                                )}
                              </div>
                              <Play size={18} className="play-icon" />
                            </button>
                          ))
                        ) : (
                          <div className="no-lessons-msg">No lessons available</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <BookOpen size={48} />
              <p>No courses available</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
