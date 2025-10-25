import { Routes, Route } from 'react-router-dom'
import { 
  NotFound,
  NotificationContainer,
  NotificationProvider,
} from '@asafarim/shared-ui-react'
import Navbar from './components/Navbar'
import { ToastProvider, Toaster } from '@asafarim/toast'
import HomePage from './pages/HomePage'
import Dashboard from './pages/Dashboard'
import ProjectList from './pages/ProjectList'
import ProjectForm from './pages/ProjectForm'
import ProjectDetail from './pages/ProjectDetail'
import TaskDetail from './pages/TaskDetail'
import TaskForm from './pages/TaskForm'

function AppRoutes() {


  return (
    <Routes>
      <Route index element={ <HomePage />} />
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="projects" element={<ProjectList />} />
      <Route path="projects/new" element={<ProjectForm />} />
      <Route path="projects/:id/edit" element={<ProjectForm />} />
      <Route path="projects/:projectId" element={<ProjectDetail />} />
      <Route path="projects/:projectId/tasks/new" element={<TaskForm />} />
      <Route path="tasks/:taskId" element={<TaskDetail />} />
      <Route path="tasks/:taskId/edit" element={<TaskForm />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default function App() {
  return (
    <ToastProvider>
      <NotificationProvider>
        <NotificationContainer />
        <Toaster />
        <Navbar />
        <AppRoutes />
      </NotificationProvider>
    </ToastProvider>
  )
}
