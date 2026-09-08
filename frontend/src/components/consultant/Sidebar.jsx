// src/components/consultant/Sidebar.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import AccountMenu from '../common/AccountMenu';

const sidebarStyle = {
  background: 'linear-gradient(180deg, #0f1724 0%, #1a2332 100%)',
  color: '#e2e8f0',
  boxShadow: '4px 0 20px rgba(0, 0, 0, 0.3)',
};

const Sidebar = ({ activePage, setActivePage, user, isOpen = false, onClose }) => {
  const navigate = useNavigate();

  const menuItems = [
    { id: 'dashboard', icon: '', label: 'Dashboard', badge: null },
    { id: 'requests', icon: '', label: 'Patient Requests', badge: '8' },
    { id: 'consultations', icon: '', label: 'Consultations', badge: '4' },
    { id: 'patients', icon: '', label: 'My Patients', badge: null },
    { id: 'tracking', icon: '', label: 'Patient Tracking', badge: null },
    { id: 'notifications', icon: '', label: 'Notifications', badge: '3' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleItemClick = (id) => {
    setActivePage(id);
    onClose?.();
  };

  const renderContent = (compact = false) => (
    <>
      <div className={`d-flex align-items-center gap-3 px-3 pb-3 border-bottom ${compact ? 'justify-content-center' : ''}`} style={{ borderColor: 'rgba(255,255,255,.08)' }}>
        <span className="d-inline-flex align-items-center justify-content-center rounded-circle fw-bold fs-5 text-white" style={{ width: 44, height: 44, background: 'rgba(79, 195, 247, 0.15)' }}>
          KC
        </span>
        {!compact && (
          <div>
            <h2 className="h5 fw-bold text-white mb-0">
              Kazimi<span style={{ color: '#4fc3f7' }}>Care</span>
            </h2>
            <p className="text-uppercase mb-0" style={{ color: '#8898aa', fontSize: 10, letterSpacing: 1 }}>Consultant Panel</p>
          </div>)}
      </div>

      {!compact && (
        <div className="d-flex align-items-center gap-3 px-3 py-3 border-bottom" style={{ borderColor: 'rgba(255,255,255,.08)' }}>
          <span className="d-inline-flex align-items-center justify-content-center rounded-circle fw-bold text-info" style={{ width: 44, height: 44, background: 'rgba(79, 195, 247, 0.15)' }}>
            User
          </span>
          <div>
            <p className="small fw-semibold text-white mb-0">{user?.name || 'Dr. Sarah'}</p>
            <p className="mb-0" style={{ color: '#8898aa', fontSize: 11 }}>{user?.specialty || 'Consultant'}</p>
          </div>
        </div>)}

      <nav className="d-flex flex-column gap-1 flex-grow-1 px-2 py-3">
        {menuItems.map((item) => {
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              type="button"
              className={`btn d-flex align-items-center gap-3 border-0 text-start rounded-3 px-3 py-2 ${compact ? 'justify-content-center' : ''}`}
              style={{
                color: isActive ? '#4fc3f7' : '#8898aa',
                background: isActive ? 'rgba(79, 195, 247, 0.15)' : 'transparent',
              }}
              onClick={() => handleItemClick(item.id)}
              title={compact ? item.label : undefined}
            >
              <span className="d-inline-block text-center" style={{ width: 24 }}>{item.icon}</span>
              {!compact && <span className="small fw-semibold flex-grow-1">{item.label}</span>}
              {!compact && item.badge && <span className="badge rounded-pill bg-danger">{item.badge}</span>}
            </button>);
        })}
      </nav>

      <div className="d-flex flex-column gap-1 border-top px-2 pt-3" style={{ borderColor: 'rgba(255,255,255,.08)' }}>
        <button
          type="button"
          className={`btn d-flex align-items-center gap-3 border-0 text-start rounded-3 px-3 py-2 ${compact ? 'justify-content-center' : ''}`}
          style={{ color: '#8898aa' }}
          title={compact ? 'Settings' : undefined}
        >
          <span className="d-inline-block text-center" style={{ width: 24 }}></span>
          {!compact && <span className="small fw-semibold">Settings</span>}
        </button>
        <AccountMenu onLogout={handleLogout} />
      </div>
    </>
  );

  return (
    <>
      <aside className="d-none d-lg-flex flex-column sticky-top vh-100 flex-shrink-0 py-3 overflow-auto" style={{ ...sidebarStyle, width: 260 }}>
        {renderContent(false)}
      </aside>

      <aside className="d-none d-md-flex d-lg-none flex-column sticky-top vh-100 flex-shrink-0 py-3 overflow-auto" style={{ ...sidebarStyle, width: 72 }}>
        {renderContent(true)}
      </aside>

      {isOpen && (
        <div
          className="modal-backdrop fade show d-md-none"
          onClick={onClose}
          role="presentation"
        ></div>)}

      <aside
        className="d-md-none position-fixed top-0 bottom-0 start-0 d-flex flex-column py-3 overflow-auto"
        style={{ ...sidebarStyle, width: 280, zIndex: 1050, transition: 'transform 0.3s ease', transform: isOpen ? 'translateX(0)' : 'translateX(-100%)' }}
      >
        <div className="d-flex justify-content-end px-3 pb-2">
          <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={onClose}></button>
        </div>
        {renderContent(false)}
      </aside>
    </>);
};

export default Sidebar;
