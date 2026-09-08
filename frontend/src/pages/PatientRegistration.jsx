import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import logo from '../kazimililogo.png';

const PatientRegistration = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    age: '',
    gender: 'MALE',
    phone: '',
    email: '',
    address: '',
    emergencyContact: '',
    bloodGroup: '',
    allergies: '',
    visitReason: '',
    isEmergency: false
  });

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setSuccess(false);

    try {
      // Backend will be connected here later
      console.log('Patient Data:', formData);

      setSuccess(true);

      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);

    } catch (error) {
      console.error('Registration error:', error);

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 bg-light py-4">

      <div className="container">

        {/* ================= HEADER ================= */}
        <div className="card shadow-sm border-0 rounded-4 mb-4">

          <div className="card-body">

            <div className="row align-items-center">

              {/* Back Button */}
              <div className="col-md-3 mb-2 mb-md-0">
                <button
                  type="button"
                  className="btn btn-outline-primary"
                  onClick={() => navigate('/dashboard')}
                >
                  ← Back
                </button>
              </div>

              {/* Page Title */}
              <div className="col-md-6 text-center">

                <div className="d-flex align-items-center justify-content-center gap-2">

                  <span className="fs-3">
                    🏥
                  </span>

                  <h1 className="h4 fw-bold mb-0">
                    Patient Registration
                  </h1>

                </div>

              </div>

              {/* User Information */}
              <div className="col-md-3">

                <div className="d-flex justify-content-md-end justify-content-center align-items-center gap-2">

                  <span className="badge bg-info text-dark text-uppercase">
                    {user?.role}
                  </span>

                  <span className="fw-semibold">
                    {user?.firstName}
                  </span>

                </div>

              </div>

            </div>

          </div>

        </div>


        {/* ================= REGISTRATION CARD ================= */}
        <div className="card shadow-sm border-0 rounded-4">

          <div className="card-body p-4 p-md-5">

            {/* Logo */}
            <div className="text-center mb-4">

              <img
                src={logo}
                alt="KazimiliCare Logo"
                className="img-fluid"
                style={{
                  width: '80px',
                  height: '80px',
                  objectFit: 'contain'
                }}
              />

            </div>


            {/* ================= SUCCESS MESSAGE ================= */}

            {success ? (

              <div className="text-center py-5">

                <div className="display-3 mb-3">
                  ✅
                </div>

                <h2 className="h4 fw-bold">
                  Patient Registered Successfully
                </h2>

                <p className="text-muted">
                  Patient has been added to the system and sent to queue.
                </p>

                <button
                  type="button"
                  className="btn btn-primary px-4"
                  onClick={() => navigate('/dashboard')}
                >
                  Go to Dashboard
                </button>

              </div>

            ) : (

              /* ================= FORM ================= */

              <form onSubmit={handleSubmit}>

                {/* ================= PERSONAL INFORMATION ================= */}

                <div className="bg-light rounded-3 p-4 mb-4">

                  <h3 className="h6 fw-bold border-bottom pb-2 mb-4">
                    Personal Information
                  </h3>


                  {/* First Name + Last Name */}
                  <div className="row g-3 mb-3">

                    <div className="col-md-6">

                      <label className="form-label fw-semibold">
                        First Name
                        <span className="text-danger"> *</span>
                      </label>

                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        placeholder="Enter first name"
                        className="form-control"
                        required
                      />

                    </div>


                    <div className="col-md-6">

                      <label className="form-label fw-semibold">
                        Last Name
                        <span className="text-danger"> *</span>
                      </label>

                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        placeholder="Enter last name"
                        className="form-control"
                        required
                      />

                    </div>

                  </div>


                  {/* Age + Gender */}
                  <div className="row g-3 mb-3">

                    <div className="col-md-6">

                      <label className="form-label fw-semibold">
                        Age
                        <span className="text-danger"> *</span>
                      </label>

                      <input
                        type="number"
                        name="age"
                        value={formData.age}
                        onChange={handleChange}
                        placeholder="Enter age"
                        min="0"
                        max="130"
                        className="form-control"
                        required
                      />

                    </div>


                    <div className="col-md-6">

                      <label className="form-label fw-semibold">
                        Gender
                        <span className="text-danger"> *</span>
                      </label>

                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className="form-select"
                        required
                      >

                        <option value="MALE">
                          Male
                        </option>

                        <option value="FEMALE">
                          Female
                        </option>

                        <option value="OTHER">
                          Other
                        </option>

                      </select>

                    </div>

                  </div>


                  {/* Phone + Email */}
                  <div className="row g-3 mb-3">

                    <div className="col-md-6">

                      <label className="form-label fw-semibold">
                        Phone Number
                      </label>

                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Enter phone number"
                        className="form-control"
                      />

                    </div>


                    <div className="col-md-6">

                      <label className="form-label fw-semibold">
                        Email
                      </label>

                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter email address"
                        className="form-control"
                      />

                    </div>

                  </div>


                  {/* Address */}
                  <div>

                    <label className="form-label fw-semibold">
                      Address
                    </label>

                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Enter home address"
                      className="form-control"
                    />

                  </div>

                </div>


                {/* ================= MEDICAL INFORMATION ================= */}

                <div className="bg-light rounded-3 p-4 mb-4">

                  <h3 className="h6 fw-bold border-bottom pb-2 mb-4">
                    Medical Information
                  </h3>


                  {/* Emergency Contact + Blood Group */}
                  <div className="row g-3 mb-3">

                    <div className="col-md-6">

                      <label className="form-label fw-semibold">
                        Emergency Contact
                      </label>

                      <input
                        type="tel"
                        name="emergencyContact"
                        value={formData.emergencyContact}
                        onChange={handleChange}
                        placeholder="Emergency contact number"
                        className="form-control"
                      />

                    </div>


                    <div className="col-md-6">

                      <label className="form-label fw-semibold">
                        Blood Group
                      </label>

                      <select
                        name="bloodGroup"
                        value={formData.bloodGroup}
                        onChange={handleChange}
                        className="form-select"
                      >

                        <option value="">
                          Select Blood Group
                        </option>

                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>

                      </select>

                    </div>

                  </div>


                  {/* Allergies */}
                  <div>

                    <label className="form-label fw-semibold">
                      Allergies
                    </label>

                    <textarea
                      name="allergies"
                      value={formData.allergies}
                      onChange={handleChange}
                      placeholder="List any known allergies"
                      rows="2"
                      className="form-control"
                    />

                  </div>

                </div>


                {/* ================= VISIT INFORMATION ================= */}

                <div className="bg-light rounded-3 p-4 mb-4">

                  <h3 className="h6 fw-bold border-bottom pb-2 mb-4">
                    Visit Information
                  </h3>


                  {/* Visit Reason */}
                  <div className="mb-3">

                    <label className="form-label fw-semibold">
                      Visit Reason
                      <span className="text-danger"> *</span>
                    </label>

                    <textarea
                      name="visitReason"
                      value={formData.visitReason}
                      onChange={handleChange}
                      placeholder="Describe the reason for visit"
                      rows="3"
                      className="form-control"
                      required
                    />

                  </div>


                  {/* Emergency Checkbox */}
                  <div className="form-check">

                    <input
                      type="checkbox"
                      name="isEmergency"
                      checked={formData.isEmergency}
                      onChange={handleChange}
                      className="form-check-input"
                      id="isEmergency"
                    />

                    <label
                      className="form-check-label fw-semibold"
                      htmlFor="isEmergency"
                    >
                      Mark as Emergency
                    </label>

                  </div>

                </div>


                {/* ================= BUTTONS ================= */}

                <div className="d-flex justify-content-end gap-2">

                  <button
                    type="button"
                    className="btn btn-outline-secondary px-4"
                    onClick={() => navigate('/dashboard')}
                  >
                    Cancel
                  </button>


                  <button
                    type="submit"
                    className="btn btn-primary px-4"
                    disabled={loading}
                  >

                    {loading
                      ? 'Registering...'
                      : 'Register Patient'
                    }

                  </button>

                </div>

              </form>

            )}

          </div>

        </div>

      </div>

    </div>
  );
};

export default PatientRegistration;