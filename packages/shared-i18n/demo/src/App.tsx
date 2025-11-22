// Provide a minimal local module declaration so TypeScript can resolve the package's types
import { useTranslation } from '@asafarim/shared-i18n';
import Hero from './components/Hero';
import Features from './components/Features';
import DemoSection from './components/DemoSection';
import CodeExamples from './components/CodeExamples';
import Footer from './components/Footer';
import LanguageSwitcher from './components/LanguageSwitcher';
import './App.css';

function App() {
  const { t } = useTranslation('demo');

  return (
    <div className="app">
      <header className="app-header">
        <div className="container">
          <h1 className="logo">{t('hero.title')}</h1>
          <LanguageSwitcher />
        </div>
      </header>

      <main className="app-main">
        <Hero />
        <Features />
        <DemoSection />
        <CodeExamples />
      </main>

      <Footer />
    </div>
  );
}

export default App;
