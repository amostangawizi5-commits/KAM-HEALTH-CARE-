// src/components/doctor/Dashboard.jsx
import React from 'react';

const Dashboard = ({ stats, schedule, notifications, onRefresh }) => {
  const statCards = [
    { 
      icon: '', 
      label: "Today's Patients", 
      value: stats?.todayPatients || 0,
      change: stats?.patientChange || '+0%',
      changeType: stats?.patientChangeType || 'up',
      color: '#4fc3f7'
    },
    { 
      icon: '⏳', 
      label: 'Pending Consultations', 
      value: stats?.pendingConsultations || 0,
      change: stats?.pendingChange || '+0',
      changeType: stats?.pendingChangeType || 'up',
      color: '#ff9800'
    },
    { 
      icon: '', 
      label: 'Lab Requests', 
      value: stats?.pendingLabRequests || 0,
      change: stats?.labChange || '-0',
      changeType: stats?.labChangeType || 'down',
      color: '#9c27b0'
    },
    { 
      icon: '', 
      label: "Today's Appointments", 
      value: stats?.todayAppointments || 0,
      change: stats?.appointmentChange || '+0',
      changeType: stats?.appointmentChangeType || 'up',
      color: '#4caf50'
    },
  ];

  const getStatusBadge = (status) => {
    const statusMap = {
      'COMPLETED': { class: 'text-bg-success', label: 'Completed' },
      'IN_PROGRESS': { class: 'text-bg-primary', label: 'In Progress' },
      'WAITING': { class: 'text-bg-warning', label: 'Waiting' },
      'SCHEDULED': { class: 'text-bg-info', label: 'Scheduled' },
    };
    return statusMap[status] || statusMap['WAITING'];
  };

  return (
    <div className="d-grid gap-4">
      <div className="row g-3">
        {statCards.map((stat, index) => (
          <div key={index} className="col-12 col-md-6 col-xl-3">
          <div className="card h-100 shadow-sm border-0 border-start border-4" style={{ borderLeftColor: stat.color }}>
            <div className="card-body d-flex align-items-center gap-3">
              <span className="badge rounded-circle p-3" style={{ background: `${stat.color}15`, color: stat.color }}>{stat.icon}</span>
              <div className="flex-grow-1">
                <p className="text-secondary small fw-semibold mb-1">{stat.label}</p>
                <div className="d-flex align-items-end justify-content-between gap-2">
                  <h3 className="h2 fw-bold mb-0">{stat.value}</h3>
                  <span className={`badge ${stat.changeType === 'up' ? 'text-bg-success' : 'text-bg-danger'}`}>
                    {stat.changeType === 'up' ? '↑' : '↓'} {stat.change}
                  </span>
                </div>
              </div>
            </div>
          </div>
          </div>))}
      </div>

      <div className="row g-4">
        <div className="col-12 col-xl-8">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-3">
            <h3 className="h5 fw-bold mb-0">Today's Schedule</h3>
            <button onClick={onRefresh} className="btn btn-outline-success btn-sm fw-semibold">Refresh</button>
          </div>
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Time</th>
                  <th>Patient</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {schedule && schedule.length > 0 ? (
                  schedule.map((item) => {
                      const status = getStatusBadge(item.status);
                    return (
                      <tr key={item.id}>
                        <td className="fw-semibold">{item.time}</td>
                        <td className="fw-medium">{item.patientName}</td>
                        <td>{item.type}</td>
                        <td><span className={`badge rounded-pill ${status.class}`}>{status.label}</span></td>
                        <td>
                          {item.status === 'WAITING' && (
                            <button className="btn btn-sm btn-success">Start</button>)}
                          {item.status === 'IN_PROGRESS' && (
                            <button className="btn btn-sm btn-primary">Continue</button>)}
                          {item.status === 'COMPLETED' && (
                            <button className="btn btn-sm btn-outline-secondary">View</button>)}
                        </td>
                      </tr>);
                  })) : (
                  <tr>
                    <td colSpan="5" className="text-center text-secondary py-4">No appointments today</td>
                  </tr>)}
              </tbody>
            </table>
          </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-xl-4">
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body">
            <h3 className="h5 fw-bold mb-3">Recent Notifications</h3>
            <div className="list-group list-group-flush">
              {notifications && notifications.length > 0 ? (
                notifications.slice(0, 3).map((notif) => (
                  <div key={notif.id} className="list-group-item px-0 d-flex gap-2">
                    <span>{notif.icon || ''}</span>
                    <div>
                      <p className="fw-semibold mb-1">{notif.message}</p>
                      <span className="small text-secondary">{notif.time}</span>
                    </div>
                  </div>))) : (
                <p className="text-secondary mb-0">No notifications</p>)}
            </div>
            </div>
          </div>

          <div className="card border-0 shadow-sm">
            <div className="card-body">
            <h3 className="h5 fw-bold mb-3">Patient Statistics</h3>
            <div className="d-grid gap-3">
              <div>
                <div className="d-flex justify-content-between small fw-semibold mb-1">
                  <span>Completed</span>
                  <span>{stats?.completedPercentage || 80}%</span>
                </div>
                <div className="progress">
                  <div className="progress-bar bg-success" style={{ width: `${stats?.completedPercentage || 80}%` }}></div>
                </div>
              </div>
              <div>
                <div className="d-flex justify-content-between small fw-semibold mb-1">
                  <span>In Progress</span>
                  <span>{stats?.inProgressPercentage || 65}%</span>
                </div>
                <div className="progress">
                  <div className="progress-bar bg-primary" style={{ width: `${stats?.inProgressPercentage || 65}%` }}></div>
                </div>
              </div>
              <div>
                <div className="d-flex justify-content-between small fw-semibold mb-1">
                  <span>Waiting</span>
                  <span>{stats?.waitingPercentage || 45}%</span>
                </div>
                <div className="progress">
                  <div className="progress-bar bg-warning" style={{ width: `${stats?.waitingPercentage || 45}%` }}></div>
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
