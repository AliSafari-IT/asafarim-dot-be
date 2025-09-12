import React from 'react';
import { DDMenu, MenuItem } from '@asafarim/dd-menu';

const MinimalDDMenuShowcase: React.FC = () => {
  const menuItems: MenuItem[] = [
    { 
      id: "1", 
      label: "Dashboard", 
      link: "/dashboard",
      icon: "🏠"
    },
    {
      id: "2",
      label: "Projects",
      icon: "📁",
      children: [
        { id: "2-1", label: "Active Projects", link: "/projects/active", icon: "⚡" },
        { id: "2-2", label: "Completed", link: "/projects/completed", icon: "✅" },
        { id: "2-3", label: "Archive", link: "/projects/archive", icon: "📦" },
      ],
    },
    { 
      id: "3", 
      label: "Team", 
      link: "/team",
      icon: "👥"
    },
    { 
      id: "4", 
      label: "Settings", 
      link: "/settings",
      icon: "⚙️"
    },
  ];

  const profileMenuItems: MenuItem[] = [
    { id: "p1", label: "View Profile", link: "/profile", icon: "👤" },
    { id: "p2", label: "Account Settings", link: "/settings", icon: "⚙️" },
    { id: "p3", label: "Help & Support", link: "/help", icon: "❓" },
    { id: "p4", label: "Sign Out", onClick: () => alert('Signing out...'), icon: "🚪" },
  ];

  return (
    <div style={{ 
      padding: '40px', 
      background: '#fafbfc', 
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'
    }}>
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto',
        textAlign: 'center',
        marginBottom: '40px'
      }}>
        <h1 style={{ 
          fontSize: '2.5rem', 
          fontWeight: '700', 
          color: '#1f2937',
          marginBottom: '16px',
          letterSpacing: '-0.02em'
        }}>
          DDMenu - Minimal & Elegant
        </h1>
        <p style={{ 
          fontSize: '1.125rem', 
          color: '#6b7280',
          maxWidth: '600px',
          margin: '0 auto',
          lineHeight: '1.6'
        }}>
          A versatile dropdown menu component for modern React applications.
          Perfect for navbar, sidebar, or any dropdown needs.
        </p>
      </div>

      {/* Navbar Example */}
      <div style={{ 
        background: '#ffffff', 
        padding: '12px 24px',
        borderRadius: '8px',
        marginBottom: '40px',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        border: '1px solid #e5e7eb'
      }}>
        <div style={{ fontWeight: '600', fontSize: '18px', color: '#1f2937' }}>My App</div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <DDMenu 
            items={menuItems} 
            variant="navbar" 
            size="md"
            trigger={<span style={{ padding: '8px 12px', cursor: 'pointer', color: '#374151' }}>Navigation</span>}
            placement="bottom-end"
          />
          <DDMenu 
            items={profileMenuItems} 
            variant="minimal" 
            size="sm"
            trigger={
              <div style={{ 
                width: '32px', 
                height: '32px', 
                borderRadius: '50%', 
                background: '#3b82f6',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                JD
              </div>
            }
            placement="bottom-end"
          />
        </div>
      </div>

      {/* Variant Showcase */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
        gap: '24px',
        marginBottom: '40px'
      }}>
        {/* Default Variant */}
        <div style={{ 
          background: '#ffffff', 
          padding: '24px',
          borderRadius: '8px',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ marginBottom: '16px', color: '#1f2937', fontSize: '16px', fontWeight: '600' }}>Default</h3>
          <DDMenu items={menuItems} variant="default" size="md" />
        </div>

        {/* Minimal Variant */}
        <div style={{ 
          background: '#ffffff', 
          padding: '24px',
          borderRadius: '8px',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ marginBottom: '16px', color: '#1f2937', fontSize: '16px', fontWeight: '600' }}>Minimal</h3>
          <DDMenu items={menuItems} variant="minimal" size="md" />
        </div>

        {/* Small Size */}
        <div style={{ 
          background: '#ffffff', 
          padding: '24px',
          borderRadius: '8px',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ marginBottom: '16px', color: '#1f2937', fontSize: '16px', fontWeight: '600' }}>Small Size</h3>
          <DDMenu items={menuItems} variant="default" size="sm" />
        </div>

        {/* Large Size */}
        <div style={{ 
          background: '#ffffff', 
          padding: '24px',
          borderRadius: '8px',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ marginBottom: '16px', color: '#1f2937', fontSize: '16px', fontWeight: '600' }}>Large Size</h3>
          <DDMenu items={menuItems} variant="default" size="lg" />
        </div>
      </div>

      {/* Dark Theme Example */}
      <div style={{ 
        background: '#1f2937', 
        padding: '40px',
        borderRadius: '8px',
        marginBottom: '40px',
        border: '1px solid #374151'
      }}>
        <h2 style={{ 
          color: '#f9fafb',
          marginBottom: '24px',
          textAlign: 'center',
          fontSize: '20px',
          fontWeight: '600'
        }}>
          Dark Theme
        </h2>
        <div style={{ 
          display: 'flex', 
          gap: '24px', 
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <DDMenu items={menuItems} theme="dark" variant="default" size="md" />
          <DDMenu items={menuItems} theme="dark" variant="minimal" size="md" />
        </div>
      </div>

      {/* Sidebar Example */}
      <div style={{ 
        background: '#ffffff', 
        padding: '24px',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
        marginBottom: '40px'
      }}>
        <h2 style={{ 
          color: '#1f2937',
          marginBottom: '24px',
          textAlign: 'center',
          fontSize: '20px',
          fontWeight: '600'
        }}>
          Sidebar Variant
        </h2>
        <div style={{ 
          maxWidth: '300px', 
          margin: '0 auto',
          border: '1px solid #e5e7eb',
          borderRadius: '6px',
          padding: '16px',
          background: '#f9fafb'
        }}>
          <DDMenu items={menuItems} variant="sidebar" size="md" />
        </div>
      </div>

      {/* Custom Trigger Examples */}
      <div style={{ 
        background: '#ffffff', 
        padding: '24px',
        borderRadius: '8px',
        border: '1px solid #e5e7eb'
      }}>
        <h2 style={{ 
          color: '#1f2937',
          marginBottom: '24px',
          textAlign: 'center',
          fontSize: '20px',
          fontWeight: '600'
        }}>
          Custom Triggers
        </h2>
        <div style={{ 
          display: 'flex', 
          gap: '24px', 
          justifyContent: 'center',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          {/* Button Trigger */}
          <DDMenu 
            items={menuItems} 
            variant="minimal"
            trigger={
              <button style={{
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '500',
                fontSize: '14px'
              }}>
                Action Menu
              </button>
            }
          />

          {/* Icon Trigger */}
          <DDMenu 
            items={profileMenuItems} 
            variant="minimal"
            trigger={
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: '#f3f4f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '20px',
                border: '1px solid #e5e7eb'
              }}>
                ⚙️
              </div>
            }
            placement="bottom-end"
          />

          {/* Text Trigger */}
          <DDMenu 
            items={menuItems} 
            variant="navbar"
            trigger={
              <span style={{
                color: '#3b82f6',
                fontWeight: '500',
                cursor: 'pointer',
                fontSize: '14px',
                padding: '4px 8px',
                borderRadius: '4px'
              }}>
                More Options
              </span>
            }
          />
        </div>
      </div>

      {/* Features */}
      <div style={{
        marginTop: '40px',
        textAlign: 'center',
        background: '#ffffff',
        padding: '32px',
        borderRadius: '8px',
        border: '1px solid #e5e7eb'
      }}>
        <h3 style={{ 
          fontSize: '18px', 
          fontWeight: '600', 
          color: '#1f2937',
          marginBottom: '24px'
        }}>
          Key Features
        </h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '16px'
        }}>
          {[
            '🎨 Minimal & clean design',
            '⚡ Multiple variants',
            '🎯 TypeScript support',
            '📱 Mobile responsive',
            '♿ Accessible',
            '🎨 Custom triggers'
          ].map((feature, index) => (
            <div key={index} style={{
              padding: '12px',
              background: '#f9fafb',
              borderRadius: '6px',
              border: '1px solid #e5e7eb',
              color: '#6b7280',
              fontSize: '13px',
              fontWeight: '500'
            }}>
              {feature}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MinimalDDMenuShowcase;
