import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { LayoutContainer, FooterContainer, Navbar } from '@asafarim/shared-ui-react'
import { ThemeProvider } from '@asafarim/react-themes'
import { ToastProvider, Toaster } from '@asafarim/toast'
import '@asafarim/toast/styles.css'
import JobTracker from './components/JobTracker/JobTracker'
import Root from './theme/Root'
import NotificationProvider from './contexts/NotificationProvider'
import NotificationContainer from './components/Notifications/NotificationContainer'
import './App.css'

function App() {
  // Cross-app theme sync: mirror theme between localStorage and a root-domain cookie
  useEffect(() => {
    const THEME_KEY = "asafarim-theme";
    const COOKIE_NAME = "asafarim_theme";

    const getCookie = (name: string) =>
      document.cookie
        .split(";") 
        .map((c) => c.trim())
        .find((c) => c.startsWith(name + "="))
        ?.split("=")[1];

    const cookieTheme = getCookie(COOKIE_NAME);
    if (cookieTheme) {
      localStorage.setItem(THEME_KEY, cookieTheme);
    }

    let last = localStorage.getItem(THEME_KEY) || cookieTheme || "dark";

    const writeCookie = (value: string) => {
      document.cookie = `${COOKIE_NAME}=${value}; domain=.asafarim.local; path=/; max-age=31536000; samesite=lax`;
    };

    const interval = setInterval(() => {
      const current = localStorage.getItem(THEME_KEY);
      if (current && current !== last) {
        last = current;
        writeCookie(current);
      }
    }, 1000);

    const onVis = () => {
      if (!document.hidden) {
        const v = getCookie(COOKIE_NAME);
        if (v && v !== localStorage.getItem(THEME_KEY)) {
          localStorage.setItem(THEME_KEY, v);
        }
      }
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  const navLinks = [
    { label: 'Home', to: '/' },
    { label: 'Job Tracker', to: '/jobs' }
  ];

  return (
    <ToastProvider>
      <NotificationProvider>
        <Router>
          <ThemeProvider
            defaultMode="dark"
            storageKey="asafarim-theme"
            persistMode={true}
          >
            <Root>
              <NotificationContainer />
              <Toaster />
              <LayoutContainer
                footer={<FooterContainer key={"main footer"} />}
                header={<Navbar 
                  key={"main header"} 
                  links={navLinks}
                  brand={{ text: 'Core App' }}
                />}
                title="Core App"
              >
            <Routes>
              <Route path="/" element={
                <div className="home-content">
                  <h1>Core App</h1>
                  <p>Welcome to the Core Application</p>
                </div>
              } />
              <Route path="/jobs" element={<JobTracker />} />
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
