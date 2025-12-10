import React from "react";
import "../styles/components/dashboard-card.css";

interface DashboardCardProps {
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

export default function DashboardCard({
  title,
  children,
  icon,
  action,
}: DashboardCardProps) {
  return (
    <div className="flt-dashboard-card">
      <div className="flt-dashboard-card-header">
        <div className="flt-dashboard-card-title-section">
          {icon && <span className="flt-dashboard-card-icon">{icon}</span>}
          <h3 className="flt-dashboard-card-title">{title}</h3>
        </div>
        {action && (
          <a
            href={action.href || "#"}
            onClick={(e) => {
              if (action.onClick) {
                e.preventDefault();
                action.onClick();
              }
            }}
            className="flt-dashboard-card-action"
          >
            {action.label} →
          </a>
        )}
      </div>
      <div className="flt-dashboard-card-content">{children}</div>
    </div>
  );
}
