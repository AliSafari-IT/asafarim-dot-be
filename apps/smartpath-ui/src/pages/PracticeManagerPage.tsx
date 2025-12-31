import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Check, X } from 'lucide-react';
import { ButtonComponent } from '@asafarim/shared-ui-react';
import practiceApi, { PracticeItem, CreatePracticeItemRequest, UpdatePracticeItemRequest } from '../api/practiceApi';
import smartpathService from '../api/smartpathService';
import './PracticeManagerPage.css';

export default function PracticeManagerPage() {
  const [families, setFamilies] = useState<any[]>([]);
  const [selectedFamily, setSelectedFamily] = useState<number | null>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<number | null>(null);
  const [items, setItems] = useState<PracticeItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<PracticeItem | null>(null);
  const [formData, setFormData] = useState<CreatePracticeItemRequest>({
    lessonId: 0,
    questionText: '',
    expectedAnswer: '',
    points: 10,
    difficulty: 'Medium',
  });

  useEffect(() => {
    loadFamilies();
  }, []);

  const loadFamilies = async () => {
    try {
      const familiesData = await smartpathService.families.getMyFamilies();
      setFamilies(Array.isArray(familiesData.data) ? familiesData.data : []);
    } catch (err) {
      console.error('Failed to load families:', err);
      setError('Failed to load families');
    }
  };

  const loadLessons = async (familyId: number) => {
    try {
      const coursesData = await smartpathService.courses.getAll();
      const courses = Array.isArray(coursesData.data) ? coursesData.data : [];
      const allLessons: any[] = [];

      for (const course of courses) {
        const chaptersData = await smartpathService.courses.getChapters(course.courseId);
        const chapters = Array.isArray(chaptersData.data) ? chaptersData.data : [];

        for (const chapter of chapters) {
          const lessonsData = await smartpathService.courses.getLessons(chapter.chapterId);
          const chapterLessons = Array.isArray(lessonsData.data) ? lessonsData.data : [];
          allLessons.push(...chapterLessons);
        }
      }

      setLessons(allLessons);
    } catch (err) {
      console.error('Failed to load lessons:', err);
      setError('Failed to load lessons');
    }
  };

  const loadItems = async (lessonId: number) => {
    try {
      setLoading(true);
      setError(null);
      const itemsData = await practiceApi.getItemsByLesson(lessonId);
      setItems(itemsData);
      console.log('Practice items loaded successfully:', itemsData);
    } catch (err: any) {
      console.error('Failed to load items:', err);
      if (err?.response?.status === 404) {
        setItems([]);
        console.log('No items found or endpoint not available. Creating new items is recommended.');
      } else {
        setError(err?.response?.data?.error || 'Failed to load items. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSelectFamily = (familyId: number) => {
    setSelectedFamily(familyId);
    setError(null);
    loadLessons(familyId);
    setSelectedLesson(null);
    setItems([]);
  };

  const handleSelectLesson = (lessonId: number) => {
    setSelectedLesson(lessonId);
    setError(null);
    setFormData({ ...formData, lessonId });
    loadItems(lessonId);
  };

  const handleOpenModal = (item?: PracticeItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        lessonId: item.lessonId,
        questionText: item.questionText,
        expectedAnswer: '',
        points: item.points,
        difficulty: item.difficulty,
      });
    } else {
      setEditingItem(null);
      setFormData({
        lessonId: selectedLesson || 0,
        questionText: '',
        expectedAnswer: '',
        points: 10,
        difficulty: 'Medium',
      });
    }
    setShowModal(true);
  };

  const handleSaveItem = async () => {
    if (!formData.questionText.trim() || !formData.expectedAnswer.trim()) {
      setError('Question and answer are required');
      return;
    }

    try {
      setError(null);
      if (editingItem) {
        await practiceApi.updateItem(editingItem.id, {
          questionText: formData.questionText,
          expectedAnswer: formData.expectedAnswer,
          points: formData.points,
          difficulty: formData.difficulty,
          isActive: true,
        });
      } else {
        await practiceApi.createItem(formData);
      }
      setShowModal(false);
      if (selectedLesson) {
        loadItems(selectedLesson);
      }
    } catch (err: any) {
      console.error('Failed to save item:', err);
      setError(err?.response?.data?.error || 'Failed to save item. Please try again.');
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    try {
      await practiceApi.deleteItem(itemId);
      if (selectedLesson) {
        loadItems(selectedLesson);
      }
    } catch (err) {
      console.error('Failed to delete item:', err);
      setError('Failed to delete item');
    }
  };

  return (
    <div className="practice-manager-page container" data-testid="practice-manager-page">
      <header className="page-header" data-testid="practice-manager-header">
        <div>
          <h1>Practice Manager</h1>
          <p>Create and manage practice items for lessons</p>
        </div>
      </header>

      {error && (
        <div className="error-banner" data-testid="practice-manager-error">
          <p>{error}</p>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      <div className="manager-controls" data-testid="manager-controls">
        <div className="form-group">
          <label htmlFor="family">Family:</label>
          <select
            id="family"
            value={selectedFamily || ''}
            onChange={(e) => handleSelectFamily(parseInt(e.target.value))}
            data-testid="family-select"
          >
            <option value="">Select family</option>
            {families.map((family) => (
              <option key={family.familyId} value={family.familyId}>
                {family.familyName}
              </option>
            ))}
          </select>
        </div>

        {selectedFamily && (
          <div className="form-group">
            <label htmlFor="lesson">Lesson:</label>
            <select
              id="lesson"
              value={selectedLesson || ''}
              onChange={(e) => handleSelectLesson(parseInt(e.target.value))}
              data-testid="lesson-select"
            >
              <option value="">Select lesson</option>
              {lessons.map((lesson) => (
                <option key={lesson.lessonId} value={lesson.lessonId}>
                  {lesson.title}
                </option>
              ))}
            </select>
          </div>
        )}

        {selectedLesson && (
          <div className="create-item-container">
            <button 
              className="create-item-btn" 
              onClick={() => handleOpenModal()} 
              data-testid="create-item-btn"
            >
              <Plus size={18} />
              Create Item
            </button>
          </div>
        )}
      </div>

      {selectedLesson && (
        <div className="items-section" data-testid="items-section">
          <h2>Practice Items</h2>
          {loading ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
            </div>
          ) : items.length === 0 ? (
            <p className="empty-state">No practice items yet. Create one to get started.</p>
          ) : (
            <div className="items-table" data-testid="items-table">
              {items.map((item) => (
                <div key={item.id} className="item-row" data-testid={`item-${item.id}`}>
                  <div className="item-content">
                    <h3>{item.questionText}</h3>
                    <div className="item-meta">
                      <span className="difficulty">{item.difficulty}</span>
                      <span className="points">{item.points} pts</span>
                      <span className={`status ${item.isActive ? 'active' : 'inactive'}`}>
                        {item.isActive ? <Check size={16} /> : <X size={16} />}
                      </span>
                    </div>
                  </div>
                  <div className="item-actions">
                    <button onClick={() => handleOpenModal(item)} className="edit-btn" data-testid={`edit-${item.id}`}>
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => handleDeleteItem(item.id)} className="delete-btn" data-testid={`delete-${item.id}`}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)} data-testid="item-modal">
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingItem ? 'Edit Item' : 'Create Item'}</h2>
            <div className="form-group">
              <label>Question:</label>
              <textarea
                value={formData.questionText}
                onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
                placeholder="Enter question text"
                data-testid="question-input"
              />
            </div>
            <div className="form-group">
              <label>Expected Answer:</label>
              <input
                type="text"
                value={formData.expectedAnswer}
                onChange={(e) => setFormData({ ...formData, expectedAnswer: e.target.value })}
                placeholder="Enter expected answer"
                data-testid="answer-input"
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Points:</label>
                <input
                  type="number"
                  value={formData.points}
                  onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) })}
                  min="0"
                  data-testid="points-input"
                />
              </div>
              <div className="form-group">
                <label>Difficulty:</label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                  data-testid="difficulty-select"
                >
                  <option>Easy</option>
                  <option>Medium</option>
                  <option>Hard</option>
                </select>
              </div>
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button onClick={handleSaveItem} data-testid="save-item-btn">
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
