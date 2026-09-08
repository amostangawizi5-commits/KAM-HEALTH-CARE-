// src/components/consultant/PatientRequests.jsx
import React, { useState } from 'react';

const softShadow = '0 2px 12px rgba(0, 0, 0, 0.06)';
const textDark = '#1a2332';

const badgeStyles = {
  status: {
    PENDING: { background: '#fef3c7', color: '#d97706', label: 'Pending' },
    IN_PROGRESS: { background: '#dbeafe', color: '#2563eb', label: 'In Progress' },
    COMPLETED: { background: '#dcfce7', color: '#22c55e', label: 'Completed' },
  },
  priority: {
    HIGH: { background: '#fee2e2', color: '#ef4444', label: 'High' },
    MEDIUM: { background: '#fef3c7', color: '#d97706', label: 'Med' },
    LOW: { background: '#dcfce7', color: '#22c55e', label: 'Low' },
  },
};

const filterButtons = [
  { value: 'ALL', label: 'All', variant: 'info' },
  { value: 'PENDING', label: 'Pending', variant: 'warning' },
  { value: 'IN_PROGRESS', label: 'In Progress', variant: 'info' },
  { value: 'COMPLETED', label: 'Completed', variant: 'success' },
];

const PatientRequests = ({
  requests,
  pagination,
  onPageChange,
  onFilter,
  onAccept,
  onReject,
  onRefresh,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [scheduleData, setScheduleData] = useState({
    date: '',
    time: '',
    notes: '',
  });

  const statusCounts = {
    ALL: requests?.length || 0,
    PENDING: requests?.filter((r) => r.status === 'PENDING').length || 0,
    IN_PROGRESS: requests?.filter((r) => r.status === 'IN_PROGRESS').length || 0,
    COMPLETED: requests?.filter((r) => r.status === 'COMPLETED').length || 0,
  };

  const getStatusBadge = (status) => badgeStyles.status[status] || badgeStyles.status.PENDING;
  const getPriorityBadge = (priority) => badgeStyles.priority[priority] || badgeStyles.priority.LOW;

  const handleFilter = (status) => {
    setStatusFilter(status);
    onFilter(1, status);
  };

  const handleAccept = (request) => {
    setSelectedRequest(request);
    setScheduleData({
      date: new Date().toISOString().split('T')[0],
      time: '10:30',
      notes: '',
    });
    setShowAcceptModal(true);
  };

  const handleReject = (request) => {
    setSelectedRequest(request);
    setShowRejectModal(true);
  };

  const handleConfirmAccept = async () => {
    await onAccept(selectedRequest.id, scheduleData);
    setShowAcceptModal(false);
    setSelectedRequest(null);
  };

  const handleConfirmReject = async () => {
    await onReject(selectedRequest.id);
    setShowAcceptModal(false);
    setShowRejectModal(false);
    setSelectedRequest(null);
  };

  const totalPages = Math.ceil((pagination?.total || 0) / (pagination?.limit || 10));

  return (
    <div className="bg-white rounded-4 p-3 p-md-4 shadow-sm" style={{ boxShadow: softShadow }}>
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <h2 className="h4 fw-bold mb-0" style={{ color: textDark }}>Patient Requests</h2>
        <button className="btn btn-light fw-medium" onClick={onRefresh}>Refresh</button>
      </div>

      <div className="d-flex flex-wrap gap-2 mb-3">
        {filterButtons.map((button) => (
          <button
            key={button.value}
            type="button"
            className={`btn btn-sm rounded-pill px-3 fw-medium ${
              statusFilter === button.value ? `btn-${button.variant}` : 'btn-outline-secondary'
            }`}
            onClick={() => handleFilter(button.value)}
          >
            {button.label} ({statusCounts[button.value]})
          </button>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onFilter(1, statusFilter, searchQuery);
        }}
        className="d-flex flex-column flex-sm-row gap-3 mb-4"
      >
        <input
          type="text"
          placeholder="Search requests..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="form-control"
        />
        <button type="submit" className="btn btn-info text-white fw-semibold px-4">Search</button>
      </form>

      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0">
          <thead className="table-light">
            <tr>
              <th className="text-uppercase small text-secondary">Request ID</th>
              <th className="text-uppercase small text-secondary">Patient</th>
              <th className="text-uppercase small text-secondary">Type</th>
              <th className="text-uppercase small text-secondary">Priority</th>
              <th className="text-uppercase small text-secondary">Status</th>
              <th className="text-uppercase small text-secondary">Action</th>
            </tr>
          </thead>
          <tbody>
            {requests && requests.length > 0 ? (
              requests.map((request) => {
                const status = getStatusBadge(request.status);
                const priority = getPriorityBadge(request.priority);

                return (
                  <tr key={request.id}>
                    <td className="fw-semibold" style={{ color: textDark }}>{request.requestId || request.id}</td>
                    <td className="fw-medium" style={{ color: textDark }}>{request.patientName}</td>
                    <td>{request.type}</td>
                    <td><span className="badge rounded-pill px-3 py-2" style={priority}>{priority.label}</span></td>
                    <td><span className="badge rounded-pill px-3 py-2" style={status}>{status.label}</span></td>
                    <td>
                      <div className="d-flex flex-wrap gap-2">
                        {request.status === 'PENDING' && (
                          <>
                            <button type="button" className="btn btn-success btn-sm px-3" onClick={() => handleAccept(request)}>Accept</button>
                            <button type="button" className="btn btn-danger btn-sm px-3" onClick={() => handleReject(request)}>Reject</button>
                          </>)}
                        {request.status === 'IN_PROGRESS' && (
                          <>
                            <button type="button" className="btn btn-outline-secondary btn-sm px-3">View</button>
                            <button type="button" className="btn btn-primary btn-sm px-3">Complete</button>
                          </>)}
                        {request.status === 'COMPLETED' && (
                          <button type="button" className="btn btn-outline-secondary btn-sm px-3">View</button>)}
                      </div>
                    </td>
                  </tr>);
              })) : (
              <tr>
                <td colSpan="6" className="text-center text-secondary py-4">No requests found</td>
              </tr>)}
          </tbody>
        </table>
      </div>

      {pagination?.total > 0 && (
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mt-4">
          <span className="small text-secondary">
            Showing {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
          </span>
          <nav aria-label="Request pagination">
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

      {showAcceptModal && selectedRequest && (
        <>
          <div className="modal fade show d-block" tabIndex="-1" role="dialog">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content rounded-4 border-0 shadow">
                <div className="modal-header">
                  <h3 className="modal-title h5 fw-bold">Accept Patient Request</h3>
                  <button type="button" className="btn-close" onClick={() => setShowAcceptModal(false)} aria-label="Close"></button>
                </div>
                <div className="modal-body">
                  <div className="bg-light rounded-3 p-3 mb-3">
                    <p className="mb-1"><strong>Patient:</strong> {selectedRequest.patientName}</p>
                    <p className="mb-1"><strong>Patient ID:</strong> {selectedRequest.patientId}</p>
                    <p className="mb-1"><strong>Request Type:</strong> {selectedRequest.type}</p>
                    <p className="mb-1"><strong>Priority:</strong> {selectedRequest.priority}</p>
                    <p className="mb-0"><strong>Request Date:</strong> {selectedRequest.date}</p>
                  </div>

                  <div className="bg-light rounded-3 p-3 mb-3">
                    <h4 className="h6 fw-semibold">Patient Notes</h4>
                    <p className="small text-secondary mb-0">{selectedRequest.notes || 'Patient complains of persistent headache and dizziness for the past week. No previous history of migraines.'}</p>
                  </div>

                  <label className="form-label fw-semibold">Schedule Consultation</label>
                  <div className="row g-3">
                    <div className="col-12 col-sm-6">
                      <input
                        type="date"
                        value={scheduleData.date}
                        onChange={(e) => setScheduleData({ ...scheduleData, date: e.target.value })}
                        className="form-control"
                      />
                    </div>
                    <div className="col-12 col-sm-6">
                      <input
                        type="time"
                        value={scheduleData.time}
                        onChange={(e) => setScheduleData({ ...scheduleData, time: e.target.value })}
                        className="form-control"
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-danger" onClick={handleConfirmReject}>Reject</button>
                  <button type="button" className="btn btn-success" onClick={handleConfirmAccept}>Accept & Schedule</button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>)}

      {showRejectModal && selectedRequest && (
        <>
          <div className="modal fade show d-block" tabIndex="-1" role="dialog">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content rounded-4 border-0 shadow">
                <div className="modal-header">
                  <h3 className="modal-title h5 fw-bold">Reject Request</h3>
                  <button type="button" className="btn-close" onClick={() => setShowRejectModal(false)} aria-label="Close"></button>
                </div>
                <div className="modal-body">
                  <p><strong>Patient:</strong> {selectedRequest.patientName}</p>
                  <p><strong>Request Type:</strong> {selectedRequest.type}</p>
                  <div className="text-center bg-light rounded-3 p-3">
                    <p className="mb-1 fw-semibold" style={{ color: textDark }}>Are you sure you want to reject this request?</p>
                    <p className="small text-secondary mb-0">This action cannot be undone.</p>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-light" onClick={() => setShowRejectModal(false)}>Cancel</button>
                  <button type="button" className="btn btn-danger" onClick={handleConfirmReject}>Confirm Reject</button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>)}
    </div>);
};

export default PatientRequests;
