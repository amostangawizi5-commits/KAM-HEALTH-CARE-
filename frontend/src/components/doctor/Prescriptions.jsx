// src/components/doctor/Prescriptions.jsx
import React, { useState } from 'react';

const Prescriptions = ({ 
  prescriptions, 
  pagination, 
  onPageChange, 
  onFilter,
  onCreatePrescription,
  onRefill,
  onRefresh 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRefillModal, setShowRefillModal] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [formData, setFormData] = useState({
    patientId: '',
    medication: '',
    dosage: '',
    duration: '',
    refills: 0,
    instructions: ''
  });

  const statusCounts = {
    ACTIVE: prescriptions?.filter(p => p.status === 'ACTIVE').length || 0,
    REFILL_PENDING: prescriptions?.filter(p => p.status === 'REFILL_PENDING').length || 0,
    COMPLETED: prescriptions?.filter(p => p.status === 'COMPLETED').length || 0,
    EXPIRED: prescriptions?.filter(p => p.status === 'EXPIRED').length || 0,
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'ACTIVE': { class: 'text-bg-success', label: 'Active' },
      'REFILL_PENDING': { class: 'text-bg-warning', label: 'Refill Pending' },
      'COMPLETED': { class: 'text-bg-primary', label: 'Completed' },
      'EXPIRED': { class: 'text-bg-danger', label: 'Expired' },
    };
    return statusMap[status] || statusMap['ACTIVE'];
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

  const handleSubmitPrescription = async (e) => {
    e.preventDefault();
    await onCreatePrescription(formData);
    setShowCreateModal(false);
    setFormData({
      patientId: '',
      medication: '',
      dosage: '',
      duration: '',
      refills: 0,
      instructions: ''
    });
  };

  const handleRefill = (prescription) => {
    setSelectedPrescription(prescription);
    setShowRefillModal(true);
  };

  const handleConfirmRefill = async () => {
    await onRefill(selectedPrescription.id);
    setShowRefillModal(false);
    setSelectedPrescription(null);
  };

  return (
    <div className="card border-0 shadow-sm">
      <div className="card-body">
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-3">
        <h2 className="h4 fw-bold mb-0">Prescriptions</h2>
        <div className="d-flex flex-wrap gap-2">
          <button className="btn btn-success fw-semibold" onClick={() => setShowCreateModal(true)}>
            + New Prescription
          </button>
          <button className="btn btn-outline-success fw-semibold" onClick={onRefresh}>Refresh</button>
        </div>
      </div>

      <div className="d-flex flex-wrap gap-2 mb-3">
        <button 
          className={`btn btn-sm rounded-pill ${statusFilter === 'ALL' ? 'btn-success' : 'btn-outline-success'}`}
          onClick={() => handleFilterChange('ALL')}
        >
          All ({prescriptions?.length || 0})
        </button>
        <button 
          className={`btn btn-sm rounded-pill ${statusFilter === 'ACTIVE' ? 'btn-success' : 'btn-outline-success'}`}
          onClick={() => handleFilterChange('ACTIVE')}
        >Active ({statusCounts.ACTIVE})
        </button>
        <button 
          className={`btn btn-sm rounded-pill ${statusFilter === 'REFILL_PENDING' ? 'btn-warning' : 'btn-outline-warning'}`}
          onClick={() => handleFilterChange('REFILL_PENDING')}
        >
           Refill Pending ({statusCounts.REFILL_PENDING})
        </button>
        <button 
          className={`btn btn-sm rounded-pill ${statusFilter === 'COMPLETED' ? 'btn-primary' : 'btn-outline-primary'}`}
          onClick={() => handleFilterChange('COMPLETED')}
        >Completed ({statusCounts.COMPLETED})
        </button>
        <button 
          className={`btn btn-sm rounded-pill ${statusFilter === 'EXPIRED' ? 'btn-danger' : 'btn-outline-danger'}`}
          onClick={() => handleFilterChange('EXPIRED')}
        >
          Expired ({statusCounts.EXPIRED})
        </button>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); onFilter(1, statusFilter, searchQuery); }} className="d-flex flex-column flex-sm-row gap-2 mb-3">
        <div className="input-group">
          <span className="input-group-text">Search</span>
          <input
            type="text"
            placeholder="Search prescription..."
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
              <th>Script ID</th>
              <th>Patient</th>
              <th>Medication</th>
              <th>Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {prescriptions && prescriptions.length > 0 ? (
              prescriptions.map((p) => {
                const status = getStatusBadge(p.status);
                return (
                  <tr key={p.id}>
                    <td className="fw-semibold">{p.scriptId || p.id}</td>
                    <td className="fw-medium">{p.patientName}</td>
                    <td>{p.medication} <span className="text-secondary small">{p.dosage}</span></td>
                    <td>{p.date}</td>
                    <td><span className={`badge rounded-pill ${status.class}`}>{status.label}</span></td>
                    <td>
                      <div className="d-flex flex-wrap gap-2">
                      <button className="btn btn-sm btn-outline-secondary">View</button>
                      {p.status === 'ACTIVE' && (
                        <button className="btn btn-sm btn-success" onClick={() => handleRefill(p)}>
                          Refill
                        </button>)}
                      {p.status === 'REFILL_PENDING' && (
                        <button className="btn btn-sm btn-warning">Approve</button>)}
                      {p.status === 'EXPIRED' && (
                        <button className="btn btn-sm btn-danger">Renew</button>)}
                      </div>
                    </td>
                  </tr>);
              })) : (
              <tr>
                <td colSpan="6" className="text-center text-secondary py-4">
                  No prescriptions found
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

      {/* Create Prescription Modal */}
      {showCreateModal && (
        <>
        <div className="modal fade show d-block" tabIndex="-1" role="dialog">
          <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content border-0 shadow">
            <div className="modal-header">
              <h3 className="modal-title h5 fw-bold">New Prescription</h3>
              <button type="button" className="btn-close" onClick={() => setShowCreateModal(false)} aria-label="Close"></button>
            </div>
            <form onSubmit={handleSubmitPrescription}>
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
                    <option value="">Search or Select Patient ▼</option>
                    <option value="P001">John Doe</option>
                    <option value="P002">Asha Ali</option>
                    <option value="P003">Mary John</option>
                    <option value="P004">Hassan Ali</option>
                    <option value="P005">Sarah Kim</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Medication</label>
                  <input
                    type="text"
                    name="medication"
                    placeholder="Amlodipine 5mg"
                    value={formData.medication}
                    onChange={handleFormChange}
                    className="form-control"
                    required
                  />
                </div>

                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <label className="form-label fw-semibold">Dosage</label>
                    <input
                      type="text"
                      name="dosage"
                      placeholder="1 tablet daily"
                      value={formData.dosage}
                      onChange={handleFormChange}
                      className="form-control"
                      required
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="form-label fw-semibold">Duration</label>
                    <input
                      type="text"
                      name="duration"
                      placeholder="30 days"
                      value={formData.duration}
                      onChange={handleFormChange}
                      className="form-control"
                      required
                    />
                  </div>
                </div>

                <div className="my-3">
                  <label className="form-label fw-semibold">Refills</label>
                  <div className="btn-group d-flex flex-wrap" role="group">
                    {[0, 1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        type="button"
                        className={`btn ${formData.refills === num ? 'btn-success' : 'btn-outline-success'}`}
                        onClick={() => setFormData({ ...formData, refills: num })}
                      >
                        {num}
                      </button>))}
                  </div>
                </div>

                <div>
                  <label className="form-label fw-semibold">Instructions</label>
                  <textarea
                    name="instructions"
                    placeholder="Take with food. Do not crush or chew."
                    value={formData.instructions}
                    onChange={handleFormChange}
                    className="form-control"
                    rows="2"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-light" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-success">
                  Save Prescription
                </button>
              </div>
            </form>
          </div>
          </div>
        </div>
        <div className="modal-backdrop fade show"></div>
        </>)}

      {/* Refill Modal */}
      {showRefillModal && selectedPrescription && (
        <>
        <div className="modal fade show d-block" tabIndex="-1" role="dialog">
          <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow">
            <div className="modal-header">
              <h3 className="modal-title h5 fw-bold">Refill Prescription</h3>
              <button type="button" className="btn-close" onClick={() => setShowRefillModal(false)} aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <div className="bg-light rounded p-3 mb-3">
                <p><strong>Patient:</strong> {selectedPrescription.patientName}</p>
                <p><strong>Medication:</strong> {selectedPrescription.medication}</p>
                <p><strong>Dosage:</strong> {selectedPrescription.dosage}</p>
                <p><strong>Current Refills:</strong> {selectedPrescription.refills}</p>
              </div>
              <div className="text-center">
                <p className="fw-semibold mb-1">Are you sure you want to refill this prescription?</p>
                <p className="small text-secondary mb-0">This will create a new refill request</p>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-light" onClick={() => setShowRefillModal(false)}>
                Cancel
              </button>
              <button className="btn btn-success" onClick={handleConfirmRefill}>
                Confirm Refill
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

export default Prescriptions;
