import React, { useState } from 'react';

const statusClass = (status) => (
  status === 'CHECKED_IN' ? 'text-bg-success' : 'text-bg-info'
);

const AppointmentsList = ({ appointments, onCheckIn }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAppointments = appointments?.filter(a =>
    a.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.doctor?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const today = new Date().toISOString().split('T')[0];
  const todayAppointments = filteredAppointments.filter(a => a.date === today);

  return (
    <div className="card border-0 shadow-sm">
      <div className="card-body">
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-4">
        <h2 className="h4 fw-bold mb-0">Appointments</h2>
        <button className="btn btn-success fw-semibold">New Appointment</button>
      </div>

      <div>
        <h3 className="h5 fw-bold mb-3">Today's Appointments</h3>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Time</th>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {todayAppointments.length > 0 ? (
                todayAppointments.map((a) => (
                  <tr key={a.id}>
                    <td className="fw-semibold">{a.time}</td>
                    <td className="fw-medium">{a.patientName}</td>
                    <td>{a.doctor}</td>
                    <td>
                      <span className={`badge rounded-pill ${statusClass(a.status)}`}>
                        {a.status === 'CHECKED_IN' ? 'Checked-in' : a.status || 'Scheduled'}
                      </span>
                    </td>
                    <td>
                      {a.status !== 'CHECKED_IN' ? (
                        <button className="btn btn-sm btn-success" onClick={() => onCheckIn?.(a.id)}>Check-in</button>
                      ) : (
                        <button className="btn btn-sm btn-outline-secondary" disabled>View</button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center text-secondary py-4">
                    No appointments today
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4">
        <div className="input-group">
          <input
            type="text"
            placeholder="Search appointment..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-control"
          />
        </div>
      </div>
      </div>
    </div>
  );
};

export default AppointmentsList;
