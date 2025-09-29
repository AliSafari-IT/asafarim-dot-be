import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@asafarim/shared-ui-react";
import { fetchPublicationById } from "../../../services/publicationService";
import type { ContentCardProps } from "@asafarim/shared-ui-react";
import "./pub-styles.css";

export default function ViewPublication() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [publication, setPublication] = useState<ContentCardProps | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Get publication ID from route params
  const publicationId = id;

  useEffect(() => {
    const loadPublication = async () => {
      if (!publicationId) {
        setError("Publication ID is required");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await fetchPublicationById(publicationId);
        
        if (data) {
          setPublication(data);
        } else {
          setError("Publication not found");
        }
      } catch (err) {
        console.error('Error loading publication:', err);
        setError("Failed to load publication data");
      } finally {
        setLoading(false);
      }
    };

    loadPublication();
  }, [publicationId]);

  const handleBack = () => {
    navigate(-1); // Go back to previous page
  };

  if (loading) {
    return (
      <div className="publication-view-container">
        <div className="publication-view-loading">Loading publication data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="publication-view-container">
        <div className="publication-view-error">{error}</div>
        <Button onClick={handleBack}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="publication-view-container">
      <div className="publication-view-header">
        <Button onClick={handleBack} variant="secondary">← Back</Button>
        <h1 className="publication-view-title">Publication Details</h1>
      </div>
      
      <div className="publication-view-content">
        <div className="publication-view-info">
          <h2 className="publication-view-main-title">{publication?.title}</h2>
          {publication?.subtitle && (
            <h3 className="publication-view-subtitle">{publication.subtitle}</h3>
          )}
          {publication?.meta && (
            <p className="publication-view-meta">{publication.meta}</p>
          )}
          {publication?.year && (
            <p className="publication-view-year">Year: {publication.year}</p>
          )}
        </div>
        
        {publication?.description && (
          <div className="publication-view-description">
            <h3>Description</h3>
            <p>{publication.description}</p>
          </div>
        )}
        
        {publication?.link && (
          <div className="publication-view-external-link">
            <h3>External Link</h3>
            <a 
              href={publication.link}
              target="_blank"
              rel="noopener noreferrer"
              className="publication-view-link"
            >
              {publication.link}
            </a>
          </div>
        )}
        
        {publication?.tags && publication.tags.length > 0 && (
          <div className="publication-view-tags">
            <h3>Tags</h3>
            <div className="publication-view-tag-list">
              {publication.tags.map((tag, index) => (
                <span key={index} className="publication-view-tag">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {publication?.metrics && publication.metrics.length > 0 && (
          <div className="publication-view-metrics">
            <h3>Metrics</h3>
            <div className="publication-view-metric-list">
              {publication.metrics.map((metric, index) => (
                <div key={index} className="publication-view-metric">
                  <span className="publication-view-metric-label">{metric.label}:</span>
                  <span className="publication-view-metric-value">{metric.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
