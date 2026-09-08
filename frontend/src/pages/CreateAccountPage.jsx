import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import logo from '../kazimililogo.png';

const CreateAccountPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'RECEPTIONIST',
    phone: '',
    specialization: '',
    licenseNumber: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await api.post('/auth/register', formData);
      if (response.data.success) {
        setMessage('Account created successfully. You can now sign in.');
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          role: 'RECEPTIONIST',
          phone: '',
          specialization: '',
          licenseNumber: ''
        });
      } else {
        setError(response.data.message || 'Unable to create account');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-account-page">
      <div className="create-account-card">
        <div className="create-account-header">
          <img src={logo} alt="KazimiliCare Logo" />
          <div>
            <h1>Create Account</h1>
            <p>Create a new staff account with the role you choose</p>
          </div>
        </div>

        {message && <div className="success-box">{message}</div>}
        {error && <div className="error-box">{error}</div>}

        <form onSubmit={handleSubmit} className="create-account-form">
          <div className="form-grid">
            <div className="form-group">
              <label>First Name</label>
              <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Role</label>
              <select name="role" value={formData.role} onChange={handleChange} required>
                <option value="RECEPTIONIST">Receptionist</option>
                <option value="CONSULTANT">Consultant</option>
                <option value="DOCTOR">Doctor</option>
                <option value="LABORATORY">Medical Laboratory</option>
                <option value="PHARMACIST">Pharmacist</option>
                <option value="CASHIER">Cashier</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Specialization</label>
              <input type="text" name="specialization" value={formData.specialization} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>License Number</label>
              <input type="text" name="licenseNumber" value={formData.licenseNumber} onChange={handleChange} />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="secondary-btn" onClick={() => navigate('/login')}>Back to Login</button>
            <button type="submit" className="primary-btn" disabled={loading}>
              {loading ? 'Creating...' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .create-account-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #f3f7fa, #e8f4f8);
          padding: 24px;
          font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        .create-account-card {
          width: 100%;
          max-width: 900px;
          background: white;
          border-radius: 18px;
          padding: 28px;
          box-shadow: 0 12px 32px rgba(0,0,0,0.08);
        }
        .create-account-header {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 20px;
        }
        .create-account-header img {
          width: 56px;
          height: 56px;
          object-fit: contain;
        }
        .create-account-header h1 { margin: 0; font-size: 24px; color: #111827; }
        .create-account-header p { margin: 4px 0 0; color: #6b7280; }
        .success-box {
          background: #ecfdf3; color: #065f46; border: 1px solid #a7f3d0; padding: 12px 14px; border-radius: 10px; margin-bottom: 14px;
        }
        .error-box {
          background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; padding: 12px 14px; border-radius: 10px; margin-bottom: 14px;
        }
        .form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
        .form-group { display: flex; flex-direction: column; gap: 6px; }
        .form-group label { font-size: 13px; font-weight: 600; color: #374151; }
        .form-group input, .form-group select {
          padding: 10px 12px; border-radius: 10px; border: 1px solid #d1d5db; font-size: 14px;
        }
        .form-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 18px; }
        .primary-btn, .secondary-btn {
          border: none; padding: 10px 16px; border-radius: 10px; font-weight: 600; cursor: pointer;
        }
        .primary-btn { background: #006780; color: white; }
        .secondary-btn { background: #e5e7eb; color: #111827; }
        @media (max-width: 768px) { .form-grid { grid-template-columns: 1fr; } .form-actions { flex-direction: column-reverse; } }
      `}</style>
    </div>
  );
};

export default CreateAccountPage;
