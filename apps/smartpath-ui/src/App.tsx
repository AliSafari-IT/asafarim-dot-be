import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import TasksPage from './pages/TasksPage';
import TaskFormPage from './pages/TaskFormPage';
import LearningPage from './pages/LearningPage';
import CourseFormPage from './pages/CourseFormPage';
import CourseLearningPage from './pages/CourseLearningPage';
import ChapterFormPage from './pages/ChapterFormPage';
import LessonFormPage from './pages/LessonFormPage';
import ProgressPage from './pages/ProgressPage';
import FamilyPage from './pages/FamilyPage';
import FamilyFormPage from './pages/FamilyFormPage';
import GraphsPage from './pages/GraphsPage';
import GraphEditorPage from './pages/GraphEditorPage';
import PracticePage from './pages/PracticePage';
import RewardsPage from './pages/RewardsPage';
import PracticeManagerPage from './pages/PracticeManagerPage';
import PracticeDashboardPage from './pages/PracticeDashboardPage';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
    return (
        <div className="app" data-testid="app">
            <Navbar />
            <main className="main-content" data-testid="main-content">
                <Routes>
                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>
                                <DashboardPage />
                            </ProtectedRoute>
                        }
                    />

                    {/* Tasks Routes */}
                    <Route
                        path="/tasks"
                        element={
                            <ProtectedRoute>
                                <TasksPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/tasks/new"
                        element={
                            <ProtectedRoute>
                                <TaskFormPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/tasks/:taskId/edit"
                        element={
                            <ProtectedRoute>
                                <TaskFormPage />
                            </ProtectedRoute>
                        }
                    />

                    {/* Learning Routes */}
                    <Route
                        path="/learning"
                        element={
                            <ProtectedRoute>
                                <LearningPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/learning/new"
                        element={
                            <ProtectedRoute>
                                <CourseFormPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/learning/:courseId"
                        element={
                            <ProtectedRoute>
                                <CourseLearningPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/learning/:courseId/edit"
                        element={
                            <ProtectedRoute>
                                <CourseFormPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/learning/:courseId/chapter/new"
                        element={
                            <ProtectedRoute>
                                <ChapterFormPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/learning/:courseId/chapter/:chapterId/edit"
                        element={
                            <ProtectedRoute>
                                <ChapterFormPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/learning/:courseId/chapter/:chapterId/lesson/new"
                        element={
                            <ProtectedRoute>
                                <LessonFormPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/learning/:courseId/chapter/:chapterId/lesson/:lessonId/edit"
                        element={
                            <ProtectedRoute>
                                <LessonFormPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/learning/lesson/:lessonId"
                        element={
                            <ProtectedRoute>
                                <PracticePage />
                            </ProtectedRoute>
                        }
                    />

                    {/* Family Routes */}
                    <Route
                        path="/family"
                        element={
                            <ProtectedRoute>
                                <FamilyPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/family/new"
                        element={
                            <ProtectedRoute>
                                <FamilyFormPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/family/:familyId/edit"
                        element={
                            <ProtectedRoute>
                                <FamilyFormPage />
                            </ProtectedRoute>
                        }
                    />

                    {/* Progress Routes */}
                    <Route
                        path="/progress"
                        element={
                            <ProtectedRoute>
                                <ProgressPage />
                            </ProtectedRoute>
                        }
                    />

                    {/* Graphs Routes */}
                    <Route
                        path="/graphs"
                        element={
                            <ProtectedRoute>
                                <GraphsPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/graphs/new"
                        element={
                            <ProtectedRoute>
                                <GraphEditorPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/graphs/:id"
                        element={
                            <ProtectedRoute>
                                <GraphEditorPage />
                            </ProtectedRoute>
                        }
                    />

                    {/* Practice Routes */}
                    <Route
                        path="/practice"
                        element={
                            <ProtectedRoute>
                                <PracticePage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/rewards"
                        element={
                            <ProtectedRoute>
                                <RewardsPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/practice-manager"
                        element={
                            <ProtectedRoute>
                                <PracticeManagerPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/practice-dashboard"
                        element={
                            <ProtectedRoute>
                                <PracticeDashboardPage />
                            </ProtectedRoute>
                        }
                    />

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </main>
        </div>
    );
}

export default App;
