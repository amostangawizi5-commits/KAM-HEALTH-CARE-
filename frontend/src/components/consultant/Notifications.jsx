// src/components/consultant/Notifications.jsx
import React, { useState } from 'react';

const softShadow = '0 2px 12px rgba(0, 0, 0, 0.06)';
const textDark = '#1a2332';

const typeLabels = {
  NEW_REQUEST: 'New Patient Request',
  COMPLETED: 'Consultation Completed',
  REMINDER: 'Appointment Reminder',
  SUCCESS: 'Patient Registration Complete',
  WARNING: 'Warning',
  INFO: 'Information',
};

const Notifications = ({
  notifications,
  pagination,
  onPageChange,
  onMarkRead,
  onMarkAllRead,
  onRefresh,
}) => {
  const [filter, setFilter] = useState('ALL');

  const unreadCount = notifications?.filter((notification) => !notification.read).length || 0;
  const readCount = notifications?.filter((notification) => notification.read).length || 0;
  const filteredNotifications = filter === 'ALL'
    ? notifications
    : filter === 'UNREAD'
      ? notifications?.filter((notification) => !notification.read)
      : notifications?.filter((notification) => notification.read);

  const totalPages = Math.ceil((pagination?.total || 0) / (pagination?.limit || 10));

  return (
    <div className="bg-white rounded-4 p-3 p-md-4 shadow-sm" style={{ boxShadow: softShadow }}>
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <h2 className="h4 fw-bold mb-0" style={{ color: textDark }}>Notifications</h2>
        <div className="d-flex flex-wrap gap-2">
          <button className="btn btn-outline-secondary fw-medium" onClick={onMarkAllRead}>Mark all read</button>
          <button className="btn btn-light fw-medium" onClick={onRefresh}>Refresh</button>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-12 col-md-4">
          <div className="bg-light rounded-3 p-3">
            <span className="small text-secondary">New</span>
            <p className="h4 fw-bold mb-0" style={{ color: textDark }}>{unreadCount}</p>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className="bg-light rounded-3 p-3">
            <span className="small text-secondary">Unread</span>
            <p className="h4 fw-bold mb-0" style={{ color: textDark }}>{unreadCount}</p>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className="bg-light rounded-3 p-3">
            <span className="small text-secondary">Read</span>
            <p className="h4 fw-bold mb-0" style={{ color: textDark }}>{readCount}</p>
          </div>
        </div>
      </div>

      <div className="btn-group mb-4" role="group" aria-label="Notification filters">
        {['ALL', 'UNREAD', 'READ'].map((value) => (
          <button
            key={value}
            type="button"
            className={`btn btn-sm ${filter === value ? 'btn-info text-white' : 'btn-outline-secondary'}`}
            onClick={() => setFilter(value)}
          >
            {value.charAt(0) + value.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      <div className="d-flex flex-column gap-3">
        {filteredNotifications && filteredNotifications.length > 0 ? (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`border rounded-4 p-3 ${notification.read ? 'bg-white' : 'bg-info bg-opacity-10 border-info'}`}
            >
              <div className="d-flex gap-3">
                <span className="d-inline-flex align-items-center justify-content-center rounded-circle bg-light flex-shrink-0" style={{ width: 44, height: 44 }}>
                  {notification.icon || ''}
                </span>
                <div className="flex-grow-1">
                  <div className="d-flex justify-content-between gap-3 flex-wrap">
                    <h4 className="h6 fw-semibold mb-1" style={{ color: textDark }}>
                      {typeLabels[notification.type] || notification.type}
                    </h4>
                    <span className="small text-secondary">{notification.time}</span>
                  </div>
                  <p className="text-secondary mb-3">{notification.message}</p>
                  <div className="d-flex flex-wrap gap-2">
                    {!notification.read && (
                      <button className="btn btn-outline-secondary btn-sm" onClick={() => onMarkRead(notification.id)}>Mark as read</button>)}
                    {notification.type === 'NEW_REQUEST' && (
                      <>
                        <button className="btn btn-success btn-sm">Accept</button>
                        <button className="btn btn-danger btn-sm">Reject</button>
                      </>)}
                    {notification.type === 'COMPLETED' && (
                      <button className="btn btn-info text-white btn-sm">View Details</button>)}
                    {notification.type === 'REMINDER' && (
                      <button className="btn btn-info text-white btn-sm">View Appointment</button>)}
                    {notification.type === 'SUCCESS' && (
                      <button className="btn btn-info text-white btn-sm">View Patient</button>)}
                  </div>
                </div>
              </div>
            </div>))) : (
          <div className="text-center text-secondary py-5">
            <span className="d-block h5">No alerts</span>
            <p className="mb-0">No notifications</p>
          </div>)}
      </div>

      {pagination?.total > 0 && (
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mt-4">
          <span className="small text-secondary">
            Showing {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
          </span>
          <nav aria-label="Notification pagination">
            <ul className="pagination pagination-sm mb-0">
              <li className={`page-item ${pagination.page === 1 ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => onPageChange(pagination.page - 1)}>&lt;</button>
              </li>
              {[...Array(totalPages)].map((_, i) => (
                <li key={i} className={`page-item ${pagination.page === i + 1 ? 'active' : ''}`}>
                  <button className="page-link" onClick={() => onPageChange(i + 1)}>{i + 1}</button>
                </li>))}
              <li className={`page-item ${pagination.page === totalPages ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => onPageChange(pagination.page + 1)}>&gt;</button>
              </li>
            </ul>
          </nav>
        </div>)}
    </div>);
};

export default Notifications;
