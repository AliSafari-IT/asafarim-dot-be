import React from 'react';
import { Dropdown, DropdownItem, DropdownDivider } from '@asafarim/shared-ui-react';

const DropdownExample = () => {
  return (
    <div style={{ padding: '40px', fontFamily: 'system-ui' }}>
      <h1>Dropdown Component Examples</h1>
      
      <div style={{ display: 'flex', gap: '40px', marginTop: '40px', flexWrap: 'wrap' }}>
        
        {/* Basic Dropdown */}
        <div>
          <h3>Basic Dropdown</h3>
          <Dropdown
            items={
              <>
                <DropdownItem label="Dashboard" icon="🏠" onClick={() => console.log('Dashboard')} />
                <DropdownItem label="Projects" icon="📁" onClick={() => console.log('Projects')} />
                <DropdownItem label="Team" icon="👥" onClick={() => console.log('Team')} />
              </>
            }
          >
            <button style={{ padding: '8px 16px', cursor: 'pointer' }}>
              Open Menu
            </button>
          </Dropdown>
        </div>

        {/* User Profile Dropdown */}
        <div>
          <h3>User Profile Menu</h3>
          <Dropdown
            placement="bottom-end"
            items={
              <>
                <DropdownItem label="Profile" icon="👤" onClick={() => console.log('Profile')} />
                <DropdownItem label="Settings" icon="⚙️" onClick={() => console.log('Settings')} />
                <DropdownItem label="Billing" icon="💳" onClick={() => console.log('Billing')} />
                <DropdownDivider />
                <DropdownItem label="Help" icon="❓" onClick={() => console.log('Help')} />
                <DropdownItem label="Logout" icon="🚪" danger onClick={() => alert('Logging out...')} />
              </>
            }
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              cursor: 'pointer',
              border: '1px solid #ddd',
              borderRadius: '8px'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                background: '#667eea',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: '600'
              }}>
                JD
              </div>
              <span>John Doe</span>
            </div>
          </Dropdown>
        </div>

        {/* Actions Menu */}
        <div>
          <h3>Actions Menu</h3>
          <Dropdown
            items={
              <>
                <DropdownItem label="Edit" icon="✏️" onClick={() => console.log('Edit')} />
                <DropdownItem label="Duplicate" icon="📋" onClick={() => console.log('Duplicate')} />
                <DropdownItem label="Archive" icon="📦" onClick={() => console.log('Archive')} />
                <DropdownDivider />
                <DropdownItem label="Delete" icon="🗑️" danger onClick={() => console.log('Delete')} />
              </>
            }
          >
            <button style={{ padding: '8px 16px', cursor: 'pointer' }}>
              Actions ⋮
            </button>
          </Dropdown>
        </div>

      </div>
    </div>
  );
};

export default DropdownExample;
