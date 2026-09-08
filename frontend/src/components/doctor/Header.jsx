import React from 'react';

const Header = ({ user, notifications, setActivePage, toggleSidebar }) => {
  const today = new Date();
  const dateString = today.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const unreadCount = notifications?.filter(n => !n.read).length || 0;

  const getTimeGreeting = () => {
    const hour = today.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <header className="bg-white border-bottom px-3 px-md-4 py-3 d-flex align-items-center justify-content-between flex-wrap gap-3">
      <div className="d-flex align-items-center gap-3">
        {toggleSidebar && (
          <button type="button" className="btn btn-outline-secondary d-md-none" onClick={toggleSidebar} aria-label="Toggle sidebar">
            Menu
          </button>
        )}
        <div>
          <h1 className="h4 fw-bold mb-1">
            {getTimeGreeting()}, {user?.name || 'Dr. Michael'} 
          </h1>
          <p className="text-secondary small mb-0">{dateString}</p>
        </div>
      </div>
      <button type="button" className="btn btn-outline-success position-relative fw-semibold" onClick={() => setActivePage?.('notifications')}>
        Notifications
        {unreadCount > 0 && (
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill text-bg-danger">{unreadCount}</span>
        )}
      </button>
    </header>);
};

export default Header;
