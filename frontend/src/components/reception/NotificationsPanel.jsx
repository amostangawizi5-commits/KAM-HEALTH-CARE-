import React from 'react';

const notificationClass = (type, read) => {
  if (read) return 'border-secondary bg-light';
  if (type === 'success') return 'border-success bg-success-subtle';
  if (type === 'warning') return 'border-warning bg-warning-subtle';
  return 'border-info bg-info-subtle';
};

const NotificationsPanel = ({ notifications, onMarkAllRead }) => {
  return (
    <div className="card border-0 shadow-sm">
      <div className="card-body">
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-3">
        <h2 className="h4 fw-bold mb-0">Notifications</h2>
        <button className="btn btn-outline-success fw-semibold" onClick={onMarkAllRead}>Mark all read</button>
      </div>

      <div className="d-grid gap-2">
        {notifications && notifications.length > 0 ? (
          notifications.map((n) => (
            <div key={n.id} className={`border-start border-4 rounded p-3 ${notificationClass(n.type, n.read)}`}>
              <div>
                <p className="fw-semibold mb-1">{n.message}</p>
                <span className="small text-secondary">{n.time}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-secondary py-4">
            No notifications
          </div>
        )}
      </div>
      </div>
    </div>
  );
};

export default NotificationsPanel;
