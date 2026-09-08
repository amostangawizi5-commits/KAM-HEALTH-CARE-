import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import logo from '../kazimililogo.png';

const emptyForm = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  phone: ''
};

const AdminSetupPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState(emptyForm);
  const [checking, setChecking] = useState(true);
  const [canCreateAdmin, setCanCreateAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await api.get('/auth/bootstrap-admin/status');
        setCanCreateAdmin(Boolean(response.data?.data?.canCreateAdmin));
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to check admin setup status.');
      } finally {
        setChecking(false);
      }
    };

    checkStatus();
  }, []);

  const canSubmit = useMemo(() => {
    return (
      formData.firstName.trim() &&
      formData.lastName.trim() &&
      formData.email.trim() &&
      formData.password.trim() &&
      !loading
    );
  }, [formData, loading]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!canSubmit) {
      setError('Enter the required admin details to continue.');
      return;
    }

    setLoading(true);

    try {
      await api.post('/auth/bootstrap-admin', {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        phone: formData.phone.trim()
      });

      const result = await login(formData.email.trim(), formData.password);
      if (result.success) {
        navigate('/dashboard', { replace: true });
        return;
      }

      setMessage('Admin account created. Please sign in with the email and password you just entered.');
      setFormData(emptyForm);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to create the first admin account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-setup-page">
      <main className="admin-setup-card">
        <div className="admin-setup-header">
          <img src={logo} alt="KazimiliCare Logo" />
          <div>
            <h1>First Admin Setup</h1>
            <p>Create the initial administrator account for this system.</p>
          </div>
        </div>

        {checking ? (
          <div className="info-box">Checking database setup...</div>
        ) : canCreateAdmin ? (
          <form onSubmit={handleSubmit} className="admin-setup-form">
            {message && <div className="success-box">{message}</div>}
            {error && <div className="error-box" role="alert">{error}</div>}

            <div className="form-grid">
              <label>
                <span>First Name</span>
                <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required />
              </label>
              <label>
                <span>Last Name</span>
                <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required />
              </label>
              <label>
                <span>Email</span>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required />
              </label>
              <label>
                <span>Password</span>
                <input type="password" name="password" value={formData.password} onChange={handleChange} required />
              </label>
              <label className="wide-field">
                <span>Phone</span>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} />
              </label>
            </div>

            <div className="form-actions">
              <Link to="/login" className="secondary-link">Back to Login</Link>
              <button type="submit" disabled={!canSubmit}>
                {loading ? 'Creating admin...' : 'Create Admin'}
              </button>
            </div>
          </form>
        ) : (
          <div className="setup-closed">
            {error ? <div className="error-box" role="alert">{error}</div> : <div className="info-box">An admin account already exists.</div>}
            <Link to="/login" className="primary-link">Go to Login</Link>
          </div>
        )}
      </main>

      <style>{`
        .admin-setup-page {
          min-height: 100vh;
          display: grid;
          place-items: center;
          padding: 24px;
          background: #f4f8fa;
          color: #142126;
          font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .admin-setup-card {
          width: min(760px, 100%);
          background: #ffffff;
          border: 1px solid #dce7eb;
          border-radius: 8px;
          padding: 28px;
          box-shadow: 0 18px 46px rgba(20, 33, 38, 0.12);
        }

        .admin-setup-header {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 22px;
        }

        .admin-setup-header img {
          width: 56px;
          height: 56px;
          object-fit: contain;
        }

        .admin-setup-header h1 {
          margin: 0;
          font-size: 25px;
          letter-spacing: 0;
        }

        .admin-setup-header p {
          margin: 4px 0 0;
          color: #65747a;
        }

        .admin-setup-form {
          display: grid;
          gap: 18px;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
        }

        .wide-field {
          grid-column: 1 / -1;
        }

        .admin-setup-form label {
          display: grid;
          gap: 7px;
        }

        .admin-setup-form span {
          color: #33454c;
          font-size: 13px;
          font-weight: 800;
        }

        .admin-setup-form input {
          width: 100%;
          min-height: 46px;
          border: 1px solid #bdcbd1;
          border-radius: 8px;
          padding: 0 13px;
          color: #142126;
          font: inherit;
          outline: none;
          background: #fbfcfd;
        }

        .admin-setup-form input:focus {
          border-color: #006780;
          background: #ffffff;
          box-shadow: 0 0 0 4px rgba(0,103,128,0.12);
        }

        .form-actions,
        .setup-closed {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 12px;
        }

        .setup-closed {
          justify-content: space-between;
          align-items: stretch;
          flex-wrap: wrap;
        }

        .form-actions button,
        .primary-link,
        .secondary-link {
          min-height: 44px;
          border-radius: 8px;
          padding: 0 16px;
          font: inherit;
          font-weight: 900;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .form-actions button,
        .primary-link {
          border: 0;
          background: #006780;
          color: #ffffff;
          cursor: pointer;
        }

        .form-actions button:disabled {
          cursor: not-allowed;
          opacity: 0.62;
        }

        .secondary-link {
          color: #006780;
          background: #eef6f8;
        }

        .success-box,
        .error-box,
        .info-box {
          padding: 12px 14px;
          border-radius: 8px;
          font-weight: 800;
        }

        .success-box {
          background: #ecfdf3;
          color: #065f46;
          border: 1px solid #a7f3d0;
        }

        .error-box {
          background: #fff3f2;
          color: #8f1414;
          border: 1px solid #f3b8b8;
        }

        .info-box {
          background: #eef6f8;
          color: #33454c;
          border: 1px solid #d3e4ea;
        }

        @media (max-width: 620px) {
          .admin-setup-card {
            padding: 20px;
          }

          .admin-setup-header {
            align-items: flex-start;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }

          .form-actions,
          .setup-closed {
            flex-direction: column;
            align-items: stretch;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminSetupPage;
