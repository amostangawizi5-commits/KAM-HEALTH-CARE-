import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../components/common/AppShell';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';

const staffRoles = [
  { value: 'RECEPTIONIST', label: 'Receptionist' },
  { value: 'CONSULTANT', label: 'Consultant' },
  { value: 'DOCTOR', label: 'Doctor' },
  { value: 'LABORATORY', label: 'Medical Laboratory' },
  { value: 'PHARMACIST', label: 'Pharmacist' },
  { value: 'CASHIER', label: 'Cashier' },
  { value: 'ADMIN', label: 'Admin' },
];

const emptyForm = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  role: 'RECEPTIONIST',
  phone: '',
  specialization: '',
  licenseNumber: '',
};

const AdminUserRegistration = () => {
  const { user, logout, login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [screenLocked, setScreenLocked] = useState(false);
  const [lockPassword, setLockPassword] = useState('');
  const [lockError, setLockError] = useState('');
  const [lockLoading, setLockLoading] = useState(false);

  const displayName = useMemo(() => {
    return [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.email || 'Admin';
  }, [user]);

  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'AD';

  const selectedRole = staffRoles.find((role) => role.value === formData.role) || staffRoles[0];

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await api.post('/auth/register', formData);
      if (response.data.success) {
        setMessage(`${selectedRole.label} account created for ${formData.email}.`);
        setFormData(emptyForm);
      } else {
        setError(response.data.message || 'Failed to create staff account.');
      }
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to create staff account.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setAccountMenuOpen(false);
    logout();
    navigate('/login', { replace: true });
  };

  const handleLockScreen = () => {
    setAccountMenuOpen(false);
    setLockPassword('');
    setLockError('');
    setScreenLocked(true);
  };

  const handleUnlockScreen = async (event) => {
    event.preventDefault();
    setLockError('');

    if (!user?.email) {
      setLockError('Unable to unlock here. Please logout and sign in again.');
      return;
    }

    if (!lockPassword.trim()) {
      setLockError('Enter your password to unlock the screen.');
      return;
    }

    setLockLoading(true);

    try {
      const result = await login(user.email, lockPassword);
      if (result.success) {
        setScreenLocked(false);
        setLockPassword('');
      } else {
        setLockError(result.message || 'Incorrect password. Try again.');
      }
    } catch (unlockError) {
      setLockError('Unable to unlock. Please try again.');
    } finally {
      setLockLoading(false);
    }
  };

  return (
    <AppShell
      title="Create Staff"
      subtitle="Admin Registration"
      headerVariant="ministry"
      bannerTitle="MINISTRY OF HEALTH"
      bannerSubtitle="KAZIMILICARE PHARMACY"
      bannerActions={
        <div className="staff-user-menu">
          {accountMenuOpen && (
            <button type="button" className="staff-account-menu-backdrop" aria-label="Close account menu" onClick={() => setAccountMenuOpen(false)} />
          )}
          <button type="button" className="staff-menu-button" aria-label="Open account actions" aria-haspopup="menu" aria-expanded={accountMenuOpen} onClick={() => setAccountMenuOpen((value) => !value)}>
            &#8942;
          </button>
          {accountMenuOpen && (
            <div className="staff-account-menu" role="menu">
              <button type="button" role="menuitem" onClick={handleLockScreen}>Lock screen</button>
              <button type="button" role="menuitem" className="danger" onClick={handleLogout}>Logout</button>
            </div>
          )}
        </div>
      }
      showAppHeader={false}
    >
      <div className="staff-portal-shell">
        <aside className="staff-portal-sidebar">
          <div className="staff-sidebar-brand">
            <span className="staff-brand-mark">KC</span>
            <strong>KazimiliCare</strong>
          </div>

          <div className="staff-profile-card">
            <div className="staff-profile-avatar">{initials}</div>
            <strong>{displayName}</strong>
            <span>Administrator</span>
          </div>

          <nav className="staff-sidebar-nav">
            <button type="button" className="staff-sidebar-link" onClick={() => navigate('/dashboard')}>Dashboard</button>
            <button type="button" className="staff-sidebar-link is-active">Create Staff</button>
          </nav>

          <div className="staff-sidebar-footer">
            <span>KazimiliCare v1.0.0</span>
          </div>
        </aside>

        <main className="staff-portal-main">
          <header className="staff-toolbar">
            <button type="button" className="staff-icon-button" aria-label="Back to dashboard" onClick={() => navigate('/dashboard')}>
              &#8249;
            </button>
            <div className="staff-toolbar-title">
              <strong>Create Staff Account</strong>
              <span>{selectedRole.label}</span>
            </div>
          </header>

          <div className="staff-portal-content">
            <div className="staff-breadcrumb">
              <span>Home</span>
              <span>&gt;</span>
              <strong>Create Staff</strong>
            </div>

            <div className="staff-content-grid">
              <nav className="staff-section-rail">
                <span className="is-active">Personal</span>
                <span>Access Role</span>
                <span>Professional</span>
              </nav>

              <section className="staff-panel">
                <div className="staff-panel-title">
                  <div>
                    <h1>Create Staff Account</h1>
                    <p>Register a system user and assign access to the correct working desk.</p>
                  </div>
                  <button type="button" onClick={() => navigate('/dashboard')}>Back</button>
                </div>

                {message && <div className="staff-alert success">{message}</div>}
                {error && <div className="staff-alert error">{error}</div>}

                <form className="staff-form" onSubmit={handleSubmit}>
                  <label>
                    First Name
                    <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required />
                  </label>
                  <label>
                    Last Name
                    <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required />
                  </label>
                  <label>
                    Email
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                  </label>
                  <label>
                    Password
                    <input type="password" name="password" value={formData.password} onChange={handleChange} minLength="6" required />
                  </label>
                  <label>
                    Role
                    <select name="role" value={formData.role} onChange={handleChange} required>
                      {staffRoles.map((role) => (
                        <option key={role.value} value={role.value}>{role.label}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Phone
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} />
                  </label>
                  <label>
                    Specialization / Department
                    <input type="text" name="specialization" value={formData.specialization} onChange={handleChange} />
                  </label>
                  <label>
                    License Number / Staff ID
                    <input type="text" name="licenseNumber" value={formData.licenseNumber} onChange={handleChange} />
                  </label>

                  <div className="staff-form-actions">
                    <button type="button" className="secondary" onClick={() => setFormData(emptyForm)}>Clear</button>
                    <button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Account'}</button>
                  </div>
                </form>
              </section>
            </div>
          </div>
        </main>
      </div>

      {screenLocked && (
        <div className="staff-lock-screen" role="dialog" aria-modal="true" aria-labelledby="staff-lock-title">
          <form className="staff-lock-panel" onSubmit={handleUnlockScreen}>
            <div className="staff-lock-avatar">{initials}</div>
            <span className="staff-lock-kicker">Screen locked</span>
            <h2 id="staff-lock-title">Staff registration locked</h2>
            <label htmlFor="staff-lock-password">Password</label>
            <input id="staff-lock-password" type="password" value={lockPassword} onChange={(event) => setLockPassword(event.target.value)} autoComplete="current-password" autoFocus />
            {lockError && <div className="staff-lock-error" role="alert">{lockError}</div>}
            <button type="submit" className="staff-lock-primary" disabled={lockLoading}>{lockLoading ? 'Unlocking...' : 'Unlock screen'}</button>
            <button type="button" className="staff-lock-secondary" onClick={handleLogout}>Logout instead</button>
          </form>
        </div>
      )}

      <style>{`
        .staff-portal-shell { min-height: calc(100vh - 113px); display: flex; gap: 24px; padding: 20px 22px; background: #eef7f1; color: #214334; }
        .staff-portal-sidebar { width: 224px; min-height: calc(100vh - 153px); flex-shrink: 0; overflow: hidden; display: flex; flex-direction: column; background: #ffffff; border: 1px solid #d8e2ef; border-radius: 14px; box-shadow: 0 8px 20px rgba(42, 70, 111, 0.08); }
        .staff-sidebar-brand { min-height: 48px; display: flex; align-items: center; gap: 10px; padding: 10px 16px; background: #198754; color: #ffffff; font-weight: 800; }
        .staff-brand-mark { width: 22px; height: 22px; display: grid; place-items: center; border-radius: 50%; background: #ffffff; color: #198754; font-size: 10px; font-weight: 900; }
        .staff-profile-card { padding: 18px 16px 16px; text-align: center; border-bottom: 1px solid #dbe5f1; }
        .staff-profile-avatar, .staff-lock-avatar { width: 76px; height: 76px; display: grid; place-items: center; margin: -2px auto 10px; border: 5px solid #ffffff; border-radius: 50%; background: #198754; color: #ffffff; box-shadow: 0 0 0 1px #cbd8e9; font-size: 22px; font-weight: 900; }
        .staff-profile-card strong, .staff-profile-card span { display: block; }
        .staff-profile-card strong { color: #214334; font-size: 14px; line-height: 1.25; }
        .staff-profile-card span { margin-top: 4px; color: #198754; font-size: 12px; font-weight: 700; }
        .staff-sidebar-nav { flex: 1; display: grid; align-content: start; gap: 4px; padding: 14px 12px; }
        .staff-sidebar-link { min-height: 36px; width: 100%; border: 0; border-radius: 8px; padding: 0 12px; background: transparent; color: #2d5a43; font: inherit; font-size: 14px; font-weight: 600; text-align: left; cursor: pointer; }
        .staff-sidebar-link:hover, .staff-sidebar-link.is-active { background: #e7f4ed; color: #146c43; }
        .staff-sidebar-footer { padding: 12px 16px; border-top: 1px solid #dbe5f1; color: #2d5a43; font-size: 11px; font-weight: 700; }
        .staff-portal-main { min-width: 0; flex: 1; }
        .staff-toolbar { min-height: 56px; display: flex; align-items: center; gap: 14px; padding: 8px 22px; background: #ffffff; border: 1px solid #d8e2ef; border-radius: 14px; box-shadow: 0 4px 12px rgba(42, 70, 111, 0.08); }
        .staff-icon-button { width: 34px; height: 34px; display: grid; place-items: center; border: 1px solid #d4dfec; border-radius: 9px; background: #f8fbff; color: #198754; font: inherit; font-size: 26px; font-weight: 800; cursor: pointer; }
        .staff-toolbar-title strong, .staff-toolbar-title span { display: block; }
        .staff-toolbar-title strong { color: #214334; font-size: 15px; }
        .staff-toolbar-title span { color: #91a5c2; font-size: 12px; font-weight: 700; }
        .staff-portal-content { width: min(100%, 1120px); margin: 28px auto 0; }
        .staff-breadcrumb { display: flex; align-items: center; gap: 8px; margin: 0 0 24px; color: #9badc8; font-size: 14px; font-weight: 600; }
        .staff-breadcrumb strong { color: #214334; }
        .staff-content-grid { display: grid; grid-template-columns: 180px minmax(0, 1fr); gap: 40px; align-items: start; }
        .staff-section-rail { position: sticky; top: 20px; display: grid; gap: 18px; padding: 4px 0 4px 18px; border-left: 1px solid #cfdaea; }
        .staff-section-rail span { position: relative; color: #9badc8; font-size: 14px; font-weight: 600; }
        .staff-section-rail span::before { content: ''; position: absolute; left: -22px; top: 50%; width: 8px; height: 8px; border-radius: 50%; background: transparent; transform: translateY(-50%); }
        .staff-section-rail span.is-active { color: #214334; font-weight: 800; }
        .staff-section-rail span.is-active::before { background: #198754; }
        .staff-panel { border: 1px solid #d8e2ef; border-radius: 14px; background: #ffffff; padding: 28px 32px; color: #214334; }
        .staff-panel-title { display: flex; align-items: flex-start; justify-content: space-between; gap: 18px; margin-bottom: 20px; }
        .staff-panel-title h1 { margin: 0; color: #214334; font-size: clamp(24px, 3vw, 34px); letter-spacing: 0; }
        .staff-panel-title p { margin: 6px 0 0; color: #6d7f76; }
        .staff-panel-title button, .staff-form button, .staff-lock-primary { min-height: 42px; border: 1px solid #198754; border-radius: 10px; background: #198754; color: #ffffff; padding: 0 16px; font: inherit; font-size: 14px; font-weight: 900; cursor: pointer; }
        .staff-form { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
        .staff-form label { display: grid; gap: 7px; color: #214334; font-size: 13px; font-weight: 900; }
        .staff-form input, .staff-form select, .staff-lock-panel input { width: 100%; min-height: 42px; border: 1px solid #d5dfec; border-radius: 10px; background: #ffffff; color: #214334; padding: 10px 12px; font: inherit; outline: none; }
        .staff-form input:focus, .staff-form select:focus, .staff-lock-panel input:focus { border-color: #198754; box-shadow: 0 0 0 3px rgba(25, 135, 84, 0.14); }
        .staff-form-actions { grid-column: 1 / -1; display: flex; justify-content: flex-end; gap: 10px; margin-top: 4px; }
        .staff-form button.secondary, .staff-lock-secondary { border-color: #b7c9e7; background: #ffffff; color: #198754; }
        .staff-form button:disabled, .staff-lock-primary:disabled { opacity: 0.7; cursor: progress; }
        .staff-alert { border-radius: 10px; padding: 12px 14px; margin-bottom: 14px; font-size: 14px; font-weight: 800; }
        .staff-alert.success { border: 1px solid #bfe4ce; background: #e7f4ed; color: #146c43; }
        .staff-alert.error { border: 1px solid #f4b8b2; background: #fff1f0; color: #912018; }
        .staff-user-menu { position: relative; z-index: 65; }
        .staff-menu-button { width: 34px; height: 34px; display: grid; place-items: center; border: 1px solid #b7c9e7; border-radius: 8px; background: #ffffff; color: #198754; font: inherit; font-size: 22px; line-height: 1; font-weight: 800; cursor: pointer; }
        .staff-menu-button:hover, .staff-menu-button[aria-expanded='true'] { background: #e7f4ed; border-color: #198754; }
        .staff-account-menu-backdrop { position: fixed; inset: 0; border: 0; background: transparent; z-index: 55; cursor: default; }
        .staff-account-menu { position: absolute; top: calc(100% + 10px); right: 0; z-index: 70; width: 190px; padding: 8px; border: 1px solid #d8e2ef; border-radius: 10px; background: #ffffff; box-shadow: 0 16px 36px rgba(42, 70, 111, 0.16); }
        .staff-account-menu button { width: 100%; min-height: 40px; border: 0; border-radius: 8px; background: transparent; color: #214334; padding: 0 10px; font: inherit; font-size: 13px; font-weight: 800; text-align: left; cursor: pointer; }
        .staff-account-menu button:hover { background: #e7f4ed; color: #146c43; }
        .staff-account-menu button.danger { color: #b42318; }
        .staff-lock-screen { position: fixed; inset: 0; z-index: 2000; display: grid; place-items: center; padding: 20px; background: rgba(18, 50, 61, 0.72); backdrop-filter: blur(8px); }
        .staff-lock-panel { width: min(100%, 400px); display: grid; gap: 14px; padding: 28px; border: 1px solid #d8e2ef; border-radius: 14px; background: #ffffff; color: #214334; box-shadow: 0 24px 60px rgba(18, 50, 61, 0.32); }
        .staff-lock-avatar { margin: 0; width: 64px; height: 64px; font-size: 20px; }
        .staff-lock-kicker { color: #198754; font-size: 12px; font-weight: 900; text-transform: uppercase; }
        .staff-lock-panel h2 { margin: -8px 0 4px; color: #214334; font-size: 24px; line-height: 1.2; letter-spacing: 0; }
        .staff-lock-panel label { color: #214334; font-size: 13px; font-weight: 800; }
        .staff-lock-error { border: 1px solid #f4b8b2; border-radius: 10px; background: #fff1f0; color: #912018; padding: 10px 12px; font-size: 13px; font-weight: 700; }
        .staff-lock-secondary { min-height: 42px; border-radius: 10px; font: inherit; font-size: 14px; font-weight: 900; cursor: pointer; }
        @media (max-width: 1050px) {
          .staff-portal-shell { flex-direction: column; }
          .staff-portal-sidebar { width: 100%; min-height: 0; }
          .staff-sidebar-nav { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .staff-content-grid { grid-template-columns: 1fr; gap: 20px; }
          .staff-section-rail { position: static; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px 18px; }
        }
        @media (max-width: 720px) {
          .staff-portal-shell { padding: 14px; }
          .staff-panel, .staff-toolbar { padding: 20px; }
          .staff-panel-title, .staff-form-actions { align-items: stretch; flex-direction: column; }
          .staff-form, .staff-section-rail { grid-template-columns: 1fr; }
        }
      `}</style>
    </AppShell>
  );
};

export default AdminUserRegistration;
