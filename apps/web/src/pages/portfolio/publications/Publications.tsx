import React, { useState, useEffect } from "react";
import { Hero, ContentCard, Button, LoginArrow, DotsMenu, isProduction } from "@asafarim/shared-ui-react";
import type { ContentCardProps } from "@asafarim/shared-ui-react";
import { fetchPublications } from "../../../services/publicationService";
import "./publications.css";

// Component for publication management actions
const PublicationActions: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
// Check if user is logged in
useEffect(() => {
  // More detailed check for auth token
  const hasTokenInCookie = document.cookie.split(';').some(c => c.trim().startsWith('atk='));
  const tokenInStorage = localStorage.getItem('auth_token');
  
  console.log('Auth check:', { 
    hasTokenInCookie, 
    tokenInStorage,
    cookies: document.cookie
  });
  
  setIsLoggedIn(hasTokenInCookie || !!tokenInStorage);
}, []);
  
  // Handle login redirect
  const handleLoginRedirect = () => {
    const baseUrl = isProduction? 'https://identity.asafarim.be/login' : 'http://identity.asafarim.local:5177/login';
    window.location.href = `${baseUrl}?returnUrl=${encodeURIComponent(window.location.href)}`;
  };
  
  // close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && event.target instanceof HTMLElement && !event.target.closest('.publication-actions')) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // If user is not logged in, show login button
  if (!isLoggedIn) {
    return (
      <div className="publication-actions tooltip">
        <button 
          onClick={handleLoginRedirect}
          className="action-button"
          aria-label="Login"
        >
          <LoginArrow />
        </button>
        <span className="tooltip-text">Login to manage publications</span>
      </div>
    );
  }
  
  return (
    <div className="publication-actions">
      <Button 
        onClick={() => setIsOpen(!isOpen)}
        variant="brand"
        aria-label="Publication actions"
      >
        <DotsMenu />
      </Button>
      
      {isOpen && (
        <div className="dropdown-menu">
          <button 
            onClick={() => {
              // Handle add publication
              window.location.href = '/portfolio/publications/new';
              setIsOpen(false);
            }}
            className="dropdown-item"
          >
            Add Publication
          </button>
          <button 
            onClick={() => {
              // View my publications
              window.location.href = '/portfolio/publications?myPublications=true';
              setIsOpen(false);
            }}
            className="dropdown-item"
          >
            My Publications
          </button>
          <button 
            onClick={() => {
              // Handle manage publications
              window.location.href = '/portfolio/publications/manage';
              setIsOpen(false);
            }}
            className="dropdown-item"
          >
            Manage Publications
          </button>
        </div>
      )}
    </div>
  );
};

const Publications: React.FC = () => {
  const [academicPublications, setAcademicPublications] = useState<ContentCardProps[]>([]);
  const [presentationPublications, setPresentationPublications] = useState<ContentCardProps[]>([]);

  // Get query parameters
  const [searchParams] = useState(new URLSearchParams(window.location.search));
  const myPublications = searchParams.get('myPublications') === 'true';
  
  useEffect(() => {
    const loadPublications = async () => {
      try {       
        // Fetch publications with variant 'publication'
        const academicData = await fetchPublications('publication', undefined, myPublications);
        setAcademicPublications(academicData);
        
        // Fetch presentations (could be a different variant like 'project')
        const presentationData = await fetchPublications('project', undefined, myPublications);
        setPresentationPublications(presentationData);
      } catch (err) {
        console.error('Failed to load publications:', err);
      } 
    };

    loadPublications();
  }, [myPublications]);
  
  // Use API data if available, otherwise use fallback data
  const displayedPublications = academicPublications.length > 0 ? academicPublications : [];
  const displayedPresentations = presentationPublications.length > 0 ? presentationPublications : [];

  return (
    <div className="publications-page">
      <Hero
        kicker="Publications"
        title="Academic & Technical Publications"
        subtitle="My research papers, articles, and conference presentations"
        bullets={[
          "Published in peer-reviewed journals and conferences",
          "Focus on web technologies, software architecture, and performance optimization",
          "Regular speaker at technical conferences and meetups",
        ]}
        primaryCta={{
          label: "View Research",
          to: "/portfolio/research",
        }}
        secondaryCta={{
          label: "Contact Me",
          to: "/contact",
        }}
        media={<div className="hero-media">
          <PublicationActions />
        </div>}
      />

      <div className="publications-container">
        {/* Journal Publications */}
        <section className="publications-section">
          <h2 className="publications-section-title">Journal Publications</h2>
          <div className="publications-grid">
            {displayedPublications.map((publication, index) => (
              <div key={index} className="publication-card">
                <ContentCard {...publication} />
              </div>
            ))}
          </div>
        </section>

        {/* Conference Presentations */}
        <section className="publications-section">
          <h2 className="publications-section-title">Conference Presentations</h2>
          <div className="publications-grid">
            {displayedPresentations.map((presentation, index) => (
              <div key={index} className="publication-card">
                <ContentCard {...presentation} />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Publications;
