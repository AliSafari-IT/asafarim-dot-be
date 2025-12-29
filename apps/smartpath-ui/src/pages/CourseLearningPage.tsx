import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpen, ChevronRight, Play, Plus, Edit2, Trash2 } from 'lucide-react';
import smartpathService from '../api/smartpathService';
import { ButtonComponent } from '@asafarim/shared-ui-react';
import './CourseLearningPage.css';

interface Chapter {
    chapterId: number;
    name: string;
    description?: string;
    lessons?: Lesson[];
}

interface Lesson {
    lessonId: number;
    title: string;
    description?: string;
    chapterId: number;
}

interface Course {
    courseId: number;
    name: string;
    description?: string;
    gradeLevel: number;
    colorCode?: string;
    chapters?: Chapter[];
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
                setExpandedChapter(chaptersWithLessons[0].chapterId);
            }
        } catch (error) {
            console.error('Failed to load course:', error);
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
        return <div className="loading">Loading course...</div>;
    }

    if (!course) {
        return (
            <div className="course-learning-page container">
                <button onClick={() => navigate('/learning')} className="btn-back">
                    <ArrowLeft size={20} />
                    Back to Courses
                </button>
                <div className="error-state">
                    <p>Course not found</p>
                </div>
            </div>
        );
    }

    return (
        <div className="course-learning-page container">
            <div className="course-header">
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
                                <button
                                    className={`chapter-header ${expandedChapter === chapter.chapterId ? 'expanded' : ''}`}
                                    onClick={() => setExpandedChapter(
                                        expandedChapter === chapter.chapterId ? null : chapter.chapterId
                                    )}
                                >
                                    <ChevronRight size={20} />
                                    <div className="chapter-info">
                                        <h3>{chapter.name}</h3>
                                        {chapter.description && <p>{chapter.description}</p>}
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

                                {expandedChapter === chapter.chapterId && chapter.lessons && chapter.lessons.length > 0 && (
                                    <div className="lessons-list">
                                        {chapter.lessons.map((lesson) => (
                                            <div key={lesson.lessonId} className="lesson-item">
                                                <div className="lesson-content">
                                                    <h4>{lesson.title}</h4>
                                                    {lesson.description && <p>{lesson.description}</p>}
                                                </div>
                                                <button
                                                    onClick={() => handleStartLesson(lesson.lessonId)}
                                                    disabled={startingLesson === lesson.lessonId}
                                                    className="btn-start-lesson"
                                                >
                                                    <Play size={16} />
                                                    {startingLesson === lesson.lessonId ? 'Starting...' : 'Start'}
                                                </button>
                                            </div>
                                        ))}
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
