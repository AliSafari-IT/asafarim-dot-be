import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import TasksPage from './pages/TasksPage';
import TaskFormPage from './pages/TaskFormPage';
import LearningPage from './pages/LearningPage';
import LearningFormPage from './pages/LearningFormPage';
import CourseFormPage from './pages/CourseFormPage';
import CourseLearningPage from './pages/CourseLearningPage';
import ProgressPage from './pages/ProgressPage';
import FamilyPage from './pages/FamilyPage';
import FamilyFormPage from './pages/FamilyFormPage';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
    return (
        <div className="app">
            <Navbar />
            <main className="main-content">
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

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </main>
        </div>
    );
}

export default App;
