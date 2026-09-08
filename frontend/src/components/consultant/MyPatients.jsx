// src/components/consultant/MyPatients.jsx
import React, { useState } from 'react';

const softShadow = '0 2px 12px rgba(0, 0, 0, 0.06)';
const textDark = '#1a2332';

const MyPatients = ({ patients, pagination, onPageChange, onSearch, onViewPatient, onRefresh }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const totalPages = Math.ceil((pagination?.total || 0) / (pagination?.limit || 10));

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(1, searchQuery);
  };

  const handleViewPatient = (patient) => {
    setSelectedPatient(patient);
    setShowModal(true);
  };

  return (
    <div className="bg-white rounded-4 p-3 p-md-4 shadow-sm" style={{ boxShadow: softShadow }}>
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <h2 className="h4 fw-bold mb-0" style={{ color: textDark }}>My Patients</h2>
        <button className="btn btn-light fw-medium" onClick={onRefresh}>Refresh</button>
      </div>

      <form onSubmit={handleSearch} className="d-flex flex-column flex-sm-row gap-3 mb-4">
        <input
          type="text"
          placeholder="Search patient by name, ID or phone..."
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
              <th className="text-uppercase small text-secondary">Patient ID</th>
              <th className="text-uppercase small text-secondary">Name</th>
              <th className="text-uppercase small text-secondary">Age</th>
              <th className="text-uppercase small text-secondary">Phone</th>
              <th className="text-uppercase small text-secondary">Last Visit</th>
              <th className="text-uppercase small text-secondary">Action</th>
            </tr>
          </thead>
          <tbody>
            {patients && patients.length > 0 ? (
              patients.map((patient) => (
                <tr key={patient.id}>
                  <td className="fw-semibold" style={{ color: textDark }}>{patient.patientId || patient.id}</td>
                  <td className="fw-medium" style={{ color: textDark }}>{patient.name}</td>
                  <td>{patient.age}</td>
                  <td>{patient.phone}</td>
                  <td>{patient.lastVisit || 'N/A'}</td>
                  <td>
                    <div className="d-flex flex-wrap gap-2">
                      <button type="button" className="btn btn-info text-white btn-sm px-3" onClick={() => handleViewPatient(patient)}>View</button>
                      <button type="button" className="btn btn-outline-secondary btn-sm px-3">Edit</button>
                    </div>
                  </td>
                </tr>))) : (
              <tr>
                <td colSpan="6" className="text-center text-secondary py-4">No patients found</td>
              </tr>)}
          </tbody>
        </table>
      </div>

      {pagination?.total > 0 && (
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mt-4">
          <span className="small text-secondary">
            Showing {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
          </span>
          <nav aria-label="Patient pagination">
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

      {showModal && selectedPatient && (
        <>
          <div className="modal fade show d-block" tabIndex="-1" role="dialog">
            <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
              <div className="modal-content rounded-4 border-0 shadow">
                <div className="modal-header">
                  <h3 className="modal-title h5 fw-bold">Patient Details</h3>
                  <button type="button" className="btn-close" onClick={() => setShowModal(false)} aria-label="Close"></button>
                </div>
                <div className="modal-body">
                  <div className="row g-3 mb-4">
                    {[
                      ['Patient ID', selectedPatient.patientId || selectedPatient.id],
                      ['Name', selectedPatient.name],
                      ['Age', selectedPatient.age],
                      ['Gender', selectedPatient.gender || 'Male'],
                      ['Phone', selectedPatient.phone],
                      ['Blood Type', selectedPatient.bloodType || 'A+'],
                    ].map(([label, value]) => (
                      <div className="col-12 col-sm-6" key={label}>
                        <div className="bg-light rounded-3 p-3 h-100">
                          <label className="small text-secondary fw-semibold">{label}</label>
                          <p className="mb-0 fw-semibold" style={{ color: textDark }}>{value}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <section className="mb-3">
                    <h4 className="h6 fw-semibold" style={{ color: textDark }}>Medical History</h4>
                    <ul className="mb-0 text-secondary">
                      <li>Hypertension (2023)</li>
                      <li>Diabetes Type 2 (2024)</li>
                    </ul>
                  </section>

                  <section className="mb-3">
                    <h4 className="h6 fw-semibold" style={{ color: textDark }}>Current Medications</h4>
                    <ul className="mb-0 text-secondary">
                      <li>Amlodipine 5mg - Daily</li>
                      <li>Metformin 500mg - Twice daily</li>
                    </ul>
                  </section>

                  <section>
                    <h4 className="h6 fw-semibold" style={{ color: textDark }}>Last Visit</h4>
                    <p className="mb-1">Date: {selectedPatient.lastVisit || '02 August 2026'}</p>
                    <p className="mb-0">Diagnosis: Hypertension checkup</p>
                  </section>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline-secondary">Edit</button>
                  <button
                    type="button"
                    className="btn btn-info text-white"
                    onClick={() => {
                      setShowModal(false);
                      onViewPatient(selectedPatient.id);
                    }}
                  >
                    New Consultation
                  </button>
                  <button type="button" className="btn btn-light" onClick={() => setShowModal(false)}>Close</button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>)}
    </div>);
};

export default MyPatients;
