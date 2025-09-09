import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { 
  LayoutContainer, 
  FooterContainer, 
  ThemeProvider,
  NotFound,
  NotificationContainer,
  NotificationProvider
} from '@asafarim/shared-ui-react'
import Navbar from './components/Navbar'
import { ToastProvider, Toaster } from '@asafarim/toast'
import '@asafarim/toast/styles.css'
import JobTracker from './components/JobTracker/JobTracker'
import Root from './theme/Root'
import './App.css'
import JobEdit from './components/JobTracker/JobEdit'
import JobView from './components/JobTracker/JobView'
import CoreAppHome from './pages/CoreAppHome'

function App() {

  return (
    <ToastProvider>
      <NotificationProvider autoRemoveTimeout={5000}>
        <Router>
          <ThemeProvider
            defaultMode="dark"
            storageKey="asafarim-theme"
            persistMode={true}
          >
            <Root>
              <NotificationContainer position="top-right" />
              <Toaster />
              <LayoutContainer
                footer={<FooterContainer key={"main footer"} />}
                header={<Navbar key={"main header"} />}
                title="Core App"
              >
            <Routes>
              <Route path='/' element={
                <CoreAppHome />
              } />
              <Route path="/jobs" element={<JobTracker />} />
              <Route path="/jobs/:jobId/edit" element={<JobEdit />} />
              <Route path="/jobs/:jobId/view" element={<JobView />} />
              {/* Catch-all route for 404 errors */}
              <Route path="*" element={<NotFound />} />
            </Routes>
              </LayoutContainer>
            </Root>
          </ThemeProvider>
        </Router>
      </NotificationProvider>
    </ToastProvider>
  )
}

export default App
