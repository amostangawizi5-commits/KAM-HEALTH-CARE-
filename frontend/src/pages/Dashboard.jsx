import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../components/common/AppShell';
import { useAuth } from '../hooks/useAuth';
import api, { adminService } from '../services/api';

const roleHome = {
  RECEPTIONIST: '/reception',
  CONSULTANT: '/consultant',
  DOCTOR: '/doctor',
  LABORATORY: '/laboratory',
  PHARMACIST: '/pharmacy',
  CASHIER: '/cashier',
};

const quickActions = [
  { label: 'Register Patient', route: '/register', roles: ['ADMIN', 'RECEPTIONIST'] },
  { label: 'Create Staff User', route: '/admin/register-user', roles: ['ADMIN'] },
  { label: 'Reception Queue', route: '/reception', roles: ['ADMIN', 'RECEPTIONIST'] },
  { label: 'Consultant Desk', route: '/consultant', roles: ['ADMIN', 'CONSULTANT'] },
  { label: 'Doctor Desk', route: '/doctor', roles: ['ADMIN', 'DOCTOR'] },
  { label: 'Laboratory Desk', route: '/laboratory', roles: ['ADMIN', 'LABORATORY'] },
  { label: 'Pharmacy Desk', route: '/pharmacy', roles: ['ADMIN', 'PHARMACIST'] },
  { label: 'Cashier Desk', route: '/cashier', roles: ['ADMIN', 'CASHIER'] },
];

const sidebarItems = [
  { id: 'overview', label: 'Dashboard' },
  { id: 'staff', label: 'Staff Accounts' },
  { id: 'treated', label: 'Treated Patients' },
  { id: 'payments', label: 'Payments' },
  { id: 'usage', label: 'Medicine Usage' },
  { id: 'store', label: 'Medicine Store' },
  { id: 'account', label: 'My Account' },
];

const sectionSubmenus = {
  overview: ['System Summary', 'Quick Access', 'Alerts'],
  staff: ['Active Staff', 'Blocked Accounts', 'Remove Staff'],
  treated: ['Completed Care', 'Visit Status', 'Patient Review'],
  payments: ['Paid Amounts', 'Bills', 'Receipts'],
  usage: ['Dispensed Items', 'Prescribed Items', 'Quantities'],
  store: ['Registered Medicines', 'Stock Levels', 'Expiry'],
  account: ['Profile', 'Password'],
};

const emptyOverview = {
  summary: {
    totalPatients: 0,
    treatedPatients: 0,
    activeStaff: 0,
    blockedStaff: 0,
    totalPaid: 0,
    medicineUsed: 0,
    medicinesInStore: 0,
    lowStockCount: 0,
  },
  users: [],
  treatedPatients: [],
  payments: [],
  bills: [],
  medicineUsage: [],
  medicines: [],
};

const formatMoney = (amount) => `TSh ${Number(amount || 0).toLocaleString()}`;

const formatDate = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const buildName = (user) => [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.email || 'Unknown';

const Dashboard = () => {
  const { user, logout, login, refreshUser } = useAuth();
  const navigate = useNavigate();
  const role = String(user?.role || '').trim().toUpperCase();
  const isAdmin = role === 'ADMIN';

  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [screenLocked, setScreenLocked] = useState(false);
  const [lockPassword, setLockPassword] = useState('');
  const [lockError, setLockError] = useState('');
  const [lockLoading, setLockLoading] = useState(false);
  const [overview, setOverview] = useState(emptyOverview);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [accountMessage, setAccountMessage] = useState({ type: '', text: '' });
  const [accountSaving, setAccountSaving] = useState(false);
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (!user) return;
    setProfileForm({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phone: user.phone || '',
    });
  }, [user]);

  const displayUser = useMemo(() => ({
    ...user,
    name: buildName(user) || 'Admin',
  }), [user]);

  const displayInitials = displayUser.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'AD';

  const visibleActions = useMemo(() => {
    return quickActions.filter((action) => action.roles.includes(role));
  }, [role]);

  const activeSectionTitle = sidebarItems.find((item) => item.id === activeSection)?.label || 'Dashboard';
  const activeSubmenuItems = sectionSubmenus[activeSection] || [];

  const loadAdminOverview = async () => {
    if (!isAdmin) return;
    setLoading(true);
    setError('');

    try {
      const response = await adminService.getOverview();
      setOverview({ ...emptyOverview, ...(response.data.data || {}) });
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load admin dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminOverview();
  }, [isAdmin]);

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

  const handleToggleUser = async (staff) => {
    const nextActive = !staff.isActive;
    const action = nextActive ? 'unblock' : 'block';

    if (staff.id === user?.id) {
      setActionMessage('You cannot block your own account.');
      return;
    }

    const confirmed = window.confirm(`Do you want to ${action} ${buildName(staff)}?`);
    if (!confirmed) return;

    try {
      setActionMessage('');
      await adminService.updateUser(staff.id, { isActive: nextActive });
      setActionMessage(`${buildName(staff)} has been ${nextActive ? 'unblocked' : 'blocked'}.`);
      loadAdminOverview();
    } catch (requestError) {
      setActionMessage(requestError.response?.data?.message || 'Unable to update staff account.');
    }
  };

  const handleDeleteUser = async (staff) => {
    if (staff.id === user?.id) {
      setActionMessage('You cannot remove your own account.');
      return;
    }

    const confirmed = window.confirm(`Remove ${buildName(staff)} completely from the system?`);
    if (!confirmed) return;

    try {
      setActionMessage('');
      await adminService.deleteUser(staff.id);
      setActionMessage(`${buildName(staff)} has been removed.`);
      loadAdminOverview();
    } catch (requestError) {
      setActionMessage(requestError.response?.data?.message || 'Unable to remove staff account.');
    }
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    setAccountMessage({ type: '', text: '' });
    setAccountSaving(true);

    try {
      await api.put('/auth/me', {
        firstName: profileForm.firstName.trim(),
        lastName: profileForm.lastName.trim(),
        email: profileForm.email.trim(),
        phone: profileForm.phone.trim(),
      });
      await refreshUser();
      setAccountMessage({ type: 'success', text: 'Profile updated successfully.' });
    } catch (requestError) {
      setAccountMessage({
        type: 'error',
        text: requestError.response?.data?.message || 'Failed to update profile.',
      });
    } finally {
      setAccountSaving(false);
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    setAccountMessage({ type: '', text: '' });

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setAccountMessage({ type: 'error', text: 'New password and confirmation do not match.' });
      return;
    }

    setAccountSaving(true);

    try {
      await api.post('/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setAccountMessage({ type: 'success', text: 'Password changed successfully.' });
    } catch (requestError) {
      setAccountMessage({
        type: 'error',
        text: requestError.response?.data?.message || 'Failed to change password.',
      });
    } finally {
      setAccountSaving(false);
    }
  };

  const renderStatus = (value, tone = '') => (
    <span className={`admin-status ${tone || String(value || '').toLowerCase()}`}>
      {value || '-'}
    </span>
  );

  const renderOverview = () => {
    const stats = [
      { label: 'Total Patients', value: overview.summary.totalPatients },
      { label: 'Treated Patients', value: overview.summary.treatedPatients },
      { label: 'Active Staff', value: overview.summary.activeStaff },
      { label: 'Blocked Staff', value: overview.summary.blockedStaff },
      { label: 'Paid Amount', value: formatMoney(overview.summary.totalPaid) },
      { label: 'Medicine Used', value: overview.summary.medicineUsed },
      { label: 'Store Medicines', value: overview.summary.medicinesInStore },
      { label: 'Low Stock', value: overview.summary.lowStockCount },
    ];

    return (
      <>
        <section className="admin-hero">
          <div>
            <span>Admin control</span>
            <h1>Administrator Dashboard</h1>
            <p>Manage staff access, monitor treated patients, review payments, medicine usage, and registered store stock.</p>
          </div>
          <button type="button" onClick={() => navigate('/admin/register-user')}>Create Staff</button>
        </section>

        <section className="admin-stat-grid">
          {stats.map((stat) => (
            <article key={stat.label}>
              <span>{stat.label}</span>
              <strong>{stat.value}</strong>
            </article>
          ))}
        </section>

        <section className="admin-panel">
          <div className="admin-panel-title">
            <h2>Quick Access</h2>
            <span>{visibleActions.length} modules</span>
          </div>
          <div className="admin-action-grid">
            {visibleActions.map((action) => (
              <button type="button" key={action.label} onClick={() => navigate(action.route)}>
                {action.label}
              </button>
            ))}
          </div>
        </section>
      </>
    );
  };

  const renderStaff = () => (
    <section className="admin-panel">
      <div className="admin-panel-title">
        <h2>Staff Accounts</h2>
        <button type="button" onClick={() => navigate('/admin/register-user')}>Create Staff</button>
      </div>
      {actionMessage && <div className="admin-alert">{actionMessage}</div>}
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Last Login</th>
              <th className="align-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {overview.users.map((staff) => (
              <tr key={staff.id}>
                <td className="strong">{buildName(staff)}</td>
                <td>{staff.email}</td>
                <td>{staff.role}</td>
                <td>{staff.phone || '-'}</td>
                <td>{renderStatus(staff.isActive ? 'Active' : 'Blocked', staff.isActive ? 'active' : 'blocked')}</td>
                <td>{formatDate(staff.lastLogin)}</td>
                <td className="align-end">
                  <div className="admin-row-actions">
                    <button type="button" disabled={staff.id === user?.id} onClick={() => handleToggleUser(staff)}>
                      {staff.isActive ? 'Block' : 'Unblock'}
                    </button>
                    <button type="button" className="danger" disabled={staff.id === user?.id} onClick={() => handleDeleteUser(staff)}>
                      Remove
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {overview.users.length === 0 && (
              <tr><td colSpan="7">No staff accounts found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );

  const renderTreatedPatients = () => (
    <section className="admin-panel">
      <div className="admin-panel-title">
        <h2>Treated Patients</h2>
        <span>{overview.treatedPatients.length} records</span>
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Patient No</th>
              <th>Patient</th>
              <th>Visit Reason</th>
              <th>Status</th>
              <th>Visit Date</th>
              <th>Updated</th>
            </tr>
          </thead>
          <tbody>
            {overview.treatedPatients.map((visit) => (
              <tr key={visit.id}>
                <td className="strong">{visit.patientNo}</td>
                <td>{visit.patientName}</td>
                <td>{visit.visitReason || '-'}</td>
                <td>{renderStatus(visit.status)}</td>
                <td>{formatDate(visit.visitDate)}</td>
                <td>{formatDate(visit.updatedAt)}</td>
              </tr>
            ))}
            {overview.treatedPatients.length === 0 && (
              <tr><td colSpan="6">No treated patients found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );

  const renderPayments = () => (
    <section className="admin-panel">
      <div className="admin-panel-title">
        <h2>Payments</h2>
        <span>{formatMoney(overview.summary.totalPaid)} collected</span>
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Receipt</th>
              <th>Patient</th>
              <th>Invoice</th>
              <th>Method</th>
              <th>Amount</th>
              <th>Received By</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {overview.payments.map((payment) => (
              <tr key={payment.id}>
                <td className="strong">{payment.receiptNo}</td>
                <td>{payment.patientName}</td>
                <td>{payment.invoiceNo}</td>
                <td>{payment.method}</td>
                <td className="strong">{formatMoney(payment.amount)}</td>
                <td>{payment.receivedBy}</td>
                <td>{formatDate(payment.paidAt)}</td>
              </tr>
            ))}
            {overview.payments.length === 0 && (
              <tr><td colSpan="7">No payments recorded yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );

  const renderMedicineUsage = () => (
    <section className="admin-panel">
      <div className="admin-panel-title">
        <h2>Medicine Usage</h2>
        <span>{overview.summary.medicineUsed} units dispensed</span>
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Medicine</th>
              <th>Patient</th>
              <th>Dosage</th>
              <th>Frequency</th>
              <th>Prescribed</th>
              <th>Dispensed</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {overview.medicineUsage.map((item) => (
              <tr key={item.id}>
                <td className="strong">{item.medicineName}</td>
                <td>{item.patientName}</td>
                <td>{item.dosage}</td>
                <td>{item.frequency}</td>
                <td>{item.prescribedQuantity}</td>
                <td>{item.dispensedQuantity}</td>
                <td>{renderStatus(item.status)}</td>
              </tr>
            ))}
            {overview.medicineUsage.length === 0 && (
              <tr><td colSpan="7">No medicine usage found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );

  const renderStore = () => (
    <section className="admin-panel">
      <div className="admin-panel-title">
        <h2>Medicine Store</h2>
        <span>{overview.medicines.length} registered medicines</span>
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Medicine</th>
              <th>Generic</th>
              <th>Category</th>
              <th>Stock</th>
              <th>Reorder</th>
              <th>Unit Price</th>
              <th>Expiry</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {overview.medicines.map((medicine) => {
              const lowStock = Number(medicine.currentStock) <= Number(medicine.reorderLevel);
              return (
                <tr key={medicine.id}>
                  <td className="strong">{medicine.name}</td>
                  <td>{medicine.genericName || '-'}</td>
                  <td>{medicine.category || '-'}</td>
                  <td>{medicine.currentStock}</td>
                  <td>{medicine.reorderLevel}</td>
                  <td>{formatMoney(medicine.unitPrice)}</td>
                  <td>{formatDate(medicine.expiryDate)}</td>
                  <td>{renderStatus(lowStock ? 'Low Stock' : 'Available', lowStock ? 'blocked' : 'active')}</td>
                </tr>
              );
            })}
            {overview.medicines.length === 0 && (
              <tr><td colSpan="8">No medicines registered in store.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );

  const renderAccount = () => (
    <section className="admin-panel">
      <div className="admin-panel-title">
        <h2>My Account</h2>
        <span>Profile and password</span>
      </div>
      {accountMessage.text && (
        <div className={`admin-alert ${accountMessage.type}`}>
          {accountMessage.text}
        </div>
      )}
      <div className="admin-form-grid">
        <form onSubmit={handleProfileSubmit}>
          <h3>Profile</h3>
          <label>First Name<input value={profileForm.firstName} onChange={(event) => setProfileForm({ ...profileForm, firstName: event.target.value })} required /></label>
          <label>Last Name<input value={profileForm.lastName} onChange={(event) => setProfileForm({ ...profileForm, lastName: event.target.value })} required /></label>
          <label>Email<input type="email" value={profileForm.email} onChange={(event) => setProfileForm({ ...profileForm, email: event.target.value })} required /></label>
          <label>Phone<input value={profileForm.phone} onChange={(event) => setProfileForm({ ...profileForm, phone: event.target.value })} /></label>
          <button type="submit" disabled={accountSaving}>{accountSaving ? 'Saving...' : 'Save Profile'}</button>
        </form>
        <form onSubmit={handlePasswordSubmit}>
          <h3>Password</h3>
          <label>Current Password<input type="password" value={passwordForm.currentPassword} onChange={(event) => setPasswordForm({ ...passwordForm, currentPassword: event.target.value })} required /></label>
          <label>New Password<input type="password" value={passwordForm.newPassword} onChange={(event) => setPasswordForm({ ...passwordForm, newPassword: event.target.value })} minLength="6" required /></label>
          <label>Confirm Password<input type="password" value={passwordForm.confirmPassword} onChange={(event) => setPasswordForm({ ...passwordForm, confirmPassword: event.target.value })} minLength="6" required /></label>
          <button type="submit" disabled={accountSaving}>{accountSaving ? 'Saving...' : 'Change Password'}</button>
        </form>
      </div>
    </section>
  );

  const sectionContent = {
    overview: renderOverview,
    staff: renderStaff,
    treated: renderTreatedPatients,
    payments: renderPayments,
    usage: renderMedicineUsage,
    store: renderStore,
    account: renderAccount,
  };

  if (!isAdmin) {
    return (
      <AppShell title="Dashboard" subtitle={role || 'User'}>
        <main className="standard-dashboard">
          <section className="admin-hero">
            <div>
              <span>{role || 'Care Team'}</span>
              <h1>Welcome, {user?.firstName || 'Care Team'}</h1>
              <p>Open your working desk to continue patient workflow tasks.</p>
            </div>
            {roleHome[role] && <button type="button" onClick={() => navigate(roleHome[role])}>Open My Desk</button>}
          </section>
          <section className="admin-action-grid">
            {visibleActions.map((action) => (
              <button type="button" key={action.label} onClick={() => navigate(action.route)}>{action.label}</button>
            ))}
          </section>
        </main>
        <style>{`
          .standard-dashboard { padding: 24px; display: grid; gap: 18px; }
          .admin-hero, .admin-action-grid button { border: 1px solid #d8e2ef; border-radius: 14px; background: #ffffff; }
          .admin-hero { padding: 24px; display: flex; justify-content: space-between; gap: 18px; }
          .admin-hero span { color: #198754; font-size: 12px; font-weight: 900; text-transform: uppercase; }
          .admin-hero h1 { margin: 6px 0; color: #214334; letter-spacing: 0; }
          .admin-hero p { margin: 0; color: #6d7f76; }
          .admin-hero button, .admin-action-grid button { min-height: 42px; padding: 0 16px; color: #ffffff; background: #198754; border: 0; border-radius: 10px; font-weight: 900; cursor: pointer; }
          .admin-action-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; }
        `}</style>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Admin Dashboard"
      subtitle="System Administration"
      headerVariant="ministry"
      bannerTitle="MINISTRY OF HEALTH"
      bannerSubtitle="KAZIMILICARE PHARMACY"
      bannerActions={
        <div className="admin-user-menu">
          {accountMenuOpen && (
            <button type="button" className="admin-account-menu-backdrop" aria-label="Close account menu" onClick={() => setAccountMenuOpen(false)} />
          )}
          <button type="button" className="admin-menu-button" aria-label="Open account actions" aria-haspopup="menu" aria-expanded={accountMenuOpen} onClick={() => setAccountMenuOpen((value) => !value)}>
            &#8942;
          </button>
          {accountMenuOpen && (
            <div className="admin-account-menu" role="menu">
              <button type="button" role="menuitem" onClick={handleLockScreen}>Lock screen</button>
              <button type="button" role="menuitem" className="danger" onClick={handleLogout}>Logout</button>
            </div>
          )}
        </div>
      }
      showAppHeader={false}
    >
      <div className={`admin-portal-shell ${sidebarOpen ? '' : 'is-sidebar-hidden'}`}>
        <aside className="admin-portal-sidebar">
          <div className="admin-sidebar-brand">
            <span className="admin-brand-mark">KC</span>
            <strong>KazimiliCare</strong>
          </div>

          <div className="admin-profile-card">
            <div className="admin-profile-avatar">{displayInitials}</div>
            <strong>{displayUser.name}</strong>
            <span>Administrator</span>
          </div>

          <nav className="admin-sidebar-nav">
            {sidebarItems.map((item) => (
              <button type="button" key={item.id} className={`admin-sidebar-link ${activeSection === item.id ? 'is-active' : ''}`} onClick={() => setActiveSection(item.id)}>
                <span>{item.label}</span>
                {item.id === 'staff' && overview.summary.blockedStaff > 0 && <span className="admin-nav-badge">{overview.summary.blockedStaff}</span>}
                {item.id === 'store' && overview.summary.lowStockCount > 0 && <span className="admin-nav-badge">{overview.summary.lowStockCount}</span>}
              </button>
            ))}
          </nav>

          <div className="admin-sidebar-footer">
            <span>KazimiliCare v1.0.0</span>
          </div>
        </aside>

        <main className="admin-portal-main">
          <header className="admin-toolbar">
            <button type="button" className="admin-icon-button" aria-label="Open menu" aria-expanded={sidebarOpen} onClick={() => setSidebarOpen((value) => !value)}>
              &#9776;
            </button>
            <div className="admin-toolbar-title">
              <strong>{activeSectionTitle}</strong>
              <span>System control panel</span>
            </div>
            <div className="admin-toolbar-spacer" />
            <button type="button" className="admin-refresh-button" onClick={loadAdminOverview} disabled={loading}>
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </header>

          <div className="admin-portal-content">
            <div className="admin-breadcrumb">
              <span>Home</span>
              <span>&gt;</span>
              <strong>{activeSectionTitle}</strong>
            </div>

            {error && <div className="admin-alert error">{error}</div>}

            <div className="admin-content-grid">
              <nav className="admin-section-rail">
                {activeSubmenuItems.map((item, index) => (
                  <span key={`${activeSection}-${item}`} className={index === 0 ? 'is-active' : ''}>
                    {item}
                  </span>
                ))}
              </nav>
              <div className="admin-section-area">
                {sectionContent[activeSection]()}
              </div>
            </div>
          </div>
        </main>
      </div>

      {screenLocked && (
        <div className="admin-lock-screen" role="dialog" aria-modal="true" aria-labelledby="admin-lock-title">
          <form className="admin-lock-panel" onSubmit={handleUnlockScreen}>
            <div className="admin-lock-avatar">{displayInitials}</div>
            <span className="admin-lock-kicker">Screen locked</span>
            <h2 id="admin-lock-title">Admin dashboard locked</h2>
            <label htmlFor="admin-lock-password">Password</label>
            <input id="admin-lock-password" type="password" value={lockPassword} onChange={(event) => setLockPassword(event.target.value)} autoComplete="current-password" autoFocus />
            {lockError && <div className="admin-lock-error" role="alert">{lockError}</div>}
            <button type="submit" className="admin-lock-primary" disabled={lockLoading}>{lockLoading ? 'Unlocking...' : 'Unlock screen'}</button>
            <button type="button" className="admin-lock-secondary" onClick={handleLogout}>Logout instead</button>
          </form>
        </div>
      )}

      <style>{`
        .admin-portal-shell { min-height: calc(100vh - 113px); display: flex; gap: 24px; padding: 20px 22px; background: #eef7f1; color: #214334; }
        .admin-portal-sidebar { width: 224px; min-height: calc(100vh - 153px); flex-shrink: 0; overflow: hidden; display: flex; flex-direction: column; background: #ffffff; border: 1px solid #d8e2ef; border-radius: 14px; box-shadow: 0 8px 20px rgba(42, 70, 111, 0.08); }
        .admin-portal-shell.is-sidebar-hidden .admin-portal-sidebar { display: none; }
        .admin-sidebar-brand { min-height: 48px; display: flex; align-items: center; gap: 10px; padding: 10px 16px; background: #198754; color: #ffffff; font-weight: 800; }
        .admin-brand-mark { width: 22px; height: 22px; display: grid; place-items: center; border-radius: 50%; background: #ffffff; color: #198754; font-size: 10px; font-weight: 900; }
        .admin-profile-card { padding: 18px 16px 16px; text-align: center; border-bottom: 1px solid #dbe5f1; }
        .admin-profile-avatar, .admin-lock-avatar { width: 76px; height: 76px; display: grid; place-items: center; margin: -2px auto 10px; border: 5px solid #ffffff; border-radius: 50%; background: #198754; color: #ffffff; box-shadow: 0 0 0 1px #cbd8e9; font-size: 22px; font-weight: 900; }
        .admin-profile-card strong, .admin-profile-card span { display: block; }
        .admin-profile-card strong { color: #214334; font-size: 14px; line-height: 1.25; }
        .admin-profile-card span { margin-top: 4px; color: #198754; font-size: 12px; font-weight: 700; }
        .admin-sidebar-nav { flex: 1; display: grid; align-content: start; gap: 4px; padding: 14px 12px; }
        .admin-sidebar-link { min-height: 36px; width: 100%; border: 0; border-radius: 8px; display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 0 12px; background: transparent; color: #2d5a43; font: inherit; font-size: 14px; font-weight: 600; text-align: left; cursor: pointer; }
        .admin-sidebar-link:hover, .admin-sidebar-link.is-active { background: #e7f4ed; color: #146c43; }
        .admin-nav-badge { min-width: 24px; min-height: 22px; display: inline-grid; place-items: center; border-radius: 999px; background: #198754; color: #ffffff; font-size: 12px; font-weight: 800; }
        .admin-sidebar-footer { padding: 12px 16px; border-top: 1px solid #dbe5f1; color: #2d5a43; font-size: 11px; font-weight: 700; }
        .admin-portal-main { min-width: 0; flex: 1; display: flex; flex-direction: column; }
        .admin-toolbar { min-height: 56px; display: flex; align-items: center; gap: 14px; padding: 8px 22px; background: #ffffff; border: 1px solid #d8e2ef; border-radius: 14px; box-shadow: 0 4px 12px rgba(42, 70, 111, 0.08); }
        .admin-icon-button { width: 34px; height: 34px; display: grid; place-items: center; border: 1px solid #d4dfec; border-radius: 9px; background: #f8fbff; color: #198754; font: inherit; font-weight: 800; cursor: pointer; }
        .admin-toolbar-title strong, .admin-toolbar-title span { display: block; }
        .admin-toolbar-title strong { color: #214334; font-size: 15px; }
        .admin-toolbar-title span { color: #91a5c2; font-size: 12px; font-weight: 700; }
        .admin-toolbar-spacer { flex: 1; }
        .admin-refresh-button, .admin-hero button, .admin-panel-title button, .admin-form-grid button, .admin-lock-primary { min-height: 42px; border: 1px solid #198754; border-radius: 10px; background: #198754; color: #ffffff; padding: 0 16px; font: inherit; font-size: 14px; font-weight: 900; cursor: pointer; }
        .admin-refresh-button:disabled, .admin-form-grid button:disabled, .admin-lock-primary:disabled { opacity: 0.7; cursor: progress; }
        .admin-portal-content { width: min(100%, 1320px); margin: 28px auto 0; }
        .admin-breadcrumb { display: flex; align-items: center; gap: 8px; margin: 0 0 24px; color: #9badc8; font-size: 14px; font-weight: 600; }
        .admin-breadcrumb strong { color: #214334; }
        .admin-content-grid { display: grid; grid-template-columns: 180px minmax(0, 1fr); gap: 40px; align-items: start; }
        .admin-section-rail { position: sticky; top: 20px; display: grid; gap: 18px; padding: 4px 0 4px 18px; border-left: 1px solid #cfdaea; }
        .admin-section-rail span { position: relative; color: #9badc8; font-size: 14px; font-weight: 600; }
        .admin-section-rail span::before { content: ''; position: absolute; left: -22px; top: 50%; width: 8px; height: 8px; border-radius: 50%; background: transparent; transform: translateY(-50%); }
        .admin-section-rail span.is-active { color: #214334; font-weight: 800; }
        .admin-section-rail span.is-active::before { background: #198754; }
        .admin-section-area { min-width: 0; display: grid; gap: 24px; }
        .admin-hero, .admin-panel { border: 1px solid #d8e2ef; border-radius: 14px; background: #ffffff; color: #214334; box-shadow: none; }
        .admin-hero { display: flex; align-items: center; justify-content: space-between; gap: 18px; padding: 28px 32px; }
        .admin-hero span, .admin-panel-title span { color: #198754; font-size: 12px; font-weight: 900; text-transform: uppercase; }
        .admin-hero h1 { margin: 6px 0; color: #214334; font-size: clamp(26px, 4vw, 38px); letter-spacing: 0; }
        .admin-hero p { max-width: 720px; margin: 0; color: #6d7f76; line-height: 1.55; }
        .admin-stat-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; }
        .admin-stat-grid article { min-height: 118px; display: grid; align-content: space-between; border: 1px solid #d8e2ef; border-radius: 14px; background: #ffffff; padding: 18px; border-top: 4px solid #198754; }
        .admin-stat-grid span { color: #6d7f76; font-size: 13px; font-weight: 900; }
        .admin-stat-grid strong { color: #214334; font-size: 28px; letter-spacing: 0; }
        .admin-panel { padding: 24px; }
        .admin-panel-title { display: flex; align-items: center; justify-content: space-between; gap: 14px; margin-bottom: 16px; }
        .admin-panel-title h2 { margin: 0; color: #214334; font-size: 22px; letter-spacing: 0; }
        .admin-action-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 12px; }
        .admin-action-grid button { min-height: 58px; border: 1px solid #d8e2ef; border-radius: 10px; background: #f8fbff; color: #2d5a43; font: inherit; font-weight: 900; cursor: pointer; }
        .admin-action-grid button:hover { border-color: #198754; background: #e7f4ed; color: #146c43; }
        .admin-table-wrap { width: 100%; overflow-x: auto; border: 1px solid #e2e9f3; border-radius: 12px; }
        .admin-table { width: 100%; min-width: 860px; border-collapse: collapse; color: #214334; }
        .admin-table th, .admin-table td { padding: 14px 16px; border-bottom: 1px solid #e2e9f3; text-align: left; vertical-align: middle; font-size: 14px; }
        .admin-table th { background: #f5f8fc; color: #8da0bd; text-transform: uppercase; font-size: 12px; font-weight: 900; letter-spacing: 0; }
        .admin-table tr:last-child td { border-bottom: 0; }
        .strong { color: #214334; font-weight: 900; }
        .align-end { text-align: right !important; }
        .admin-row-actions { display: flex; justify-content: flex-end; gap: 8px; }
        .admin-row-actions button { min-height: 34px; border: 1px solid #b7c9e7; border-radius: 8px; background: #ffffff; color: #198754; padding: 0 12px; font: inherit; font-size: 13px; font-weight: 900; cursor: pointer; }
        .admin-row-actions button:hover { border-color: #198754; background: #e7f4ed; }
        .admin-row-actions button.danger, .admin-account-menu button.danger { color: #b42318; }
        .admin-row-actions button.danger:hover { border-color: #b42318; background: #fff1f0; }
        .admin-row-actions button:disabled { opacity: 0.45; cursor: not-allowed; }
        .admin-status { display: inline-flex; align-items: center; min-height: 26px; border-radius: 999px; padding: 0 10px; background: #f5f8fc; color: #2d5a43; font-size: 12px; font-weight: 900; text-transform: uppercase; }
        .admin-status.active, .admin-status.available, .admin-status.dispensed, .admin-status.completed { background: #e7f4ed; color: #146c43; }
        .admin-status.blocked, .admin-status.pending, .admin-status.prescribed, .admin-status.waiting_pharmacy, .admin-status.payment_pending { background: #fff7ed; color: #b45309; }
        .admin-alert { border: 1px solid #d8e2ef; border-radius: 10px; background: #f5f8fc; color: #214334; padding: 12px 14px; margin-bottom: 14px; font-size: 14px; font-weight: 800; }
        .admin-alert.success { border-color: #bfe4ce; background: #e7f4ed; color: #146c43; }
        .admin-alert.error { border-color: #f4b8b2; background: #fff1f0; color: #912018; }
        .admin-form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
        .admin-form-grid form { display: grid; gap: 12px; border: 1px solid #e2e9f3; border-radius: 12px; background: #f8fbff; padding: 18px; }
        .admin-form-grid h3 { margin: 0; color: #214334; font-size: 18px; }
        .admin-form-grid label { display: grid; gap: 7px; color: #214334; font-size: 13px; font-weight: 900; }
        .admin-form-grid input, .admin-lock-panel input { width: 100%; min-height: 42px; border: 1px solid #d5dfec; border-radius: 10px; background: #ffffff; color: #214334; padding: 10px 12px; font: inherit; outline: none; }
        .admin-form-grid input:focus, .admin-lock-panel input:focus { border-color: #198754; box-shadow: 0 0 0 3px rgba(25, 135, 84, 0.14); }
        .admin-user-menu { position: relative; z-index: 65; }
        .admin-menu-button { width: 34px; height: 34px; display: grid; place-items: center; border: 1px solid #b7c9e7; border-radius: 8px; background: #ffffff; color: #198754; font: inherit; font-size: 22px; line-height: 1; font-weight: 800; cursor: pointer; }
        .admin-menu-button:hover, .admin-menu-button[aria-expanded='true'] { background: #e7f4ed; border-color: #198754; }
        .admin-account-menu-backdrop { position: fixed; inset: 0; border: 0; background: transparent; z-index: 55; cursor: default; }
        .admin-account-menu { position: absolute; top: calc(100% + 10px); right: 0; z-index: 70; width: 190px; padding: 8px; border: 1px solid #d8e2ef; border-radius: 10px; background: #ffffff; box-shadow: 0 16px 36px rgba(42, 70, 111, 0.16); }
        .admin-account-menu button { width: 100%; min-height: 40px; display: flex; align-items: center; border: 0; border-radius: 8px; background: transparent; color: #214334; padding: 0 10px; font: inherit; font-size: 13px; font-weight: 800; text-align: left; cursor: pointer; }
        .admin-account-menu button:hover { background: #e7f4ed; color: #146c43; }
        .admin-lock-screen { position: fixed; inset: 0; z-index: 2000; display: grid; place-items: center; padding: 20px; background: rgba(18, 50, 61, 0.72); backdrop-filter: blur(8px); }
        .admin-lock-panel { width: min(100%, 400px); display: grid; gap: 14px; padding: 28px; border: 1px solid #d8e2ef; border-radius: 14px; background: #ffffff; color: #214334; box-shadow: 0 24px 60px rgba(18, 50, 61, 0.32); }
        .admin-lock-avatar { margin: 0; width: 64px; height: 64px; font-size: 20px; }
        .admin-lock-kicker { color: #198754; font-size: 12px; font-weight: 900; text-transform: uppercase; }
        .admin-lock-panel h2 { margin: -8px 0 4px; color: #214334; font-size: 24px; line-height: 1.2; letter-spacing: 0; }
        .admin-lock-panel label { color: #214334; font-size: 13px; font-weight: 800; }
        .admin-lock-error { border: 1px solid #f4b8b2; border-radius: 10px; background: #fff1f0; color: #912018; padding: 10px 12px; font-size: 13px; font-weight: 700; }
        .admin-lock-secondary { min-height: 42px; border: 1px solid #b7c9e7; border-radius: 10px; background: #ffffff; color: #198754; font: inherit; font-size: 14px; font-weight: 900; cursor: pointer; }
        @media (max-width: 1050px) {
          .admin-portal-shell { flex-direction: column; }
          .admin-portal-sidebar { width: 100%; min-height: 0; }
          .admin-sidebar-nav { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .admin-content-grid { grid-template-columns: 1fr; gap: 20px; }
          .admin-section-rail { position: static; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px 18px; }
          .admin-stat-grid, .admin-form-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        @media (max-width: 720px) {
          .admin-portal-shell { padding: 14px; }
          .admin-toolbar, .admin-hero, .admin-panel-title { align-items: flex-start; flex-direction: column; }
          .admin-toolbar-spacer { display: none; }
          .admin-sidebar-nav, .admin-section-rail, .admin-stat-grid, .admin-form-grid { grid-template-columns: 1fr; }
          .admin-panel, .admin-hero { padding: 20px; }
        }
      `}</style>
    </AppShell>
  );
};

export default Dashboard;
