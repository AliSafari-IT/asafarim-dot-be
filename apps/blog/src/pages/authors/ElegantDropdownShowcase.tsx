import React from 'react';
import { DDMenu, MenuItem } from '@asafarim/dd-menu';

const ElegantDropdownShowcase: React.FC = () => {
  // Main navigation menu items
  const navMenuItems: MenuItem[] = [
    { 
      id: "dashboard", 
      label: "Dashboard", 
      link: "/dashboard",
      icon: "🏠"
    },
    {
      id: "projects",
      label: "Projects",
      icon: "📁",
      children: [
        { id: "active-projects", label: "Active Projects", link: "/projects/active", icon: "⚡" },
        { id: "completed", label: "Completed", link: "/projects/completed", icon: "✅" },
        { id: "archive", label: "Archive", link: "/projects/archive", icon: "📦" },
      ],
    },
    { 
      id: "team", 
      label: "Team", 
      link: "/team",
      icon: "👥"
    },
    { 
      id: "analytics", 
      label: "Analytics", 
      link: "/analytics",
      icon: "📊"
    },
  ];

  // User profile menu
  const profileMenuItems: MenuItem[] = [
    { id: "profile", label: "View Profile", link: "/profile", icon: "👤" },
    { id: "settings", label: "Settings", link: "/settings", icon: "⚙️" },
    { id: "billing", label: "Billing", link: "/billing", icon: "💳" },
    { id: "divider1", label: "—", disabled: true },
    { id: "help", label: "Help & Support", link: "/help", icon: "❓" },
    { id: "logout", label: "Sign Out", onClick: () => alert('Signing out...'), icon: "🚪" },
  ];

  // Sidebar menu items
  const sidebarMenuItems: MenuItem[] = [
    { id: "home", label: "Home", link: "/", icon: "🏠" },
    { 
      id: "workspace", 
      label: "Workspace", 
      icon: "💼",
      children: [
        { id: "my-workspace", label: "My Workspace", link: "/workspace/mine" },
        { id: "shared", label: "Shared with me", link: "/workspace/shared" },
        { id: "recent", label: "Recent", link: "/workspace/recent" },
      ]
    },
    { id: "favorites", label: "Favorites", link: "/favorites", icon: "⭐" },
    { id: "trash", label: "Trash", link: "/trash", icon: "🗑️" },
  ];

  return (
    <div style={{ 
      minHeight: '100vh',
      background: '#fafbfc',
      fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    }}>
      {/* Header */}
      <div style={{ 
        textAlign: 'center',
        padding: '60px 20px 40px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white'
      }}>
        <h1 style={{ 
          fontSize: '3rem', 
          fontWeight: '700', 
          margin: '0 0 16px',
          letterSpacing: '-0.02em'
        }}>
          Elegant Dropdown Menus
        </h1>
        <p style={{ 
          fontSize: '1.25rem', 
          opacity: 0.9,
          maxWidth: '600px',
          margin: '0 auto',
          lineHeight: '1.6'
        }}>
          Minimal, beautiful, and highly customizable dropdown components for modern web applications
        </p>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
        
        {/* Modern Navbar Example */}
        <section style={{ marginBottom: '60px' }}>
          <h2 style={{ 
            fontSize: '1.5rem', 
            fontWeight: '600', 
            color: '#1f2937',
            marginBottom: '20px'
          }}>
            Modern Navigation Bar
          </h2>
          
          <div style={{ 
            background: '#ffffff', 
            padding: '16px 24px',
            borderRadius: '12px',
            marginBottom: '20px',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            border: '1px solid #e5e7eb'
          }}>
            {/* Logo */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px'
              }}>
                ✨
              </div>
              <span style={{ 
                fontWeight: '700', 
                fontSize: '20px', 
                color: '#1f2937'
              }}>
                Acme Corp
              </span>
            </div>

            {/* Navigation */}
            <div style={{ 
              display: 'flex', 
              gap: '8px', 
              alignItems: 'center' 
            }}>
              {/* Navigation Menu */}
              <DDMenu 
                items={navMenuItems} 
                variant="navbar" 
                size="md"
                trigger={
                  <span style={{ 
                    padding: '8px 16px', 
                    cursor: 'pointer', 
                    color: '#374151',
                    fontWeight: '500',
                    borderRadius: '6px',
                    transition: 'all 0.12s ease'
                  }}>
                    Navigation
                  </span>
                }
                placement="bottom-end"
              />

              {/* Profile Menu */}
              <DDMenu 
                items={profileMenuItems} 
                variant="navbar" 
                size="md"
                trigger={
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 12px',
                    cursor: 'pointer',
                    borderRadius: '8px',
                    transition: 'all 0.12s ease'
                  }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '14px',
                      fontWeight: '600'
                    }}>
                      JD
                    </div>
                    <span style={{ 
                      color: '#374151', 
                      fontWeight: '500',
                      fontSize: '14px'
                    }}>
                      John Doe
                    </span>
                  </div>
                }
                placement="bottom-end"
              />
            </div>
          </div>
          
          <p style={{ 
            color: '#6b7280', 
            fontSize: '14px',
            fontStyle: 'italic'
          }}>
            Perfect for application headers and navigation bars with clean, professional styling
          </p>
        </section>

        {/* Minimal Examples */}
        <section style={{ marginBottom: '60px' }}>
          <h2 style={{ 
            fontSize: '1.5rem', 
            fontWeight: '600', 
            color: '#1f2937',
            marginBottom: '20px'
          }}>
            Minimal Variants
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px',
            marginBottom: '20px'
          }}>
            {/* Minimal Style */}
            <div style={{
              background: '#ffffff',
              padding: '24px',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
              textAlign: 'center'
            }}>
              <h3 style={{ 
                fontSize: '1.125rem', 
                fontWeight: '600', 
                color: '#1f2937',
                marginBottom: '16px'
              }}>
                Ultra Minimal
              </h3>
              <DDMenu 
                items={navMenuItems} 
                variant="minimal" 
                size="md"
                trigger={
                  <span style={{ 
                    color: '#374151',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}>
                    Click me ↓
                  </span>
                }
              />
              <p style={{ 
                color: '#6b7280', 
                fontSize: '13px',
                marginTop: '12px',
                fontStyle: 'italic'
              }}>
                No borders, just hover effects
              </p>
            </div>

            {/* Small Size */}
            <div style={{
              background: '#ffffff',
              padding: '24px',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
              textAlign: 'center'
            }}>
              <h3 style={{ 
                fontSize: '1.125rem', 
                fontWeight: '600', 
                color: '#1f2937',
                marginBottom: '16px'
              }}>
                Small Size
              </h3>
              <DDMenu 
                items={navMenuItems} 
                variant="minimal" 
                size="sm"
                trigger={
                  <span style={{ 
                    color: '#374151',
                    fontWeight: '500',
                    cursor: 'pointer',
                    fontSize: '13px'
                  }}>
                    Compact menu ↓
                  </span>
                }
              />
              <p style={{ 
                color: '#6b7280', 
                fontSize: '13px',
                marginTop: '12px',
                fontStyle: 'italic'
              }}>
                Perfect for tight spaces
              </p>
            </div>

            {/* Large Size */}
            <div style={{
              background: '#ffffff',
              padding: '24px',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
              textAlign: 'center'
            }}>
              <h3 style={{ 
                fontSize: '1.125rem', 
                fontWeight: '600', 
                color: '#1f2937',
                marginBottom: '16px'
              }}>
                Large Size
              </h3>
              <DDMenu 
                items={navMenuItems} 
                variant="minimal" 
                size="lg"
                trigger={
                  <span style={{ 
                    color: '#374151',
                    fontWeight: '500',
                    cursor: 'pointer',
                    fontSize: '15px'
                  }}>
                    Spacious menu ↓
                  </span>
                }
              />
              <p style={{ 
                color: '#6b7280', 
                fontSize: '13px',
                marginTop: '12px',
                fontStyle: 'italic'
              }}>
                More comfortable touch targets
              </p>
            </div>
          </div>
        </section>

        {/* Sidebar Example */}
        <section style={{ marginBottom: '60px' }}>
          <h2 style={{ 
            fontSize: '1.5rem', 
            fontWeight: '600', 
            color: '#1f2937',
            marginBottom: '20px'
          }}>
            Sidebar Navigation
          </h2>
          
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            overflow: 'hidden',
            display: 'flex',
            minHeight: '400px'
          }}>
            {/* Sidebar */}
            <div style={{
              width: '280px',
              background: '#f9fafb',
              padding: '24px 16px',
              borderRight: '1px solid #e5e7eb'
            }}>
              <div style={{
                marginBottom: '20px',
                paddingLeft: '12px'
              }}>
                <h4 style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  margin: 0
                }}>
                  Navigation
                </h4>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {sidebarMenuItems.map((item) => (
                  <DDMenu 
                    key={item.id}
                    items={item.children ? [item] : []} 
                    variant="sidebar" 
                    size="md"
                    trigger={
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 16px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        transition: 'all 0.12s ease',
                        color: '#374151',
                        fontWeight: '500',
                        width: '100%',
                        textAlign: 'left'
                      }}>
                        <span style={{ fontSize: '16px' }}>{item.icon}</span>
                        <span style={{ flex: 1 }}>{item.label}</span>
                        {item.children && (
                          <span style={{ fontSize: '12px', opacity: 0.6 }}>▼</span>
                        )}
                      </div>
                    }
                  />
                ))}
              </div>
            </div>

            {/* Content Area */}
            <div style={{
              flex: 1,
              padding: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#6b7280'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '48px',
                  marginBottom: '16px'
                }}>
                  📄
                </div>
                <p style={{
                  fontSize: '16px',
                  fontWeight: '500'
                }}>
                  Click on sidebar items to see dropdown behavior
                </p>
              </div>
            </div>
          </div>
          
          <p style={{ 
            color: '#6b7280', 
            fontSize: '14px',
            fontStyle: 'italic',
            marginTop: '16px'
          }}>
            Ideal for application sidebars with collapsible sections
          </p>
        </section>

        {/* Custom Styling Examples */}
        <section style={{ marginBottom: '60px' }}>
          <h2 style={{ 
            fontSize: '1.5rem', 
            fontWeight: '600', 
            color: '#1f2937',
            marginBottom: '20px'
          }}>
            Custom Styling
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '24px'
          }}>
            {/* Custom Button Style */}
            <div style={{
              background: '#ffffff',
              padding: '24px',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
              textAlign: 'center'
            }}>
              <h3 style={{ 
                fontSize: '1.125rem', 
                fontWeight: '600', 
                color: '#1f2937',
                marginBottom: '16px'
              }}>
                Custom Button
              </h3>
              <DDMenu 
                items={profileMenuItems} 
                variant="minimal"
                trigger={
                  <button style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                    transition: 'all 0.15s ease'
                  }}>
                    My Account ↓
                  </button>
                }
              />
            </div>

            {/* Icon Button */}
            <div style={{
              background: '#ffffff',
              padding: '24px',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
              textAlign: 'center'
            }}>
              <h3 style={{ 
                fontSize: '1.125rem', 
                fontWeight: '600', 
                color: '#1f2937',
                marginBottom: '16px'
              }}>
                Icon Button
              </h3>
              <DDMenu 
                items={navMenuItems} 
                variant="minimal"
                trigger={
                  <div style={{
                    width: '48px',
                    height: '48px',
                    background: '#f3f4f6',
                    borderRadius: '12px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontSize: '20px',
                    transition: 'all 0.15s ease',
                    border: '2px solid transparent'
                  }}>
                    ⚙️
                  </div>
                }
              />
            </div>
          </div>
        </section>

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          color: '#6b7280'
        }}>
          <p style={{ fontSize: '14px' }}>
            Made with ❤️ using <strong>@asafarim/dd-menu</strong> v1.1.0
          </p>
        </div>
      </div>
    </div>
  );
};

export default ElegantDropdownShowcase;
