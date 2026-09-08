import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import AccountMenu from '../components/common/AccountMenu';
import api from '../services/api';

const AdminStaffRegistration = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [currentType, setCurrentType] = useState(null);
  const [currentSection, setCurrentSection] = useState(0);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const registerTypes = {
    doctor: {
      title: 'Doctor Registration',
      subtitle: 'Create a clinical staff profile',
      sections: {
        'Personal Information': [
          { name: 'firstName', label: 'First Name', type: 'text', required: true },
          { name: 'lastName', label: 'Last Name', type: 'text', required: true },
          { name: 'email', label: 'Email Address', type: 'email', required: true },
          { name: 'password', label: 'Password', type: 'password', required: true }
        ],
        'Professional Details': [
          { name: 'licenseNumber', label: 'Medical License Number', type: 'text', required: true },
          { name: 'specialization', label: 'Specialization', type: 'text', required: true },
          { name: 'phone', label: 'Phone Number', type: 'tel', required: true },
          { name: 'role', label: 'Role', type: 'hidden', value: 'DOCTOR' }
        ]
      }
    },
    pharmacist: {
      title: 'Pharmacist Registration',
      subtitle: 'Add pharmacy team member details',
      sections: {
        'Personal Information': [
          { name: 'firstName', label: 'First Name', type: 'text', required: true },
          { name: 'lastName', label: 'Last Name', type: 'text', required: true },
          { name: 'email', label: 'Email Address', type: 'email', required: true },
          { name: 'password', label: 'Password', type: 'password', required: true }
        ],
        'Professional Details': [
          { name: 'licenseNumber', label: 'Pharmacy License Number', type: 'text', required: true },
          { name: 'specialization', label: 'Specialization', type: 'text', required: false },
          { name: 'phone', label: 'Phone Number', type: 'tel', required: true },
          { name: 'role', label: 'Role', type: 'hidden', value: 'PHARMACIST' }
        ]
      }
    },
    laboratory: {
      title: 'Medical Laboratory Registration',
      subtitle: 'Add laboratory staff for test processing',
      sections: {
        'Personal Information': [
          { name: 'firstName', label: 'First Name', type: 'text', required: true },
          { name: 'lastName', label: 'Last Name', type: 'text', required: true },
          { name: 'email', label: 'Email Address', type: 'email', required: true },
          { name: 'password', label: 'Password', type: 'password', required: true }
        ],
        'Professional Details': [
          { name: 'licenseNumber', label: 'Laboratory License Number', type: 'text', required: false },
          { name: 'specialization', label: 'Specialization', type: 'text', required: false },
          { name: 'phone', label: 'Phone Number', type: 'tel', required: true },
          { name: 'role', label: 'Role', type: 'hidden', value: 'LABORATORY' }
        ]
      }
    },
    receptionist: {
      title: 'Receptionist Registration',
      subtitle: 'Create reception staff profile',
      sections: {
        'Personal Information': [
          { name: 'firstName', label: 'First Name', type: 'text', required: true },
          { name: 'lastName', label: 'Last Name', type: 'text', required: true },
          { name: 'email', label: 'Email Address', type: 'email', required: true },
          { name: 'password', label: 'Password', type: 'password', required: true }
        ],
        'Contact Details': [
          { name: 'phone', label: 'Phone Number', type: 'tel', required: true },
          { name: 'specialization', label: 'Department', type: 'text', required: false },
          { name: 'role', label: 'Role', type: 'hidden', value: 'RECEPTIONIST' },
          { name: 'licenseNumber', label: 'Staff ID', type: 'text', required: false }
        ]
      }
    },
    cashier: {
      title: 'Cashier Registration',
      subtitle: 'Add billing and payment staff',
      sections: {
        'Personal Information': [
          { name: 'firstName', label: 'First Name', type: 'text', required: true },
          { name: 'lastName', label: 'Last Name', type: 'text', required: true },
          { name: 'email', label: 'Email Address', type: 'email', required: true },
          { name: 'password', label: 'Password', type: 'password', required: true }
        ],
        'Employment Details': [
          { name: 'phone', label: 'Phone Number', type: 'tel', required: true },
          { name: 'licenseNumber', label: 'Staff ID', type: 'text', required: false },
          { name: 'specialization', label: 'Department', type: 'text', required: false },
          { name: 'role', label: 'Role', type: 'hidden', value: 'CASHIER' }
        ]
      }
    }
  };

  const openRegistration = (type) => {
    setCurrentType(type);
    setCurrentSection(0);
    setFormData({});
    setMessage('');
    setError('');
  };

  const goBackToLanding = () => {
    setCurrentType(null);
    setCurrentSection(0);
    setFormData({});
  };

  const handleFieldChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const nextSection = () => {
    if (currentType) {
      const sectionKeys = Object.keys(registerTypes[currentType].sections);
      if (currentSection < sectionKeys.length - 1) {
        setCurrentSection(currentSection + 1);
      }
    }
  };

  const previousSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const submitData = { ...formData };
      const fields = Object.values(registerTypes[currentType].sections).flat();
      const roleField = fields.find((field) => field.name === 'role');
      submitData.role = roleField?.value || 'RECEPTIONIST';

      const response = await api.post('/auth/register', submitData);
      if (response.data.success) {
        setMessage(`${registerTypes[currentType].title} created successfully!`);
        setTimeout(() => {
          goBackToLanding();
        }, 2000);
      } else {
        setError(response.data.message || 'Unable to create account');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to create account');
    } finally {
      setLoading(false);
    }
  };

  if (currentType === null) {
    return (
      <div className="admin-staff-reg">
        <header className="moh-header">
          <div className="moh-header-top">
            <div className="moh-emblems">
              <div className="moh-emblem">
                <div>
                  <small>UNITED REPUBLIC OF TANZANIA</small>
                  <strong>MINISTRY OF HEALTH</strong>
                </div>
              </div>
              <span className="moh-divider">|</span>
              <div className="moh-emblem">
                <div>
                  <small>HEALTH FACILITY</small>
                  <strong>KAZIMILI CARE</strong>
                </div>
              </div>
            </div>
            <span className="moh-version">v2.0</span>
          </div>
          <div className="moh-header-bottom">
            <div className="moh-title">
              <h1>Staff Registration Center</h1>
              <p>Choose the registration type you want to create</p>
            </div>
            <div className="moh-actions">
              <button onClick={() => navigate('/dashboard')} className="moh-btn moh-btn-outline">Dashboard</button>
              <AccountMenu onLogout={handleLogout} />
            </div>
          </div>
        </header>

        <main className="register-landing">
          <section className="register-hero">
            <div className="hero-content">
              <span className="hero-badge">STAFF REGISTRATION</span>
              <h1>Register new <span>Hospital Staff</span></h1>
              <p>Select the appropriate staff type below to begin the registration process</p>
            </div>
          </section>

          <section className="register-grid">
            <div className="register-choice" onClick={() => openRegistration('doctor')}>
              <div className="choice-icon">DR</div>
              <strong>Doctor Registration</strong>
              <small>Create a clinical staff profile</small>
              <span className="choice-arrow">Open</span>
            </div>
            <div className="register-choice" onClick={() => openRegistration('pharmacist')}>
              <div className="choice-icon">PH</div>
              <strong>Pharmacist Registration</strong>
              <small>Add pharmacy team member</small>
              <span className="choice-arrow">Open</span>
            </div>
            <div className="register-choice" onClick={() => openRegistration('laboratory')}>
              <div className="choice-icon">LAB</div>
              <strong>Medical Laboratory Registration</strong>
              <small>Add laboratory staff</small>
              <span className="choice-arrow">Open</span>
            </div>
            <div className="register-choice" onClick={() => openRegistration('receptionist')}>
              <div className="choice-icon">RC</div>
              <strong>Receptionist Registration</strong>
              <small>Create reception staff profile</small>
              <span className="choice-arrow">Open</span>
            </div>
            <div className="register-choice" onClick={() => openRegistration('cashier')}>
              <div className="choice-icon">CS</div>
              <strong>Cashier Registration</strong>
              <small>Add billing and payment staff</small>
              <span className="choice-arrow">Open</span>
            </div>
          </section>
        </main>

        <style>{`
          .admin-staff-reg {
            min-height: 100vh;
            background: #f0f4f8;
            font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif;
          }
          .moh-header {
            background: #ffffff;
            border-bottom: 4px solid #ed1c24;
            box-shadow: 0 2px 12px rgba(0,0,0,0.08);
          }
          .moh-header-top {
            background: #1a1a2e;
            color: #ffffff;
            padding: 12px 40px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 16px;
          }
          .moh-emblems {
            display: flex;
            align-items: center;
            gap: 24px;
            flex-wrap: wrap;
          }
          .moh-emblem { display: flex; align-items: center; gap: 14px; }
          .moh-emblem small { display: block; font-size: 10px; opacity: 0.8; text-transform: uppercase; letter-spacing: 1px; }
          .moh-emblem strong { font-size: 16px; letter-spacing: 0.5px; }
          .moh-divider { opacity: 0.3; font-size: 24px; }
          .moh-version { background: rgba(255,255,255,0.1); padding: 4px 14px; border-radius: 20px; font-size: 12px; font-weight: 600; }
          .moh-header-bottom { padding: 16px 40px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; }
          .moh-title h1 { font-size: 24px; font-weight: 700; color: #1a1a2e; margin: 0; }
          .moh-title p { font-size: 14px; color: #6b7a8a; margin: 2px 0 0; }
          .moh-actions { display: flex; gap: 12px; flex-wrap: wrap; }
          .moh-btn {
            padding: 10px 20px;
            border: none;
            border-radius: 6px;
            font-weight: 600;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.3s;
            display: inline-flex;
            align-items: center;
            gap: 8px;
          }
          .moh-btn-outline { background: transparent; color: #1a1a2e; border: 2px solid #e0e4e8; }
          .moh-btn-outline:hover { background: #f0f4f8; border-color: #ed1c24; }
          .register-landing { padding: 40px clamp(18px, 5vw, 80px); max-width: 1200px; margin: 0 auto; }
          .register-hero {
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            border-radius: 16px;
            padding: 50px 60px;
            margin-bottom: 40px;
          }
          .hero-content { position: relative; z-index: 1; }
          .hero-badge {
            display: inline-block;
            background: rgba(237, 28, 36, 0.2);
            color: #ff6b6b;
            padding: 6px 18px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 16px;
          }
          .register-hero h1 { font-size: clamp(32px, 4vw, 48px); font-weight: 800; color: #ffffff; margin-bottom: 12px; }
          .register-hero h1 span { color: #ed1c24; }
          .register-hero p { font-size: 18px; color: rgba(255,255,255,0.7); max-width: 500px; }
          .register-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; margin-top: -20px; }
          .register-choice {
            background: #ffffff;
            padding: 30px 24px;
            border-radius: 16px;
            text-decoration: none;
            color: #1a1a2e;
            box-shadow: 0 4px 20px rgba(0,0,0,0.06);
            border: 2px solid transparent;
            transition: all 0.3s;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            position: relative;
            cursor: pointer;
          }
          .register-choice:hover { border-color: #ed1c24; transform: translateY(-6px); box-shadow: 0 12px 40px rgba(0,0,0,0.12); }
          .choice-icon { font-size: 40px; margin-bottom: 12px; }
          .register-choice strong { font-size: 18px; font-weight: 700; margin-bottom: 4px; }
          .register-choice small { color: #6b7a8a; font-size: 14px; line-height: 1.5; margin-bottom: 8px; }
          .choice-arrow { position: absolute; right: 20px; bottom: 20px; font-size: 20px; color: #ed1c24; opacity: 0; transition: opacity 0.3s; }
          .register-choice:hover .choice-arrow { opacity: 1; }
          @media (max-width: 1024px) { .register-grid { grid-template-columns: repeat(2, 1fr); } }
          @media (max-width: 768px) { .register-grid { grid-template-columns: 1fr; } }
        `}</style>
      </div>
    );
  }

  const data = registerTypes[currentType];
  const sectionKeys = Object.keys(data.sections);
  const currentSectionKey = sectionKeys[currentSection];
  const fields = data.sections[currentSectionKey];
  const isFirst = currentSection === 0;
  const isLast = currentSection === sectionKeys.length - 1;

  return (
    <div className="admin-staff-reg">
      <header className="moh-header">
        <div className="moh-header-bottom">
          <div className="moh-title">
            <h1>{data.title}</h1>
            <p>{data.subtitle}</p>
          </div>
          <div className="moh-actions">
            <button onClick={goBackToLanding} className="moh-btn moh-btn-outline">Back</button>
          </div>
        </div>
      </header>

      <div className="section-progress">
        {sectionKeys.map((key, idx) => (
          <button key={idx} className={`progress-step ${idx === currentSection ? 'active' : ''} ${idx < currentSection ? 'completed' : ''}`}>
            <span className="step-number">{idx + 1}</span>
            <span className="step-label">{key}</span>
          </button>
        ))}
      </div>

      <main className="register-form-shell">
        {message && <div className="success-box">{message}</div>}
        {error && <div className="error-box">{error}</div>}

        <form onSubmit={handleSubmit} className="medical-form">
          <div className="form-section">
            <h2 className="section-title">{currentSectionKey}</h2>
            <p className="section-subtitle">Section {currentSection + 1} of {sectionKeys.length}</p>
            <div className="form-grid">
              {fields.map((field) => {
                if (field.type === 'hidden') {
                  return <input key={field.name} type="hidden" name={field.name} value={field.value} />;
                }
                return (
                  <div key={field.name} className="form-field">
                    <label className="field-label">
                      {field.label} {field.required && <span className="required">*</span>}
                    </label>
                    <input
                      type={field.type}
                      name={field.name}
                      value={formData[field.name] || ''}
                      onChange={(e) => handleFieldChange(field.name, e.target.value)}
                      required={field.required}
                      placeholder={`Enter ${field.label.toLowerCase()}`}
                    />
                  </div>
                );
              })}

              <div className="form-actions">
                <button type="button" className="moh-btn moh-btn-secondary" onClick={previousSection} disabled={isFirst}>
                  Previous
                </button>
                {isLast ? (
                  <button type="submit" className="moh-btn moh-btn-success" disabled={loading}>
                    {loading ? 'Creating...' : 'Complete Registration'}
                  </button>
                ) : (
                  <button type="button" className="moh-btn moh-btn-primary" onClick={nextSection}>
                    Next
                  </button>
                )}
              </div>
            </div>
          </div>
        </form>
      </main>

      <style>{`
        .section-progress {
          display: flex;
          justify-content: center;
          padding: 20px 40px;
          background: #ffffff;
          border-bottom: 1px solid #e8ecf0;
          gap: 10px;
          flex-wrap: wrap;
        }
        .progress-step {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 20px;
          cursor: pointer;
          color: #a0b0c0;
          border: none;
          background: transparent;
          border-radius: 30px;
          font-weight: 600;
          font-size: 13px;
          transition: all 0.3s;
        }
        .progress-step.active { color: #1a1a2e; }
        .progress-step .step-number {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #e8ecf0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 13px;
        }
        .progress-step.active .step-number { background: #ed1c24; color: #ffffff; }
        .progress-step.completed .step-number { background: #27ae60; color: #ffffff; }
        .register-form-shell {
          max-width: 900px;
          margin: 30px auto 50px;
          padding: 0 20px;
        }
        .medical-form {
          background: #ffffff;
          border-radius: 16px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.06);
        }
        .form-section { padding: 32px 36px; }
        .section-title { font-size: 22px; font-weight: 700; color: #1a1a2e; margin-bottom: 6px; }
        .section-subtitle { color: #6b7a8a; font-size: 14px; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid #f0f4f8; }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px 28px; }
        .form-field { display: flex; flex-direction: column; gap: 6px; }
        .field-label { font-weight: 600; font-size: 14px; color: #2c3e50; }
        .required { color: #ed1c24; }
        .form-field input {
          padding: 12px 16px;
          border: 2px solid #e0e4e8;
          border-radius: 8px;
          font-size: 15px;
          font-family: inherit;
          background: #fafbfc;
        }
        .form-field input:focus { outline: none; border-color: #ed1c24; background: #ffffff; }
        .form-actions { grid-column: 1 / -1; display: flex; justify-content: space-between; margin-top: 20px; padding-top: 20px; border-top: 2px solid #f0f4f8; gap: 12px; }
        .moh-btn-secondary { background: #e8ecf0; color: #1a1a2e; border: none; }
        .moh-btn-primary { background: #ed1c24; color: #ffffff; }
        .moh-btn-success { background: #27ae60; color: #ffffff; }
        .moh-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .success-box { background: #ecfdf3; color: #065f46; border: 1px solid #a7f3d0; padding: 12px 14px; border-radius: 10px; margin-bottom: 14px; }
        .error-box { background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; padding: 12px 14px; border-radius: 10px; margin-bottom: 14px; }
      `}</style>
    </div>
  );
};

export default AdminStaffRegistration;
