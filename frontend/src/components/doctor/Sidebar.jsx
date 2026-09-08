// src/components/doctor/Sidebar.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import AccountMenu from '../common/AccountMenu';

const Sidebar = ({ activePage, setActivePage, user }) => {
  const navigate = useNavigate();

  const menuItems = [
    { 
      id: 'dashboard', 
      icon: '', 
      label: 'Dashboard',
      badge: null
    },
    { 
      id: 'patients', 
      icon: '', 
      label: 'My Patients',
      badge: null
    },
    { 
      id: 'consultations', 
      icon: '', 
      label: 'Consultations',
      badge: '8'
    },
    { 
      id: 'lab-requests', 
      icon: '', 
      label: 'Laboratory Requests',
      badge: '5'
    },
    { 
      id: 'prescriptions', 
      icon: '', 
      label: 'Prescriptions',
      badge: null
    },
    { 
      id: 'tracking', 
      icon: '', 
      label: 'Patient Tracking',
      badge: null
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <aside className="bg-success text-white p-3 d-flex flex-column flex-shrink-0" style={{ width: 280 }}>
      <div className="d-flex align-items-center gap-2 mb-3">
        <span className="badge rounded-circle text-bg-light text-success p-3">KC</span>
        <div>
          <h2 className="h4 fw-bold mb-0">Kazimi<span className="text-warning">Care</span></h2>
          <p className="small text-white-50 mb-0">Doctor Panel</p>
        </div>
      </div>

      <div className="d-flex align-items-center gap-2 rounded bg-white bg-opacity-10 p-2 mb-3">
        <span className="badge rounded-circle text-bg-light text-success p-3">User</span>
        <div>
          <p className="fw-semibold mb-0">{user?.name || 'Dr. Michael'}</p>
          <p className="small text-white-50 mb-0">{user?.specialty || 'Cardiologist'}</p>
        </div>
      </div>

      <nav className="nav nav-pills flex-column gap-2 flex-grow-1">
        {menuItems.map((item) => (
          <button
            type="button"
            key={item.id}
            className={`btn w-100 d-flex align-items-center justify-content-between text-start fw-semibold ${
              activePage === item.id ? 'btn-light text-success' : 'btn-success text-white'
            }`}
            onClick={() => setActivePage(item.id)}
          >
            <span>{item.label}</span>
            {item.badge && (
              <span className="badge text-bg-warning">{item.badge}</span>)}
          </button>))}
      </nav>

      <div className="d-grid gap-2 pt-3 border-top border-light border-opacity-25">
        <button type="button" className="btn btn-success text-start fw-semibold">Settings</button>
        <AccountMenu onLogout={handleLogout} />
      </div>
    </aside>);
};

export default Sidebar;
