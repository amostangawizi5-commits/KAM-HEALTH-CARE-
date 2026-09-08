import React, { useState } from 'react';

const Sidebar = ({ activePage, setActivePage, queueCount = 0, notificationCount = 0 }) => {
  const [expandedMenu, setExpandedMenu] = useState(null);

  const menuItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard',
      subItems: []
    },
    { 
      id: 'patients', 
      label: 'Patients',
      subItems: [
        { id: 'register', label: 'Register' },
        { id: 'patients', label: 'All Patients' },
        { id: 'search', label: 'Search' }
      ]
    },
    { 
      id: 'queue', 
      label: 'Patient Queue',
      subItems: []
    },
    { 
      id: 'appointments', 
      label: 'Appointments',
      subItems: []
    },
    {
      id: 'requests',
      label: 'Requests',
      subItems: []
    },
    {
      id: 'tracking',
      label: 'Tracking',
      subItems: []
    },
    { 
      id: 'notifications', 
      label: 'Notifications',
      subItems: []
    },
  ];

  const toggleMenu = (id) => {
    setExpandedMenu(expandedMenu === id ? null : id);
  };

  const handleMenuClick = (id, subId) => {
    if (subId) {
      setActivePage(subId);
      setExpandedMenu(null);
    } else {
      setActivePage(id);
    }
  };

  const isActive = (item) => {
    if (activePage === item.id) return true;
    if (item.subItems) {
      return item.subItems.some(sub => activePage === sub.id);
    }
    return false;
  };

  return (
    <aside className="reception-portal-sidebar">
      <div className="reception-sidebar-brand">
        <span className="reception-brand-mark">KC</span>
        <strong>KazimiliCare</strong>
      </div>

      <div className="reception-profile-card">
        <div className="reception-profile-avatar">
          RD
        </div>

        <strong>
          Receptionist
        </strong>

        <span>
          Front Desk
        </span>
      </div>

      <nav className="reception-sidebar-nav">
        {menuItems.map((item) => (
          <div className="reception-menu-group" key={item.id}>
            <button
              type="button"
              className={`reception-sidebar-link ${
                isActive(item) ? 'is-active' : ''
              }`}
              onClick={() => {
                if (item.subItems.length > 0) {
                  toggleMenu(item.id);
                } else {
                  handleMenuClick(item.id);
                }
              }}
            >
              <span>{item.label}</span>
              {item.id === 'queue' && (
                <span className="reception-nav-badge">{queueCount}</span>
              )}
              {item.id === 'notifications' && notificationCount > 0 && (
                <span className="reception-nav-badge">{notificationCount}</span>
              )}
            </button>
            {item.subItems.length > 0 && expandedMenu === item.id && (
              <div className="reception-sub-menu">
                {item.subItems.map((sub) => (
                  <button
                    type="button"
                    key={sub.id}
                    className={`reception-sub-link ${
                      activePage === sub.id ? 'is-active' : ''
                    }`}
                    onClick={() => handleMenuClick(item.id, sub.id)}
                  >
                    {sub.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      <div className="reception-sidebar-footer">
        <span>KazimiliCare v1.0.0</span>
      </div>
    </aside>
  );
};

export default Sidebar;
