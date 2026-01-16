import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpen, ChevronRight, Play, Plus, Edit2, Trash2 } from 'lucide-react';
import smartpathService from '../api/smartpathService';
import './CourseLearningPage.css';

interface Chapter {
    chapterId: number;
    title: string;
    description?: string;
    descriptionHtml?: string;
    descriptionJson?: string;
    lessons?: Lesson[];
    createdAt?: string;
    updatedAt?: string;
}

interface Lesson {
    lessonId: number;
    title: string;
    description?: string;
    descriptionHtml?: string;
    descriptionJson?: string;
    chapterId: number;
    content?: string;
    contentHtml?: string;
    contentJson?: string;
    createdAt?: string;
    updatedAt?: string;
}

interface Course {
    courseId: number;
    name: string;
    description?: string;
    gradeLevel: number;
    colorCode?: string;
    chapters?: Chapter[];
    createdAt?: string;
    updatedAt?: string;
}

export default function CourseLearningPage() {
    const navigate = useNavigate();
    const { courseId } = useParams();
    const [course, setCourse] = useState<Course | null>(null);
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedChapter, setExpandedChapter] = useState<number | null>(null);
    const [startingLesson, setStartingLesson] = useState<number | null>(null);

    useEffect(() => {
        loadCourseAndChapters();
    }, [courseId]);

    useEffect(() => {
        if (!loading && !course) {
            console.log('❌ Course not found, redirecting to /learning');
            const timer = setTimeout(() => {
                navigate('/learning');
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [loading, course, navigate]);

    const loadCourseAndChapters = async () => {
        try {
            if (!courseId) return;
            
            const courseResponse = await smartpathService.courses.getById(Number(courseId));
            setCourse(courseResponse.data);

            const chaptersResponse = await smartpathService.courses.getChapters(Number(courseId));
            const chaptersData = Array.isArray(chaptersResponse.data) ? chaptersResponse.data : [];
            
            const chaptersWithLessons = await Promise.all(
                chaptersData.map(async (chapter: Chapter) => {
                    try {
                        const lessonsResponse = await smartpathService.courses.getLessons(chapter.chapterId);
                        return {
                            ...chapter,
                            lessons: Array.isArray(lessonsResponse.data) ? lessonsResponse.data : [],
                        };
                    } catch (error) {
                        console.error(`Failed to load lessons for chapter ${chapter.chapterId}:`, error);
                        return { ...chapter, lessons: [] };
                    }
                })
            );
            
            setChapters(chaptersWithLessons);
            if (chaptersWithLessons.length > 0) {
                setExpandedChapter(chaptersWithLessons[0]!.chapterId);
            }
        } catch (error: any) {
            console.error('Failed to load course:', error);
            if (error?.response?.status === 403) {
                console.log('❌ Access forbidden to this course');
            } else if (error?.response?.status === 404) {
                console.log('❌ Course not found');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleStartLesson = async (lessonId: number) => {
        try {
            setStartingLesson(lessonId);
            await smartpathService.progress.startLesson(lessonId, { childUserId: 1 });
            navigate(`/learning/lesson/${lessonId}`);
        } catch (error) {
            console.error('Failed to start lesson:', error);
            setStartingLesson(null);
        }
    };

    const handleDeleteChapter = async (chapterId: number) => {
        if (!confirm('Are you sure you want to delete this chapter? All lessons will be deleted.')) return;
        try {
            await smartpathService.courses.deleteChapter(chapterId);
            loadCourseAndChapters();
        } catch (error) {
            console.error('Failed to delete chapter:', error);
        }
    };

    if (loading) {
        return <div className="loading" data-testid="course-learning-loading">Loading...</div>;
    }

    if (!course) {
        return (
            <div className="course-learning-page container" data-testid="course-learning-page">
                <div className="error-state">
                    <p>Course not found. Redirecting...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="course-learning-page container" data-testid="course-learning-page">
            <div className="course-header" data-testid="course-header">
                <button onClick={() => navigate('/learning')} className="btn-back">
                    <ArrowLeft size={20} />
                    Back to Courses
                </button>
                <div className="course-title-section">
                    <div className="course-icon" style={{ backgroundColor: course.colorCode || '#3B82F6' }}>
                        <BookOpen size={32} />
                    </div>
                    <div>
                        <h1>{course.name}</h1>
                        <p>{course.description}</p>
                        <span className="grade-badge">Grade {course.gradeLevel}</span>
                    </div>
                </div>
                <button 
                    onClick={() => navigate(`/learning/${courseId}/chapter/new`)}
                    className="btn-add-chapter"
                    title="Add new chapter"
                >
                    <Plus size={20} />
                    Add Chapter
                </button>
            </div>

            <div className="chapters-container">
                {chapters.length === 0 ? (
                    <div className="empty-state">
                        <BookOpen size={48} />
                        <p>No chapters available in this course yet.</p>
                    </div>
                ) : (
                    <div className="chapters-list">
                        {chapters.map((chapter) => (
                            <div key={chapter.chapterId} className="chapter-item">
                                <div className="chapter-header-wrapper">
                                    <button
                                        className={`chapter-header ${expandedChapter === chapter.chapterId ? 'expanded' : ''}`}
                                        onClick={() => setExpandedChapter(
                                            expandedChapter === chapter.chapterId ? null : chapter.chapterId
                                        )}
                                    >
                                        <ChevronRight size={20} />
                                        <div className="chapter-info">
                                            <div className="chapter-header-content">
                                                <h3>{chapter.title}</h3>
                                                {(chapter.updatedAt || chapter.createdAt) && (
                                                    <span className="chapter-date">
                                                        {chapter.updatedAt ? `Updated: ${new Date(chapter.updatedAt).toLocaleDateString()}` : `Created: ${new Date(chapter.createdAt!).toLocaleDateString()}`}
                                                    </span>
                                                )}
                                            </div>
                                            {expandedChapter !== chapter.chapterId && (
                                                <div className="chapter-preview">
                                                    {chapter.descriptionHtml ? (
                                                        <div className="chapter-description-preview" dangerouslySetInnerHTML={{ __html: chapter.descriptionHtml.substring(0, 150) + '...' }} />
                                                    ) : chapter.description ? (
                                                        <p className="chapter-description-preview">{chapter.description.substring(0, 150)}...</p>
                                                    ) : null}
                                                </div>
                                            )}
                                        </div>
                                        <span className="lesson-count">
                                            {chapter.lessons?.length || 0} lessons
                                        </span>
                                    </button>
                                    <div className="chapter-actions">
                                        <button
                                            onClick={() => navigate(`/learning/${courseId}/chapter/${chapter.chapterId}/edit`)}
                                            className="btn-action btn-edit"
                                            title="Edit chapter"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteChapter(chapter.chapterId)}
                                            className="btn-action btn-delete"
                                            title="Delete chapter"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>

                                {expandedChapter === chapter.chapterId && (
                                    <div className="lessons-container">
                                        <div className="chapter-full-content">
                                            {chapter.descriptionHtml ? (
                                                <div className="chapter-description" dangerouslySetInnerHTML={{ __html: chapter.descriptionHtml }} />
                                            ) : chapter.description ? (
                                                <p className="chapter-description">{chapter.description}</p>
                                            ) : null}
                                        </div>
                                        <button
                                            onClick={() => navigate(`/learning/${courseId}/chapter/${chapter.chapterId}/lesson/new`)}
                                            className="btn-add-lesson"
                                            title="Add new lesson"
                                        >
                                            <Plus size={16} />
                                            Add Lesson
                                        </button>
                                        {chapter.lessons && chapter.lessons.length > 0 ? (
                                            <div className="lessons-list">
                                                {chapter.lessons.map((lesson) => (
                                                    <div key={lesson.lessonId} className="lesson-item">
                                                        <div className="lesson-content">
                                                            <h4>{lesson.title}</h4>
                                                            {lesson.description && <p>{lesson.description}</p>}
                                                        </div>
                                                        <div className="lesson-actions">
                                                            <button
                                                                onClick={() => navigate(`/learning/${courseId}/chapter/${chapter.chapterId}/lesson/${lesson.lessonId}/edit`)}
                                                                className="btn-action btn-edit"
                                                                title="Edit lesson"
                                                            >
                                                                <Edit2 size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleStartLesson(lesson.lessonId)}
                                                                disabled={startingLesson === lesson.lessonId}
                                                                className="btn-start-lesson"
                                                            >
                                                                <Play size={16} />
                                                                {startingLesson === lesson.lessonId ? 'Starting...' : 'Start'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="empty-lessons">
                                                <p>No lessons in this chapter yet.</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
