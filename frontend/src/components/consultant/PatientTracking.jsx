// src/components/consultant/PatientTracking.jsx
import React, { useState } from 'react';

const softShadow = '0 2px 12px rgba(0, 0, 0, 0.06)';
const textDark = '#1a2332';

const statusStyles = {
  WAITING: { background: '#fef3c7', color: '#d97706', label: 'Waiting' },
  IN_CONSULTATION: { background: '#dbeafe', color: '#2563eb', label: 'In Consultation' },
  LAB_REQUESTED: { background: '#ede9fe', color: '#7c3aed', label: 'Lab Requested' },
  PHARMACY: { background: '#e0f2fe', color: '#0284c7', label: 'Pharmacy' },
  COMPLETED: { background: '#dcfce7', color: '#22c55e', label: 'Completed' },
};

const statusOptions = [
  'WAITING',
  'IN_CONSULTATION',
  'LAB_REQUESTED',
  'PHARMACY',
  'COMPLETED',
];

const PatientTracking = ({ patientId, trackingData, onUpdateStatus, onRefresh }) => {
  const [nextStatus, setNextStatus] = useState('IN_CONSULTATION');

  const patient = trackingData?.patient || trackingData || {};
  const currentStatus = patient.status || trackingData?.status || 'WAITING';
  const status = statusStyles[currentStatus] || statusStyles.WAITING;
  const events = trackingData?.timeline || trackingData?.events || [];

  const handleUpdate = async () => {
    await onUpdateStatus(nextStatus);
  };

  return (
    <div className="bg-white rounded-4 p-3 p-md-4 shadow-sm" style={{ boxShadow: softShadow }}>
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <div>
          <h2 className="h4 fw-bold mb-1" style={{ color: textDark }}>Patient Tracking</h2>
          <p className="small text-secondary mb-0">Patient ID: {patient.patientId || patientId || 'N/A'}</p>
        </div>
        <button className="btn btn-light fw-medium" onClick={onRefresh}>Refresh</button>
      </div>

      <div className="row g-4">
        <div className="col-12 col-xl-4">
          <div className="bg-light rounded-4 p-3 h-100">
            <h3 className="h6 fw-semibold mb-3" style={{ color: textDark }}>Patient Summary</h3>
            <div className="d-flex flex-column gap-3">
              <div>
                <span className="small text-secondary">Name</span>
                <p className="fw-semibold mb-0" style={{ color: textDark }}>{patient.name || patient.patientName || 'Not available'}</p>
              </div>
              <div>
                <span className="small text-secondary">Current Status</span>
                <p className="mb-0">
                  <span className="badge rounded-pill px-3 py-2" style={status}>{status.label}</span>
                </p>
              </div>
              <div>
                <span className="small text-secondary">Last Updated</span>
                <p className="mb-0">{patient.updatedAt || trackingData?.updatedAt || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-xl-8">
          <div className="border rounded-4 p-3 mb-4">
            <h3 className="h6 fw-semibold mb-3" style={{ color: textDark }}>Update Patient Status</h3>
            <div className="row g-3 align-items-end">
              <div className="col-12 col-md-8">
                <label className="form-label small text-secondary fw-semibold">Status</label>
                <select className="form-select" value={nextStatus} onChange={(e) => setNextStatus(e.target.value)}>
                  {statusOptions.map((option) => (
                    <option key={option} value={option}>{statusStyles[option].label}</option>
                  ))}
                </select>
              </div>
              <div className="col-12 col-md-4">
                <button className="btn btn-info text-white fw-semibold w-100" onClick={handleUpdate}>Update Status</button>
              </div>
            </div>
          </div>

          <div>
            <h3 className="h6 fw-semibold mb-3" style={{ color: textDark }}>Tracking Timeline</h3>
            {events.length > 0 ? (
              <div className="list-group">
                {events.map((event, index) => (
                  <div className="list-group-item border-0 border-bottom px-0" key={event.id || index}>
                    <div className="d-flex justify-content-between gap-3 flex-wrap">
                      <h4 className="h6 fw-semibold mb-1" style={{ color: textDark }}>{event.title || event.status || 'Status update'}</h4>
                      <span className="small text-secondary">{event.time || event.createdAt}</span>
                    </div>
                    <p className="small text-secondary mb-0">{event.description || event.notes || 'No details recorded.'}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-secondary bg-light rounded-4 py-5">
                <p className="mb-0">No tracking history available</p>
              </div>)}
          </div>
        </div>
      </div>
    </div>);
};

export default PatientTracking;
