// src/components/consultant/Dashboard.jsx
import React from 'react';

const softShadow = '0 2px 12px rgba(0, 0, 0, 0.06)';
const textDark = '#1a2332';

const priorityStyles = {
  high: { background: '#fee2e2', color: '#ef4444' },
  medium: { background: '#fef3c7', color: '#d97706' },
  low: { background: '#dcfce7', color: '#22c55e' },
};

const Dashboard = ({ stats, schedule, notifications, onRefresh }) => {
  const statCards = [
    { 
      icon: '', 
      label: 'Patient Requests', 
      value: stats?.patientRequests || 12,
      change: '+3',
      changeType: 'up',
      color: '#4fc3f7'
    },
    { 
      icon: '', 
      label: "Today's Consultations", 
      value: stats?.todayConsultations || 6,
      change: '+2',
      changeType: 'up',
      color: '#ff9800'
    },
    { 
      icon: '', 
      label: 'Active Patients', 
      value: stats?.activePatients || 45,
      change: '+5%',
      changeType: 'up',
      color: '#4caf50'
    },
    { 
      icon: '⏳', 
      label: 'Pending Requests', 
      value: stats?.pendingRequests || 8,
      change: '-2',
      changeType: 'down',
      color: '#ef4444'
    },
  ];

  const getPriorityBadge = (priority) => {
    const map = {
      'HIGH': { class: 'high', label: 'High' },
      'MEDIUM': { class: 'medium', label: 'Med' },
      'LOW': { class: 'low', label: 'Low' },
    };
    return map[priority] || map['LOW'];
  };

  return (
    <div>
      <div className="row row-cols-1 row-cols-md-2 row-cols-xl-4 g-3 g-xl-4 mb-4">
        {statCards.map((stat, index) => (
          <div key={index} className="col">
            <div
              className="bg-white d-flex align-items-center gap-3 h-100 rounded-4 p-3 p-xl-4 border-start border-4 shadow-sm"
              style={{ borderLeftColor: stat.color, boxShadow: softShadow }}
            >
              <div
                className="d-flex align-items-center justify-content-center rounded-3 flex-shrink-0"
                style={{ width: 56, height: 56, background: `${stat.color}15` }}
              >
                <span className="fs-3">{stat.icon}</span>
              </div>
              <div className="flex-grow-1">
                <p className="small fw-medium text-secondary mb-1">{stat.label}</p>
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <h3 className="h3 fw-bold mb-0" style={{ color: textDark }}>{stat.value}</h3>
                  <span className={`badge rounded-pill ${stat.changeType === 'up' ? 'text-success' : 'text-danger'}`} style={{ background: stat.changeType === 'up' ? '#dcfce7' : '#fee2e2' }}>
                    {stat.changeType === 'up' ? '↑' : '↓'} {stat.change}
                  </span>
                </div>
              </div>
            </div>
          </div>))}
      </div>

      <div className="row g-4">
        <div className="col-12 col-xl-8">
          <div className="bg-white rounded-4 p-3 p-xl-4 shadow-sm h-100" style={{ boxShadow: softShadow }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h3 className="h6 fw-semibold mb-0" style={{ color: textDark }}>Patient Requests - Pending</h3>
              <button onClick={onRefresh} className="btn btn-light btn-sm fw-medium">Refresh</button>
            </div>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="text-uppercase small text-secondary">#</th>
                    <th className="text-uppercase small text-secondary">Patient</th>
                    <th className="text-uppercase small text-secondary">Request</th>
                    <th className="text-uppercase small text-secondary">Priority</th>
                    <th className="text-uppercase small text-secondary">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {schedule && schedule.length > 0 ? (
                    schedule.slice(0, 3).map((item) => {
                      const priority = getPriorityBadge(item.priority);
                      return (
                        <tr key={item.id}>
                          <td className="fw-semibold" style={{ color: textDark }}>{item.requestId || item.id}</td>
                          <td className="fw-medium" style={{ color: textDark }}>{item.patientName}</td>
                          <td>{item.type}</td>
                          <td>
                            <span className="badge rounded-pill fw-medium px-3 py-2" style={priorityStyles[priority.class]}>
                              {priority.label}
                            </span>
                          </td>
                          <td>
                            <button className="btn btn-success btn-sm px-3">Accept</button>
                          </td>
                        </tr>);
                    })) : (
                    <tr>
                      <td colSpan="5" className="text-center text-secondary py-4">No pending requests</td>
                    </tr>)}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="col-12 col-xl-4">
          <div className="d-flex flex-column gap-4">
            <div className="bg-white rounded-4 p-3 p-xl-4 shadow-sm" style={{ boxShadow: softShadow }}>
              <h3 className="h6 fw-semibold mb-3" style={{ color: textDark }}>Recent Notifications</h3>
              <div className="d-flex flex-column gap-2">
                {notifications && notifications.length > 0 ? (
                  notifications.slice(0, 3).map((notif) => (
                    <div key={notif.id} className="d-flex gap-3 py-2 border-bottom">
                      <span className="fs-5">{notif.icon || ''}</span>
                      <div>
                        <p className="small mb-1" style={{ color: textDark }}>{notif.message}</p>
                        <span className="text-secondary" style={{ fontSize: 12 }}>{notif.time}</span>
                      </div>
                    </div>))) : (
                  <p className="text-center text-secondary py-3 mb-0">No notifications</p>)}
              </div>
            </div>

            <div className="bg-white rounded-4 p-3 p-xl-4 shadow-sm" style={{ boxShadow: softShadow }}>
              <h3 className="h6 fw-semibold mb-3" style={{ color: textDark }}>Consultation Statistics</h3>
              <div className="d-flex flex-column gap-3">
                <div>
                  <div className="d-flex justify-content-between small mb-2" style={{ color: textDark }}>
                    <span>Completed</span>
                    <span>{stats?.completedPercentage || 75}%</span>
                  </div>
                  <div className="progress" style={{ height: 8 }}>
                    <div className="progress-bar bg-success" style={{ width: `${stats?.completedPercentage || 75}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="d-flex justify-content-between small mb-2" style={{ color: textDark }}>
                    <span>In Progress</span>
                    <span>{stats?.inProgressPercentage || 45}%</span>
                  </div>
                  <div className="progress" style={{ height: 8 }}>
                    <div className="progress-bar bg-warning" style={{ width: `${stats?.inProgressPercentage || 45}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="d-flex justify-content-between small mb-2" style={{ color: textDark }}>
                    <span>Pending</span>
                    <span>{stats?.pendingPercentage || 30}%</span>
                  </div>
                  <div className="progress" style={{ height: 8 }}>
                    <div className="progress-bar bg-primary" style={{ width: `${stats?.pendingPercentage || 30}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>);
};

export default Dashboard;
