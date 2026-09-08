// src/components/doctor/PatientTracking.jsx
import React, { useState } from 'react';

const PatientTracking = ({ patientId, trackingData, onUpdateStatus, onRefresh }) => {
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedStep, setSelectedStep] = useState(null);

  // Mock timeline data
  const timelineSteps = [
    { 
      id: 1, 
      status: 'REGISTERED', 
      label: 'Registration',
      time: '08:00 AM',
      location: 'Reception Desk',
      completed: true,
      notes: 'Patient arrived on time'
    },
    { 
      id: 2, 
      status: 'CHECKED_IN', 
      label: 'Check-in',
      time: '08:15 AM',
      location: 'Waiting Room',
      completed: true,
      notes: 'Patient waiting for doctor'
    },
    { 
      id: 3, 
      status: 'IN_CONSULTATION', 
      label: 'In Consultation',
      time: '08:30 AM',
      location: "Doctor's Office",
      completed: true,
      notes: 'Currently in consultation with Dr. Michael',
      current: true
    },
    { 
      id: 4, 
      status: 'LAB_REQUEST', 
      label: '⏳ Lab Request',
      time: 'Pending',
      location: 'Laboratory',
      completed: false,
      notes: 'Blood Test (Full) - Pending'
    },
    { 
      id: 5, 
      status: 'PRESCRIPTION', 
      label: '⏳ Prescription',
      time: 'Pending',
      location: 'Pharmacy',
      completed: false,
      notes: 'Prescription pending'
    },
    { 
      id: 6, 
      status: 'PAYMENT', 
      label: '⏳ Payment',
      time: 'Pending',
      location: 'Cashier',
      completed: false,
      notes: 'Payment pending'
    },
  ];

  const statusStats = {
    total: 24,
    checkedIn: 12,
    inConsultation: 6,
    waiting: 4,
    completed: 10,
  };

  const handleStepClick = (step) => {
    setSelectedStep(step);
    setShowDetailModal(true);
  };

  const handleUpdateStatus = async (status) => {
    await onUpdateStatus(status);
    onRefresh();
  };

  return (
    <div className="d-grid gap-4">
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
        <h2 className="h4 fw-bold mb-0">Patient Tracking</h2>
        <div>
          <button className="btn btn-outline-success fw-semibold" onClick={onRefresh}>Refresh</button>
        </div>
      </div>

      <div className="d-flex flex-column flex-sm-row gap-2">
        <div className="input-group">
          <span className="input-group-text">Search</span>
          <input
            type="text"
            placeholder="Track patient by name or ID..."
            className="form-control"
          />
        </div>
        <button className="btn btn-success fw-semibold">Track</button>
      </div>

      <div className="row g-4">
        <div className="col-12 col-xl-8">
        <div className="card border-0 shadow-sm">
          <div className="card-body">
          <h3 className="h5 fw-bold mb-1">Patient Journey: John Doe</h3>
          <p className="text-secondary small mb-4">Patient ID: P001</p>
          
          <div className="list-group">
            {timelineSteps.map((step, index) => (
              <button
                  type="button"
                  key={step.id}
                  className={`list-group-item list-group-item-action ${step.current ? 'active' : ''}`}
                  onClick={() => handleStepClick(step)}
                >
                  <div className="d-flex justify-content-between gap-3">
                    <span className="fw-semibold">{step.label}</span>
                    <span className={step.current ? 'text-white-50 small' : 'text-secondary small'}>{step.time}</span>
                  </div>
                  <p className={`mb-0 small ${step.current ? 'text-white-50' : 'text-secondary'}`}>{step.location}</p>
                  {step.current && (
                    <span className="badge text-bg-light text-primary mt-2">Current</span>)}
                </button>))}
          </div>
        </div>
        </div>
        </div>

        <div className="col-12 col-xl-4">
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body">
            <h4 className="h5 fw-bold mb-3">Today's Flow</h4>
            <div className="list-group list-group-flush">
              <div className="list-group-item px-0 d-flex justify-content-between">
                <span>Registered</span>
                <span className="fw-bold">{statusStats.total}</span>
              </div>
              <div className="list-group-item px-0 d-flex justify-content-between">
                <span>Checked-in</span>
                <span className="fw-bold">{statusStats.checkedIn}</span>
              </div>
              <div className="list-group-item px-0 d-flex justify-content-between">
                <span>In Consultation</span>
                <span className="fw-bold">{statusStats.inConsultation}</span>
              </div>
              <div className="list-group-item px-0 d-flex justify-content-between">
                <span>Completed</span>
                <span className="fw-bold">{statusStats.completed}</span>
              </div>
            </div>
            </div>
          </div>

          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body">
            <h4 className="h5 fw-bold mb-3">Current Status</h4>
            <div className="list-group list-group-flush">
              <div className="list-group-item px-0 d-flex justify-content-between">
                <span><span className="badge rounded-pill text-bg-info me-2">&nbsp;</span>Checked-in</span>
                <span className="fw-bold">{statusStats.checkedIn}</span>
              </div>
              <div className="list-group-item px-0 d-flex justify-content-between">
                <span><span className="badge rounded-pill text-bg-primary me-2">&nbsp;</span>In Consultation</span>
                <span className="fw-bold">{statusStats.inConsultation}</span>
              </div>
              <div className="list-group-item px-0 d-flex justify-content-between">
                <span><span className="badge rounded-pill text-bg-warning me-2">&nbsp;</span>Waiting</span>
                <span className="fw-bold">{statusStats.waiting}</span>
              </div>
              <div className="list-group-item px-0 d-flex justify-content-between">
                <span><span className="badge rounded-pill text-bg-success me-2">&nbsp;</span>Completed</span>
                <span className="fw-bold">{statusStats.completed}</span>
              </div>
            </div>
            </div>
          </div>

          <div className="card border-0 shadow-sm">
            <div className="card-body d-grid gap-2">
            <h4 className="h5 fw-bold mb-2">Quick Actions</h4>
            <button 
              className="btn btn-success fw-semibold"
              onClick={() => handleUpdateStatus('IN_CONSULTATION')}
            >Start Consultation
            </button>
            <button 
              className="btn btn-outline-success fw-semibold"
              onClick={() => handleUpdateStatus('LAB_REQUEST')}
            >
              Request Lab Test
            </button>
            <button 
              className="btn btn-outline-success fw-semibold"
              onClick={() => handleUpdateStatus('PRESCRIPTION')}
            >
              Create Prescription
            </button>
            <button 
              className="btn btn-primary fw-semibold"
              onClick={() => handleUpdateStatus('COMPLETED')}
            >
              Complete Visit
            </button>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedStep && (
        <>
        <div className="modal fade show d-block" tabIndex="-1" role="dialog">
          <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow">
            <div className="modal-header">
              <h3 className="modal-title h5 fw-bold">{selectedStep.label}</h3>
              <button type="button" className="btn-close" onClick={() => setShowDetailModal(false)} aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <div className="bg-light rounded p-3 mb-3">
                <p><strong>Patient:</strong> John Doe</p>
                <p><strong>Patient ID:</strong> P001</p>
                <p><strong>Time:</strong> {selectedStep.time}</p>
                <p><strong>Location:</strong> {selectedStep.location}</p>
                <p><strong>Status:</strong> {selectedStep.completed ? 'Completed' : 'Pending'}</p>
              </div>
              <div>
                <h4 className="h6 fw-bold">Notes</h4>
                <p>{selectedStep.notes}</p>
              </div>
              {selectedStep.current && (
                <div>
                  <button className="btn btn-success">Update Status</button>
                </div>)}
            </div>
            <div className="modal-footer">
              <button className="btn btn-light" onClick={() => setShowDetailModal(false)}>Close</button>
            </div>
          </div>
          </div>
        </div>
        <div className="modal-backdrop fade show"></div>
        </>)}
    </div>);
};

export default PatientTracking;
