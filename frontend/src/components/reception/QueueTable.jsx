import React, { useState } from 'react';

const QueueTable = ({ queue, onSendToConsultant, loading = false }) => {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState('');

  const getStatusLabel = (status) => {
    if (!status) return 'Unknown';
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  };

  const handleSendClick = (patient) => {
    setSelectedPatient(patient);
    setShowModal(true);
  };

  const handleConfirmSend = async () => {
    if (onSendToConsultant && selectedPatient) {
      setIsSending(true);
      setSendError('');

      try {
        await onSendToConsultant(selectedPatient.id);
        setShowModal(false);
        setSelectedPatient(null);
      } catch (error) {
        setSendError(error?.response?.data?.message || 'Unable to send patient to consultant.');
      } finally {
        setIsSending(false);
      }
      return;
    }

    setShowModal(false);
    setSelectedPatient(null);
  };

  return (
    <div className="card border-0 shadow-sm">
      <div className="card-body">
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-3">
        <h3 className="h5 fw-bold mb-0">Today's Queue</h3>
        <span className="badge text-bg-success rounded-pill">{queue?.length || 0} patients</span>
      </div>
      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0">
          <thead className="table-light">
            <tr>
              <th>Queue</th>
              <th>Patient</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" className="text-center text-secondary py-4">
                  Loading queue...
                </td>
              </tr>
            ) : queue && queue.length > 0 ? (
              queue.map((item) => (
                <tr key={item.id}>
                  <td className="fw-semibold">{item.queueNumber || item.id}</td>
                  <td className="fw-medium">{item.name}</td>
                  <td>
                    <span 
                      className="badge rounded-pill"
                      style={{ 
                        background: `${item.statusColor || '#15803d'}20`,
                        color: item.statusColor || '#15803d'
                      }}
                    >
                      {getStatusLabel(item.status)}
                    </span>
                  </td>
                  <td>
                    {item.status === 'WAITING' ? (
                      <button 
                        className="btn btn-sm btn-success"
                        onClick={() => handleSendClick(item)}
                      >
                        Send
                      </button>
                    ) : (
                      <button className="btn btn-sm btn-outline-secondary" disabled>
                        View
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center text-secondary py-4">
                  No patients in queue
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Send to Consultant Modal - As Wireframe */}
      {showModal && selectedPatient && (
        <>
        <div className="modal fade show d-block" tabIndex="-1" role="dialog">
          <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow">
            <div className="modal-header">
              <h3 className="modal-title h5 fw-bold">Send Patient to Consultant</h3>
              <button type="button" className="btn-close" onClick={() => setShowModal(false)} aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <div className="bg-light rounded p-3 mb-3">
                <p><strong>Patient:</strong> {selectedPatient.name}</p>
                <p><strong>Patient ID:</strong> {selectedPatient.patientId || 'P001'}</p>
                <p><strong>Queue No:</strong> {selectedPatient.queueNumber || selectedPatient.id}</p>
              </div>
              
              <div className="mb-3">
                <label className="form-label fw-semibold">Select Consultant</label>
                <select className="form-select">
                  <option>Available Consultant</option>
                </select>
              </div>
              {sendError && <div className="alert alert-danger mb-0">{sendError}</div>}
            </div>
            <div className="modal-footer">
              <button className="btn btn-light" onClick={() => setShowModal(false)} disabled={isSending}>
                Cancel
              </button>
              <button className="btn btn-success" onClick={handleConfirmSend} disabled={isSending}>
                {isSending ? 'Sending...' : 'Send Patient'}
              </button>
            </div>
          </div>
        </div>
        </div>
        <div className="modal-backdrop fade show"></div>
        </>
      )}
      </div>
    </div>
  );
};

export default QueueTable;
