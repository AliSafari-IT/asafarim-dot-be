import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import smartpathService from '../api/smartpathService';
import { BookOpen, ChevronRight, Plus, Edit2, Trash2 } from 'lucide-react';
import { ButtonComponent } from '@asafarim/shared-ui-react';
import './LearningPage.css';

export default function LearningPage() {
    const navigate = useNavigate();
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCourses, setSelectedCourses] = useState<Set<number>>(new Set());
    const [enrolling, setEnrolling] = useState<number | null>(null);

    useEffect(() => {
        loadCourses();
    }, []);

    const loadCourses = async () => {
        try {
            const response = await smartpathService.courses.getAll();
            const coursesData = Array.isArray(response.data) ? response.data : [];
            setCourses(coursesData);
        } catch (error) {
            console.error('Failed to load courses:', error);
            setCourses([]);
        } finally {
            setLoading(false);
        }
    };

    const deleteCourse = async (courseId: number) => {
        if (!confirm('Are you sure you want to delete this course?')) return;
        try {
            await smartpathService.courses.delete(courseId);
            loadCourses();
        } catch (error) {
            console.error('Failed to delete course:', error);
        }
    };

    const toggleCourseSelection = (courseId: number) => {
        const newSelected = new Set(selectedCourses);
        if (newSelected.has(courseId)) {
            newSelected.delete(courseId);
        } else {
            newSelected.add(courseId);
        }
        setSelectedCourses(newSelected);
    };

    const toggleAllCourses = () => {
        if (selectedCourses.size === courses.length) {
            setSelectedCourses(new Set());
        } else {
            setSelectedCourses(new Set(courses.map(c => c.courseId)));
        }
    };

    const deleteBulkCourses = async () => {
        if (selectedCourses.size === 0) return;
        if (!confirm(`Delete ${selectedCourses.size} selected course(s)?`)) return;

        try {
            await smartpathService.courses.deleteMultiple(Array.from(selectedCourses));
            setSelectedCourses(new Set());
            loadCourses();
        } catch (error) {
            console.error('Failed to delete courses:', error);
        }
    };

    const handleStartLearning = async (courseId: number) => {
        try {
            setEnrolling(courseId);
            await smartpathService.progress.enroll({ childUserId: 1, courseId });
            navigate(`/learning/${courseId}`);
        } catch (error) {
            console.error('Failed to enroll in course:', error);
            setEnrolling(null);
        }
    };

    if (loading) {
        return <div className="loading" data-testid="learning-loading">Loading...</div>;
    }

    return (
        <div className="learning-page container" data-testid="learning-page">
            <header className="page-header" data-testid="learning-header">
                <div>
                    <h1>Learning</h1>
                    <p>Explore courses and start learning</p>
                </div>
                <div className="header-actions" data-testid="learning-header-actions">
                    {selectedCourses.size > 0 && (
                        <ButtonComponent onClick={deleteBulkCourses} variant="danger">
                            <Trash2 size={20} />
                            Delete {selectedCourses.size}
                        </ButtonComponent>
                    )}
                    <ButtonComponent onClick={() => navigate('/learning/new')} variant="primary">
                        <Plus size={20} />
                        Add Course
                    </ButtonComponent>
                </div>
            </header>

            <div className="courses-grid" data-testid="courses-grid">
                {courses?.length === 0 ? (
                    <div className="empty-state" data-testid="courses-empty-state">
                        <BookOpen size={48} />
                        <p>No courses available yet.</p>
                    </div>
                ) : (
                    <>
                        <div className="select-all-row" data-testid="course-select-all-row">
                            <input
                                type="checkbox"
                                checked={selectedCourses.size === courses.length && courses.length > 0}
                                onChange={toggleAllCourses}
                                title="Select all courses"
                                data-testid="course-select-all-checkbox"
                            />
                            <span>{selectedCourses.size > 0 ? `${selectedCourses.size} selected` : 'Select all'}</span>
                        </div>
                        {courses.map((course) => (
                            <div
                                key={course.courseId}
                                className={`course-card ${selectedCourses.has(course.courseId) ? 'selected' : ''}`}
                                data-testid={`course-card-${course.courseId}`}
                            >
                                <div className="course-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={selectedCourses.has(course.courseId)}
                                        onChange={() => toggleCourseSelection(course.courseId)}
                                    />
                                </div>
                                <div className="course-icon" style={{ backgroundColor: course.colorCode || '#3B82F6' }}>
                                    <BookOpen size={32} />
                                </div>
                                <div className="course-content">
                                    <h3>{course.name}</h3>
                                    <p>{course.description}</p>
                                    <div className="course-meta">
                                        <span>Grade {course.gradeLevel}</span>
                                        <span>•</span>
                                        <span>{course.chapters?.length || 0} chapters</span>
                                    </div>
                                </div>
                                <div className="course-actions">
                                    <button 
                                        onClick={() => handleStartLearning(course.courseId)}
                                        disabled={enrolling === course.courseId}
                                        className="course-action btn-start"
                                    >
                                        {enrolling === course.courseId ? 'Enrolling...' : 'Start Learning'}
                                        <ChevronRight size={20} />
                                    </button>
                                    <button
                                        onClick={() => navigate(`/learning/${course.courseId}/edit`)}
                                        className="btn-action btn-edit"
                                        title="Edit course"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button
                                        onClick={() => deleteCourse(course.courseId)}
                                        className="btn-action btn-delete"
                                        title="Delete course"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </>
                )}
            </div>
        </div>
    );
}
