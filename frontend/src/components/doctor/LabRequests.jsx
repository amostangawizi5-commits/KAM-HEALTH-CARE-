// src/components/doctor/LabRequests.jsx
import React, { useState } from 'react';

const LabRequests = ({ 
  labRequests, 
  pagination, 
  onPageChange, 
  onFilter,
  onCreateRequest,
  onRefresh 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [formData, setFormData] = useState({
    patientId: '',
    testType: '',
    priority: 'NORMAL',
    clinicalNotes: ''
  });

  const statusCounts = {
    PENDING: labRequests?.filter(r => r.status === 'PENDING').length || 0,
    PROCESSING: labRequests?.filter(r => r.status === 'PROCESSING').length || 0,
    COMPLETED: labRequests?.filter(r => r.status === 'COMPLETED').length || 0,
    READY: labRequests?.filter(r => r.status === 'READY').length || 0,
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'PENDING': { class: 'text-bg-warning', label: 'Pending' },
      'PROCESSING': { class: 'text-bg-primary', label: 'Processing' },
      'COMPLETED': { class: 'text-bg-success', label: 'Completed' },
      'READY': { class: 'text-bg-info', label: 'Ready' },
    };
    return statusMap[status] || statusMap['PENDING'];
  };

  const handleFilterChange = (status) => {
    setStatusFilter(status);
    onFilter(1, status);
  };

  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    await onCreateRequest(formData);
    setShowCreateModal(false);
    setFormData({
      patientId: '',
      testType: '',
      priority: 'NORMAL',
      clinicalNotes: ''
    });
  };

  const handleViewResults = (request) => {
    setSelectedRequest(request);
    setShowResultModal(true);
  };

  return (
    <div className="card border-0 shadow-sm">
      <div className="card-body">
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-3">
        <h2 className="h4 fw-bold mb-0">Laboratory Requests</h2>
        <div className="d-flex flex-wrap gap-2">
          <button className="btn btn-success fw-semibold" onClick={() => setShowCreateModal(true)}>
            + New Request
          </button>
          <button className="btn btn-outline-success fw-semibold" onClick={onRefresh}>Refresh</button>
        </div>
      </div>

      <div className="d-flex flex-wrap gap-2 mb-3">
        <button 
          className={`btn btn-sm rounded-pill ${statusFilter === 'ALL' ? 'btn-success' : 'btn-outline-success'}`}
          onClick={() => handleFilterChange('ALL')}
        >
          All ({labRequests?.length || 0})
        </button>
        <button 
          className={`btn btn-sm rounded-pill ${statusFilter === 'PENDING' ? 'btn-warning' : 'btn-outline-warning'}`}
          onClick={() => handleFilterChange('PENDING')}
        >Pending ({statusCounts.PENDING})
        </button>
        <button 
          className={`btn btn-sm rounded-pill ${statusFilter === 'PROCESSING' ? 'btn-primary' : 'btn-outline-primary'}`}
          onClick={() => handleFilterChange('PROCESSING')}
        >Processing ({statusCounts.PROCESSING})
        </button>
        <button 
          className={`btn btn-sm rounded-pill ${statusFilter === 'COMPLETED' ? 'btn-success' : 'btn-outline-success'}`}
          onClick={() => handleFilterChange('COMPLETED')}
        >Completed ({statusCounts.COMPLETED})
        </button>
        <button 
          className={`btn btn-sm rounded-pill ${statusFilter === 'READY' ? 'btn-info' : 'btn-outline-info'}`}
          onClick={() => handleFilterChange('READY')}
        >
          Ready ({statusCounts.READY})
        </button>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); onFilter(1, statusFilter, searchQuery); }} className="d-flex flex-column flex-sm-row gap-2 mb-3">
        <div className="input-group">
          <span className="input-group-text">Search</span>
          <input
            type="text"
            placeholder="Search lab request..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-control"
          />
        </div>
        <button type="submit" className="btn btn-success fw-semibold">Search</button>
      </form>

      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0">
          <thead className="table-light">
            <tr>
              <th>Request ID</th>
              <th>Patient</th>
              <th>Test Type</th>
              <th>Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {labRequests && labRequests.length > 0 ? (
              labRequests.map((r) => {
                const status = getStatusBadge(r.status);
                return (
                  <tr key={r.id}>
                    <td className="fw-semibold">{r.requestId || r.id}</td>
                    <td className="fw-medium">{r.patientName}</td>
                    <td>{r.testType}</td>
                    <td>{r.date}</td>
                    <td><span className={`badge rounded-pill ${status.class}`}>{status.label}</span></td>
                    <td>
                      <div className="d-flex flex-wrap gap-2">
                      <button className="btn btn-sm btn-outline-secondary">View</button>
                      {r.status === 'COMPLETED' && (
                        <button className="btn btn-sm btn-primary" onClick={() => handleViewResults(r)}>
                          Results
                        </button>)}
                      {r.status === 'PENDING' && (
                        <button className="btn btn-sm btn-outline-success">Edit</button>)}
                      </div>
                    </td>
                  </tr>);
              })) : (
              <tr>
                <td colSpan="6" className="text-center text-secondary py-4">
                  No lab requests found
                </td>
              </tr>)}
          </tbody>
        </table>
      </div>

      {pagination?.total > 0 && (
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mt-3">
          <span className="small text-secondary">
            Showing {((pagination.page - 1) * pagination.limit) + 1} -{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
          </span>
          <ul className="pagination pagination-sm mb-0">
            <li className={`page-item ${pagination.page === 1 ? 'disabled' : ''}`}>
            <button
              className="page-link"
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
            >
              &lt;
            </button>
            </li>
            {[...Array(Math.ceil(pagination.total / pagination.limit))].map((_, i) => (
              <li key={i} className={`page-item ${pagination.page === i + 1 ? 'active' : ''}`}>
              <button
                className="page-link"
                onClick={() => onPageChange(i + 1)}
              >
                {i + 1}
              </button>
              </li>))}
            <li className={`page-item ${pagination.page === Math.ceil(pagination.total / pagination.limit) ? 'disabled' : ''}`}>
            <button
              className="page-link"
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page === Math.ceil(pagination.total / pagination.limit)}
            >
              &gt;
            </button>
            </li>
          </ul>
        </div>)}

      {/* Create Lab Request Modal */}
      {showCreateModal && (
        <>
        <div className="modal fade show d-block" tabIndex="-1" role="dialog">
          <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content border-0 shadow">
            <div className="modal-header">
              <h3 className="modal-title h5 fw-bold">New Laboratory Request</h3>
              <button type="button" className="btn-close" onClick={() => setShowCreateModal(false)} aria-label="Close"></button>
            </div>
            <form onSubmit={handleSubmitRequest}>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label fw-semibold">Patient</label>
                  <select
                    name="patientId"
                    value={formData.patientId}
                    onChange={handleFormChange}
                    className="form-select"
                    required
                  >
                    <option value="">Select Patient ▼</option>
                    <option value="P001">John Doe</option>
                    <option value="P002">Asha Ali</option>
                    <option value="P003">Mary John</option>
                    <option value="P004">Hassan Ali</option>
                    <option value="P005">Sarah Kim</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Test Type</label>
                  <select
                    name="testType"
                    value={formData.testType}
                    onChange={handleFormChange}
                    className="form-select"
                    required
                  >
                    <option value="">Select Test Type ▼</option>
                    <option value="Blood Test (Full)">Blood Test (Full)</option>
                    <option value="Blood Test (CBC)">Blood Test (CBC)</option>
                    <option value="X-Ray Chest">X-Ray Chest</option>
                    <option value="X-Ray Abdomen">X-Ray Abdomen</option>
                    <option value="Urine Test">Urine Test</option>
                    <option value="MRI Brain">MRI Brain</option>
                    <option value="Blood Sugar (Fasting)">Blood Sugar (Fasting)</option>
                    <option value="Blood Sugar (Random)">Blood Sugar (Random)</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Priority</label>
                  <div className="btn-group w-100" role="group">
                    <button
                      type="button"
                      className={`btn ${formData.priority === 'URGENT' ? 'btn-danger' : 'btn-outline-danger'}`}
                      onClick={() => setFormData({ ...formData, priority: 'URGENT' })}
                    >Urgent
                    </button>
                    <button
                      type="button"
                      className={`btn ${formData.priority === 'NORMAL' ? 'btn-success' : 'btn-outline-success'}`}
                      onClick={() => setFormData({ ...formData, priority: 'NORMAL' })}
                    >Normal
                    </button>
                    <button
                      type="button"
                      className={`btn ${formData.priority === 'ROUTINE' ? 'btn-secondary' : 'btn-outline-secondary'}`}
                      onClick={() => setFormData({ ...formData, priority: 'ROUTINE' })}
                    >Routine
                    </button>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Clinical Notes</label>
                  <textarea
                    name="clinicalNotes"
                    placeholder="Clinical notes for the lab..."
                    value={formData.clinicalNotes}
                    onChange={handleFormChange}
                    className="form-control"
                    rows="3"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-light" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-success">
                  Submit Request
                </button>
              </div>
            </form>
          </div>
          </div>
        </div>
        <div className="modal-backdrop fade show"></div>
        </>)}

      {/* View Results Modal */}
      {showResultModal && selectedRequest && (
        <>
        <div className="modal fade show d-block" tabIndex="-1" role="dialog">
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content border-0 shadow">
            <div className="modal-header">
              <h3 className="modal-title h5 fw-bold">Lab Results</h3>
              <button type="button" className="btn-close" onClick={() => setShowResultModal(false)} aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <div className="bg-light rounded p-3 mb-3">
                <p><strong>Patient:</strong> {selectedRequest.patientName}</p>
                <p><strong>Test Type:</strong> {selectedRequest.testType}</p>
                <p><strong>Date:</strong> {selectedRequest.date}</p>
                <p><strong>Status:</strong>Completed</p>
              </div>
              <div className="mb-3">
                <h4 className="h6 fw-bold">Test Results</h4>
                <div className="list-group">
                <div className="list-group-item d-flex justify-content-between align-items-center gap-3">
                  <span>WBC Count</span>
                  <span className="fw-semibold">7.5 x 10^3/µL</span>
                  <span className="badge text-bg-success">Normal</span>
                </div>
                <div className="list-group-item d-flex justify-content-between align-items-center gap-3">
                  <span>RBC Count</span>
                  <span className="fw-semibold">4.8 x 10^6/µL</span>
                  <span className="badge text-bg-success">Normal</span>
                </div>
                <div className="list-group-item d-flex justify-content-between align-items-center gap-3">
                  <span>Hemoglobin</span>
                  <span className="fw-semibold">14.2 g/dL</span>
                  <span className="badge text-bg-success">Normal</span>
                </div>
                <div className="list-group-item d-flex justify-content-between align-items-center gap-3">
                  <span>Platelet Count</span>
                  <span className="fw-semibold">250 x 10^3/µL</span>
                  <span className="badge text-bg-success">Normal</span>
                </div>
                <div className="list-group-item d-flex justify-content-between align-items-center gap-3">
                  <span>Blood Sugar</span>
                  <span className="fw-semibold">142 mg/dL</span>
                  <span className="badge text-bg-warning">High</span>
                </div>
                </div>
              </div>
              <div>
                <h4 className="h6 fw-bold">Lab Notes</h4>
                <p>Patient shows elevated blood sugar levels. Recommend follow-up.</p>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline-success">Download PDF</button>
              <button className="btn btn-light" onClick={() => setShowResultModal(false)}>Close</button>
            </div>
          </div>
          </div>
        </div>
        <div className="modal-backdrop fade show"></div>
        </>)}
      </div>
    </div>);
};

export default LabRequests;
