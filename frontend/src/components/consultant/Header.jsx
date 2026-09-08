// src/components/consultant/Header.jsx
import React from 'react';

const Header = ({ user, notifications, setActivePage, toggleSidebar }) => {
  const today = new Date();
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const dateString = today.toLocaleDateString('en-US', options);

  const getTimeGreeting = () => {
    const hour = today.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const unreadCount = notifications?.filter(n => !n.read).length || 0;

  return (
    <header className="sticky-top d-flex justify-content-between align-items-center bg-white border-bottom shadow-sm px-3 px-md-4 py-3" style={{ zIndex: 100 }}>
      <div className="d-flex align-items-center gap-3">
        <button
          className="navbar-toggler d-md-none border-0 p-1"
          type="button"
          onClick={toggleSidebar}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div>
          <h1 className="h5 fw-bold mb-1" style={{ color: '#1a2332' }}>
            {getTimeGreeting()}, {user?.name || 'Dr. Sarah'} 
          </h1>
          <p className="small text-secondary mb-0">{dateString}</p>
        </div>
      </div>
      <div className="d-flex align-items-center gap-2 gap-md-3">
        <button
          type="button"
          className="btn btn-light position-relative fw-semibold"
          onClick={() => setActivePage('notifications')}
        >
          Notifications
          {unreadCount > 0 && (
            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
              {unreadCount}
            </span>)}
        </button>
        <div className="d-none d-md-flex align-items-center gap-2 bg-light rounded-pill px-3 py-2">
          <span className="d-inline-block rounded-circle" style={{ width: 8, height: 8, background: '#4caf50' }}></span>
          <span className="small" style={{ color: '#1a2332' }}>
            Online
          </span>
        </div>
        <div className="d-flex align-items-center gap-2 bg-light rounded-3 px-2 px-md-3 py-2">
          <span className="d-inline-flex align-items-center justify-content-center rounded-circle fw-bold text-info" style={{ width: 36, height: 36, background: 'rgba(79, 195, 247, 0.15)' }}>
            User
          </span>
          <div className="d-none d-sm-flex flex-column lh-sm">
            <span className="small fw-semibold" style={{ color: '#1a2332' }}>{user?.name || 'Dr. Sarah'}</span>
            <span className="text-secondary" style={{ fontSize: 11 }}>{user?.specialty || 'Consultant'}</span>
          </div>
        </div>
      </div>
    </header>);
};

export default Header;
