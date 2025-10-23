import { useEffect } from 'react';
import Chat from './Chat';
import './ChatPage.css';

/**
 * ChatPage - A wrapper component for the Chat component
 * This component handles the direct /chat route and ensures proper rendering
 * without layout conflicts
 */
export default function ChatPage() {
  // Override the default layout styles when on the chat page
  useEffect(() => {
    // Add a class to the body to indicate we're on the chat page
    document.body.classList.add('ai-ui-chat-page');
    
    // Remove default layout padding that might interfere with our chat layout
    const layoutContent = document.querySelector('.ai-ui-theme-layout-content');
    if (layoutContent) {
      (layoutContent as HTMLElement).style.padding = '0';
      (layoutContent as HTMLElement).style.maxWidth = 'none';
    }
    
    // Cleanup function to restore styles when component unmounts
    return () => {
      document.body.classList.remove('ai-ui-chat-page');
      const layoutContent = document.querySelector('.ai-ui-theme-layout-content');
      if (layoutContent) {
        (layoutContent as HTMLElement).style.padding = '';
        (layoutContent as HTMLElement).style.maxWidth = '';
      }
    };
  }, []);

  return <Chat />;
}
