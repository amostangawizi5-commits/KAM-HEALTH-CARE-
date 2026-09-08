import React from 'react';

const Header = ({ user, notifications, setActivePage }) => {
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
  const displayName = user?.name || 'Receptionist';

  return (
    <header className="reception-toolbar">
      <div className="reception-toolbar-spacer" />

      <div className="reception-greeting">
        <h1>
          {getTimeGreeting()}, {displayName}
        </h1>
        <p>Reception Desk - {dateString}</p>
      </div>

      <div className="reception-toolbar-actions">
        <button
          type="button"
          className="reception-notification-button"
          onClick={() => setActivePage('notifications')}
        >
          <span>Notifications</span>
          {unreadCount > 0 && (
            <span className="reception-notification-count">{unreadCount}</span>
          )}
        </button>
      </div>
    </header>
  );
};

export default Header;
