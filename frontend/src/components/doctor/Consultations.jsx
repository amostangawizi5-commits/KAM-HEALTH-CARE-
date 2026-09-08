// src/components/doctor/Consultations.jsx
import React, { useState } from 'react';

const Consultations = ({ 
  consultations, 
  pagination, 
  onPageChange, 
  onFilter,
  onStartConsultation,
  onCompleteConsultation,
  onRefresh 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [showStartModal, setShowStartModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [consultationForm, setConsultationForm] = useState({
    symptoms: '',
    diagnosis: '',
    prescription: '',
    notes: ''
  });

  const statusCounts = {
    PENDING: consultations?.filter(c => c.status === 'PENDING').length || 0,
    IN_PROGRESS: consultations?.filter(c => c.status === 'IN_PROGRESS').length || 0,
    COMPLETED: consultations?.filter(c => c.status === 'COMPLETED').length || 0,
    UPCOMING: consultations?.filter(c => c.status === 'UPCOMING').length || 0,
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'PENDING': { class: 'text-bg-warning', label: 'Pending' },
      'IN_PROGRESS': { class: 'text-bg-primary', label: 'In Progress' },
      'COMPLETED': { class: 'text-bg-success', label: 'Completed' },
      'UPCOMING': { class: 'text-bg-info', label: 'Upcoming' },
    };
    return statusMap[status] || statusMap['PENDING'];
  };

  const handleFilterChange = (status) => {
    setStatusFilter(status);
    onFilter(1, status);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    onFilter(1, statusFilter, searchQuery);
  };

  const handleStartConsultation = (consultation) => {
    setSelectedConsultation(consultation);
    setShowStartModal(true);
  };

  const handleConfirmStart = async () => {
    await onStartConsultation(selectedConsultation.id);
    setShowStartModal(false);
    setSelectedConsultation(null);
  };

  const handleCompleteConsultation = (consultation) => {
    setSelectedConsultation(consultation);
    setConsultationForm({
      symptoms: consultation.symptoms || '',
      diagnosis: consultation.diagnosis || '',
      prescription: consultation.prescription || '',
      notes: consultation.notes || ''
    });
    setShowCompleteModal(true);
  };

  const handleFormChange = (e) => {
    setConsultationForm({
      ...consultationForm,
      [e.target.name]: e.target.value
    });
  };

  const handleConfirmComplete = async () => {
    await onCompleteConsultation(selectedConsultation.id, consultationForm);
    setShowCompleteModal(false);
    setSelectedConsultation(null);
    setConsultationForm({
      symptoms: '',
      diagnosis: '',
      prescription: '',
      notes: ''
    });
  };

  return (
    <div className="card border-0 shadow-sm">
      <div className="card-body">
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-3">
        <h2 className="h4 fw-bold mb-0">Consultations</h2>
        <button className="btn btn-outline-success fw-semibold" onClick={onRefresh}>Refresh</button>
      </div>

      <div className="d-flex flex-wrap gap-2 mb-3">
        <button 
          className={`btn btn-sm rounded-pill ${statusFilter === 'ALL' ? 'btn-success' : 'btn-outline-success'}`}
          onClick={() => handleFilterChange('ALL')}
        >
          All ({consultations?.length || 0})
        </button>
        <button 
          className={`btn btn-sm rounded-pill ${statusFilter === 'PENDING' ? 'btn-warning' : 'btn-outline-warning'}`}
          onClick={() => handleFilterChange('PENDING')}
        >Pending ({statusCounts.PENDING})
        </button>
        <button 
          className={`btn btn-sm rounded-pill ${statusFilter === 'IN_PROGRESS' ? 'btn-primary' : 'btn-outline-primary'}`}
          onClick={() => handleFilterChange('IN_PROGRESS')}
        >In Progress ({statusCounts.IN_PROGRESS})
        </button>
        <button 
          className={`btn btn-sm rounded-pill ${statusFilter === 'COMPLETED' ? 'btn-success' : 'btn-outline-success'}`}
          onClick={() => handleFilterChange('COMPLETED')}
        >Completed ({statusCounts.COMPLETED})
        </button>
        <button 
          className={`btn btn-sm rounded-pill ${statusFilter === 'UPCOMING' ? 'btn-info' : 'btn-outline-info'}`}
          onClick={() => handleFilterChange('UPCOMING')}
        >Upcoming ({statusCounts.UPCOMING})
        </button>
      </div>

      <form onSubmit={handleSearch} className="d-flex flex-column flex-sm-row gap-2 mb-3">
        <div className="input-group">
          <span className="input-group-text">Search</span>
          <input
            type="text"
            placeholder="Search consultation by patient name..."
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
              <th>#</th>
              <th>Patient</th>
              <th>Date</th>
              <th>Type</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {consultations && consultations.length > 0 ? (
              consultations.map((c) => {
                const status = getStatusBadge(c.status);
                return (
                  <tr key={c.id}>
                    <td className="fw-semibold">{c.consultationId || c.id}</td>
                    <td className="fw-medium">{c.patientName}</td>
                    <td>{c.date} {c.time}</td>
                    <td>{c.type}</td>
                    <td><span className={`badge rounded-pill ${status.class}`}>{status.label}</span></td>
                    <td>
                      {c.status === 'PENDING' && (
                        <button className="btn btn-sm btn-success" onClick={() => handleStartConsultation(c)}>
                          Start
                        </button>)}
                      {c.status === 'IN_PROGRESS' && (
                        <div className="d-flex flex-wrap gap-2">
                          <button className="btn btn-sm btn-primary" onClick={() => handleCompleteConsultation(c)}>
                            Complete
                          </button>
                          <button className="btn btn-sm btn-outline-secondary">View</button>
                        </div>)}
                      {(c.status === 'COMPLETED' || c.status === 'UPCOMING') && (
                        <button className="btn btn-sm btn-outline-secondary">View</button>)}
                    </td>
                  </tr>);
              })) : (
              <tr>
                <td colSpan="6" className="text-center text-secondary py-4">
                  No consultations found
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

      {/* Start Consultation Modal */}
      {showStartModal && selectedConsultation && (
        <>
        <div className="modal fade show d-block" tabIndex="-1" role="dialog">
          <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow">
            <div className="modal-header">
              <h3 className="modal-title h5 fw-bold">Start Consultation</h3>
              <button type="button" className="btn-close" onClick={() => setShowStartModal(false)} aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <div className="bg-light rounded p-3 mb-3">
                <p><strong>Patient:</strong> {selectedConsultation.patientName}</p>
                <p><strong>Patient ID:</strong> {selectedConsultation.patientId}</p>
                <p><strong>Consultation Type:</strong> {selectedConsultation.type}</p>
                <p><strong>Date:</strong> {selectedConsultation.date} - {selectedConsultation.time}</p>
              </div>
              <div className="text-center">
                <p className="fw-semibold mb-1">Are you ready to start this consultation?</p>
                <p className="small text-secondary mb-0">This will change the status to "In Progress"</p>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-light" onClick={() => setShowStartModal(false)}>
                Cancel
              </button>
              <button className="btn btn-success" onClick={handleConfirmStart}>Start Consultation
              </button>
            </div>
          </div>
          </div>
        </div>
        <div className="modal-backdrop fade show"></div>
        </>)}

      {/* Complete Consultation Modal */}
      {showCompleteModal && selectedConsultation && (
        <>
        <div className="modal fade show d-block" tabIndex="-1" role="dialog">
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content border-0 shadow">
            <div className="modal-header">
              <h3 className="modal-title h5 fw-bold">Complete Consultation</h3>
              <button type="button" className="btn-close" onClick={() => setShowCompleteModal(false)} aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <div className="bg-light rounded p-3 mb-3">
                <p><strong>Patient:</strong> {selectedConsultation.patientName}</p>
                <p><strong>Patient ID:</strong> {selectedConsultation.patientId}</p>
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Symptoms</label>
                <textarea
                  name="symptoms"
                  placeholder="Patient complains of..."
                  value={consultationForm.symptoms}
                  onChange={handleFormChange}
                  className="form-control"
                  rows="2"
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Diagnosis</label>
                <textarea
                  name="diagnosis"
                  placeholder="Diagnosis..."
                  value={consultationForm.diagnosis}
                  onChange={handleFormChange}
                  className="form-control"
                  rows="2"
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Prescription</label>
                <textarea
                  name="prescription"
                  placeholder="Prescription details..."
                  value={consultationForm.prescription}
                  onChange={handleFormChange}
                  className="form-control"
                  rows="2"
                />
              </div>

              <div>
                <label className="form-label fw-semibold">Notes</label>
                <textarea
                  name="notes"
                  placeholder="Additional notes..."
                  value={consultationForm.notes}
                  onChange={handleFormChange}
                  className="form-control"
                  rows="2"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-light" onClick={() => setShowCompleteModal(false)}>
                Cancel
              </button>
              <button className="btn btn-outline-secondary">Save Draft</button>
              <button className="btn btn-primary" onClick={handleConfirmComplete}>Complete Consultation
              </button>
            </div>
          </div>
          </div>
        </div>
        <div className="modal-backdrop fade show"></div>
        </>)}
      </div>
    </div>);
};

export default Consultations;
