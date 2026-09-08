// src/components/consultant/Consultations.jsx
import React, { useState } from 'react';

const softShadow = '0 2px 12px rgba(0, 0, 0, 0.06)';
const textDark = '#1a2332';

const statusStyles = {
  PENDING: { background: '#fef3c7', color: '#d97706', label: 'Pending' },
  IN_PROGRESS: { background: '#dbeafe', color: '#2563eb', label: 'In Progress' },
  COMPLETED: { background: '#dcfce7', color: '#22c55e', label: 'Completed' },
  UPCOMING: { background: '#e0f2fe', color: '#0284c7', label: 'Upcoming' },
};

const filters = [
  { value: 'ALL', label: 'All', variant: 'info' },
  { value: 'PENDING', label: 'Pending', variant: 'warning' },
  { value: 'IN_PROGRESS', label: 'In Progress', variant: 'info' },
  { value: 'COMPLETED', label: 'Completed', variant: 'success' },
  { value: 'UPCOMING', label: 'Upcoming', variant: 'primary' },
];

const Consultations = ({
  consultations,
  pagination,
  onPageChange,
  onFilter,
  onStart,
  onComplete,
  onRefresh,
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
    notes: '',
  });

  const counts = {
    ALL: consultations?.length || 0,
    PENDING: consultations?.filter((c) => c.status === 'PENDING').length || 0,
    IN_PROGRESS: consultations?.filter((c) => c.status === 'IN_PROGRESS').length || 0,
    COMPLETED: consultations?.filter((c) => c.status === 'COMPLETED').length || 0,
    UPCOMING: consultations?.filter((c) => c.status === 'UPCOMING').length || 0,
  };

  const totalPages = Math.ceil((pagination?.total || 0) / (pagination?.limit || 10));

  const handleFilter = (status) => {
    setStatusFilter(status);
    onFilter(1, status);
  };

  const handleCompleteClick = (consultation) => {
    setSelectedConsultation(consultation);
    setConsultationForm({
      symptoms: consultation.symptoms || '',
      diagnosis: consultation.diagnosis || '',
      prescription: consultation.prescription || '',
      notes: consultation.notes || '',
    });
    setShowCompleteModal(true);
  };

  const handleFormChange = (e) => {
    setConsultationForm({
      ...consultationForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleConfirmStart = async () => {
    await onStart(selectedConsultation.id);
    setShowStartModal(false);
    setSelectedConsultation(null);
  };

  const handleConfirmComplete = async () => {
    await onComplete(selectedConsultation.id, consultationForm);
    setShowCompleteModal(false);
    setSelectedConsultation(null);
  };

  return (
    <div className="bg-white rounded-4 p-3 p-md-4 shadow-sm" style={{ boxShadow: softShadow }}>
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <h2 className="h4 fw-bold mb-0" style={{ color: textDark }}>Consultations</h2>
        <button className="btn btn-light fw-medium" onClick={onRefresh}>Refresh</button>
      </div>

      <div className="d-flex flex-wrap gap-2 mb-3">
        {filters.map((filter) => (
          <button
            key={filter.value}
            type="button"
            className={`btn btn-sm rounded-pill px-3 fw-medium ${
              statusFilter === filter.value ? `btn-${filter.variant}` : 'btn-outline-secondary'
            }`}
            onClick={() => handleFilter(filter.value)}
          >
            {filter.label} ({counts[filter.value]})
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
          placeholder="Search consultation by patient name..."
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
              <th className="text-uppercase small text-secondary">#</th>
              <th className="text-uppercase small text-secondary">Patient</th>
              <th className="text-uppercase small text-secondary">Date</th>
              <th className="text-uppercase small text-secondary">Type</th>
              <th className="text-uppercase small text-secondary">Status</th>
              <th className="text-uppercase small text-secondary">Action</th>
            </tr>
          </thead>
          <tbody>
            {consultations && consultations.length > 0 ? (
              consultations.map((consultation) => {
                const status = statusStyles[consultation.status] || statusStyles.PENDING;

                return (
                  <tr key={consultation.id}>
                    <td className="fw-semibold" style={{ color: textDark }}>{consultation.consultationId || consultation.id}</td>
                    <td className="fw-medium" style={{ color: textDark }}>{consultation.patientName}</td>
                    <td>{consultation.date} {consultation.time}</td>
                    <td>{consultation.type}</td>
                    <td><span className="badge rounded-pill px-3 py-2" style={status}>{status.label}</span></td>
                    <td>
                      <div className="d-flex flex-wrap gap-2">
                        {consultation.status === 'PENDING' && (
                          <button
                            type="button"
                            className="btn btn-success btn-sm px-3"
                            onClick={() => {
                              setSelectedConsultation(consultation);
                              setShowStartModal(true);
                            }}
                          >
                            Start
                          </button>)}
                        {consultation.status === 'IN_PROGRESS' && (
                          <>
                            <button type="button" className="btn btn-primary btn-sm px-3" onClick={() => handleCompleteClick(consultation)}>Complete</button>
                            <button type="button" className="btn btn-outline-secondary btn-sm px-3">View</button>
                          </>)}
                        {(consultation.status === 'COMPLETED' || consultation.status === 'UPCOMING') && (
                          <button type="button" className="btn btn-outline-secondary btn-sm px-3">View</button>)}
                      </div>
                    </td>
                  </tr>);
              })) : (
              <tr>
                <td colSpan="6" className="text-center text-secondary py-4">No consultations found</td>
              </tr>)}
          </tbody>
        </table>
      </div>

      {pagination?.total > 0 && (
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mt-4">
          <span className="small text-secondary">
            Showing {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
          </span>
          <nav aria-label="Consultation pagination">
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

      {showStartModal && selectedConsultation && (
        <>
          <div className="modal fade show d-block" tabIndex="-1" role="dialog">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content rounded-4 border-0 shadow">
                <div className="modal-header">
                  <h3 className="modal-title h5 fw-bold">Start Consultation</h3>
                  <button type="button" className="btn-close" onClick={() => setShowStartModal(false)} aria-label="Close"></button>
                </div>
                <div className="modal-body">
                  <div className="bg-light rounded-3 p-3 mb-3">
                    <p className="mb-1"><strong>Patient:</strong> {selectedConsultation.patientName}</p>
                    <p className="mb-1"><strong>Patient ID:</strong> {selectedConsultation.patientId}</p>
                    <p className="mb-1"><strong>Consultation Type:</strong> {selectedConsultation.type}</p>
                    <p className="mb-0"><strong>Date:</strong> {selectedConsultation.date} - {selectedConsultation.time}</p>
                  </div>
                  <div className="text-center bg-light rounded-3 p-3">
                    <p className="mb-1 fw-semibold" style={{ color: textDark }}>Are you ready to start this consultation?</p>
                    <p className="small text-secondary mb-0">This will change the status to In Progress.</p>
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-light" onClick={() => setShowStartModal(false)}>Cancel</button>
                  <button className="btn btn-success" onClick={handleConfirmStart}>Start Consultation</button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>)}

      {showCompleteModal && selectedConsultation && (
        <>
          <div className="modal fade show d-block" tabIndex="-1" role="dialog">
            <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
              <div className="modal-content rounded-4 border-0 shadow">
                <div className="modal-header">
                  <h3 className="modal-title h5 fw-bold">Complete Consultation</h3>
                  <button type="button" className="btn-close" onClick={() => setShowCompleteModal(false)} aria-label="Close"></button>
                </div>
                <div className="modal-body">
                  <div className="bg-light rounded-3 p-3 mb-3">
                    <p className="mb-1"><strong>Patient:</strong> {selectedConsultation.patientName}</p>
                    <p className="mb-0"><strong>Patient ID:</strong> {selectedConsultation.patientId}</p>
                  </div>
                  {['symptoms', 'diagnosis', 'prescription', 'notes'].map((field) => (
                    <div className="mb-3" key={field}>
                      <label className="form-label fw-semibold text-capitalize">{field}</label>
                      <textarea
                        name={field}
                        placeholder={`${field.charAt(0).toUpperCase() + field.slice(1)}...`}
                        value={consultationForm[field]}
                        onChange={handleFormChange}
                        className="form-control"
                        rows="2"
                      />
                    </div>
                  ))}
                </div>
                <div className="modal-footer">
                  <button className="btn btn-light" onClick={() => setShowCompleteModal(false)}>Cancel</button>
                  <button className="btn btn-outline-secondary">Save Draft</button>
                  <button className="btn btn-primary" onClick={handleConfirmComplete}>Complete Consultation</button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>)}
    </div>);
};

export default Consultations;
