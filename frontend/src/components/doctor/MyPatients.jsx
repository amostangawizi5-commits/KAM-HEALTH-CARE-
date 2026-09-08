// src/components/doctor/MyPatients.jsx
import React, { useState } from 'react';

const MyPatients = ({ patients, pagination, onPageChange, onSearch, onViewPatient, onRefresh }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(1, searchQuery);
  };

  const handleViewPatient = (patient) => {
    setSelectedPatient(patient);
    setShowModal(true);
  };

  return (
    <div className="card border-0 shadow-sm">
      <div className="card-body">
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-3">
        <h2 className="h4 fw-bold mb-0">My Patients</h2>
        <button className="btn btn-outline-success fw-semibold" onClick={onRefresh}>Refresh
        </button>
      </div>

      <form onSubmit={handleSearch} className="d-flex flex-column flex-sm-row gap-2 mb-3">
        <div className="input-group">
          <span className="input-group-text">Search</span>
          <input
            type="text"
            placeholder="Search patient by name, ID or phone..."
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
              <th>Patient ID</th>
              <th>Name</th>
              <th>Age</th>
              <th>Phone</th>
              <th>Last Visit</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {patients && patients.length > 0 ? (
              patients.map((p) => (
                <tr key={p.id}>
                  <td className="fw-semibold">{p.patientId || p.id}</td>
                  <td className="fw-medium">{p.name}</td>
                  <td>{p.age}</td>
                  <td>{p.phone}</td>
                  <td>{p.lastVisit || 'N/A'}</td>
                  <td>
                    <div className="d-flex flex-wrap gap-2">
                    <button className="btn btn-sm btn-outline-secondary" onClick={() => handleViewPatient(p)}>
                      View
                    </button>
                    <button className="btn btn-sm btn-outline-success">Edit</button>
                    </div>
                  </td>
                </tr>))) : (
              <tr>
                <td colSpan="6" className="text-center text-secondary py-4">
                  No patients found
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

      {/* View Patient Modal */}
      {showModal && selectedPatient && (
        <>
        <div className="modal fade show d-block" tabIndex="-1" role="dialog">
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content border-0 shadow">
            <div className="modal-header">
              <h3 className="modal-title h5 fw-bold">Patient Details</h3>
              <button type="button" className="btn-close" onClick={() => setShowModal(false)} aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <div className="row g-3 mb-3">
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold text-secondary">Patient ID</label>
                  <p className="fw-medium mb-0">{selectedPatient.patientId || selectedPatient.id}</p>
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold text-secondary">Name</label>
                  <p className="fw-medium mb-0">{selectedPatient.name}</p>
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold text-secondary">Age</label>
                  <p className="fw-medium mb-0">{selectedPatient.age}</p>
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold text-secondary">Gender</label>
                  <p className="fw-medium mb-0">{selectedPatient.gender || 'Male'}</p>
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold text-secondary">Phone</label>
                  <p className="fw-medium mb-0">{selectedPatient.phone}</p>
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold text-secondary">Blood Type</label>
                  <p className="fw-medium mb-0">{selectedPatient.bloodType || 'A+'}</p>
                </div>
              </div>
              
              <div className="mb-3">
                <h4 className="h6 fw-bold">Medical History</h4>
                <ul className="list-group">
                  <li className="list-group-item">Hypertension (2023)</li>
                  <li className="list-group-item">Diabetes Type 2 (2024)</li>
                </ul>
              </div>

              <div className="mb-3">
                <h4 className="h6 fw-bold">Current Medications</h4>
                <ul className="list-group">
                  <li className="list-group-item">Amlodipine 5mg - Daily</li>
                  <li className="list-group-item">Metformin 500mg - Twice daily</li>
                </ul>
              </div>

              <div>
                <h4 className="h6 fw-bold">Last Visit</h4>
                <p>Date: {selectedPatient.lastVisit || '02 August 2026'}</p>
                <p>Diagnosis: Hypertension checkup</p>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline-success">Edit</button>
              <button className="btn btn-success" onClick={() => {
                setShowModal(false);
                onViewPatient(selectedPatient.id);
              }}>New Consultation
              </button>
              <button className="btn btn-light" onClick={() => setShowModal(false)}>Close</button>
            </div>
          </div>
          </div>
        </div>
        <div className="modal-backdrop fade show"></div>
        </>)}
      </div>
    </div>);
};

export default MyPatients;
