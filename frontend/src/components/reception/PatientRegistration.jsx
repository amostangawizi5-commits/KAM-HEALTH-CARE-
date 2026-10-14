import React, { useState } from 'react';

const PatientRegistration = ({
  nextQueueNumber,
  onCancel,
  onComplete,
  onSendToConsultant,
  onViewQueue,
}) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    age: '',
    gender: 'Male',
    phone: '',
    nationalId: '',
    address: '',
    reason: 'General visit'
  });

  const [showSuccess, setShowSuccess] = useState(false);
  const [newPatient, setNewPatient] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSaving(true);
    
    const patient = {
      name: [formData.firstName.trim(), formData.lastName.trim()].filter(Boolean).join(' '),
      queueNumber: nextQueueNumber || 'Q-001',
      status: 'WAITING',
      statusColor: '#15803d',
      registrationDate: new Date().toISOString().split('T')[0],
      reason: formData.reason || 'General visit',
      ...formData,
      phone: `+255${formData.phone.replace(/\D/g, '').replace(/^255/, '').replace(/^0/, '')}`
    };
    
    try {
      const savedPatient = onComplete ? await onComplete(patient) : patient;
      setNewPatient(savedPatient || patient);
      setShowSuccess(true);
    } catch (saveError) {
      setError(saveError?.response?.data?.message || 'Unable to register patient. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendToConsultant = async () => {
    if (!newPatient || !onSendToConsultant) return;

    setError('');
    setIsSending(true);

    try {
      await onSendToConsultant(newPatient.id);
    } catch (sendError) {
      setError(sendError?.response?.data?.message || 'Unable to send patient to consultant.');
    } finally {
      setIsSending(false);
    }
  };

  if (showSuccess && newPatient) {
    return (
      <>
        <div className="alert alert-success shadow-sm" role="status" aria-live="polite">
          <strong>Patient registered successfully</strong>
          <div>{newPatient.name} has been added to {newPatient.queueNumber}</div>
        </div>
        <div className="card border-0 shadow-sm">
          <div className="card-body">
          <h2 className="h4 fw-bold mb-3">Registration Complete</h2>
          <div className="bg-light rounded p-3 mb-3">
            <p><strong>Patient:</strong> {newPatient.name}</p>
            <p><strong>Patient ID:</strong> {newPatient.patientId}</p>
            <p><strong>Queue Number:</strong> {newPatient.queueNumber}</p>
            <p><strong>Status:</strong> Waiting at Reception</p>
          </div>
          <div className="d-flex flex-wrap gap-2">
            <button className="btn btn-outline-success fw-semibold" onClick={onViewQueue}>View Queue</button>
            <button className="btn btn-success fw-semibold" onClick={handleSendToConsultant} disabled={isSending}>
              {isSending ? 'Sending...' : 'Send to Consultant'}
            </button>
          </div>
          {error && <div className="alert alert-danger mt-3 mb-0">{error}</div>}
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="card border-0 shadow-sm">
      <div className="card-body">
      <h2 className="h4 fw-bold mb-4">Register New Patient</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <h4 className="h6 fw-bold text-secondary text-uppercase mb-3">Personal Information</h4>
          
          <div className="row g-3 mb-3">
            <div className="col-12 col-md-4">
              <label className="form-label fw-semibold" htmlFor="patient-first-name">First Name</label>
              <input
                id="patient-first-name"
                type="text"
                name="firstName"
                autoComplete="given-name"
                placeholder="John"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="form-control form-control-sm"
              />
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label fw-semibold" htmlFor="patient-last-name">Last Name</label>
              <input
                id="patient-last-name"
                type="text"
                name="lastName"
                autoComplete="family-name"
                placeholder="Doe"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="form-control form-control-sm"
              />
            </div>
          </div>

          <div className="row g-3">
            <div className="col-12 col-md-6">
              <label className="form-label fw-semibold">Age</label>
              <input
                type="number"
                name="age"
                placeholder="30"
                min="0"
                max="130"
                value={formData.age}
                onChange={handleChange}
                required
                className="form-control"
              />
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label fw-semibold">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="form-select"
              >
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
          </div>

          <div className="row g-3 mt-1">
            <div className="col-12 col-md-6">
              <label className="form-label fw-semibold">Phone Number</label>
              <div className="input-group">
                <span className="input-group-text">+255</span>
                <input
                  type="tel"
                  name="phone"
                  inputMode="tel"
                  placeholder="712 345 678"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="form-control"
                  aria-label="Phone number without country code"
                />
              </div>
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label fw-semibold">National ID</label>
              <input
                type="text"
                name="nationalId"
                placeholder="1998XXXXXXXXX"
                value={formData.nationalId}
                onChange={handleChange}
                className="form-control"
              />
            </div>
          </div>

          <div className="mt-3">
            <label className="form-label fw-semibold">Address</label>
            <input
              type="text"
              name="address"
              placeholder="Mwanza"
              value={formData.address}
              onChange={handleChange}
              className="form-control"
            />
          </div>

          <div className="mt-3">
            <label className="form-label fw-semibold">Visit Reason / Complaint</label>
            <textarea
              name="reason"
              rows="3"
              placeholder="Headache, fever, chest pain..."
              value={formData.reason}
              onChange={handleChange}
              required
              className="form-control"
            />
          </div>
        </div>

        {error && <div className="alert alert-danger mt-3 mb-0">{error}</div>}

        <div className="d-flex justify-content-end flex-wrap gap-2 mt-4">
          <button type="button" className="btn btn-light" onClick={onCancel}>Cancel</button>
          <button type="submit" className="btn btn-success fw-semibold" disabled={isSaving}>
            {isSaving ? 'Registering...' : 'Register Patient'}
          </button>
        </div>
      </form>
      </div>
    </div>
  );
};

export default PatientRegistration;
