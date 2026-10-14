import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../components/common/AppShell';
import {
  AppointmentsList,
  DashboardOverview,
  Header,
  NotificationsPanel,
  PatientRegistration,
  PatientsList,
  QueueTable,
  Sidebar,
} from '../components/reception';
import { useAuth } from '../hooks/useAuth';
import { patientService, visitService } from '../services/api';

const todayIso = () => new Date().toISOString().split('T')[0];

const statusMeta = {
  WAITING: { label: 'Waiting at Reception', color: '#15803d' },
  CONSULTANT: { label: 'With Consultant', color: '#166534' },
  DOCTOR: { label: 'With Doctor', color: '#14532d' },
  COMPLETED: { label: 'Completed', color: '#15803d' },
};

const initialPatients = [
  {
    id: 'P001',
    patientId: 'P001',
    name: 'John Doe',
    phone: '0712 345 678',
    gender: 'Male',
    queueNumber: 'Q-001',
    reason: 'Headache and fever',
    registrationDate: todayIso(),
    status: 'WAITING',
    statusColor: statusMeta.WAITING.color,
  },
  {
    id: 'P002',
    patientId: 'P002',
    name: 'Jane Smith',
    phone: '0755 100 200',
    gender: 'Female',
    queueNumber: 'Q-002',
    reason: 'Chest pain',
    registrationDate: todayIso(),
    status: 'WAITING',
    statusColor: statusMeta.WAITING.color,
  },
  {
    id: 'P003',
    patientId: 'P003',
    name: 'Bob Wilson',
    phone: '0688 320 118',
    gender: 'Male',
    queueNumber: 'Q-003',
    reason: 'Cough and cold',
    registrationDate: todayIso(),
    status: 'CONSULTANT',
    statusColor: statusMeta.CONSULTANT.color,
    sentAt: '10:18 AM',
  },
];

const initialAppointments = [
  { id: 'A001', time: '09:30 AM', patientName: 'Mary Johnson', doctor: 'Dr. Michael', date: todayIso(), status: 'SCHEDULED' },
  { id: 'A002', time: '11:00 AM', patientName: 'Peter Parker', doctor: 'Dr. Sarah', date: todayIso(), status: 'CHECKED_IN' },
  { id: 'A003', time: '02:00 PM', patientName: 'Amina Hassan', doctor: 'Dr. Jane', date: todayIso(), status: 'SCHEDULED' },
];

const initialNotifications = [
  { id: 1, type: 'info', message: 'Two patients are waiting at reception.', time: 'Now', read: false },
  { id: 2, type: 'success', message: 'Peter Parker checked in for today appointment.', time: '11:00 AM', read: true },
  { id: 3, type: 'warning', message: 'Jane Smith is marked for priority review.', time: '10:42 AM', read: false },
];

const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return '';

  const birthDate = new Date(dateOfBirth);
  if (Number.isNaN(birthDate.getTime())) return '';

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDelta = today.getMonth() - birthDate.getMonth();

  if (monthDelta < 0 || (monthDelta === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1;
  }

  return age;
};

const ageToDateOfBirth = (age) => {
  const parsedAge = Number(age);
  if (!Number.isFinite(parsedAge) || parsedAge < 0) return '';

  return `${new Date().getFullYear() - parsedAge}-01-01`;
};

const normalizeVisitStatus = (status) => {
  if (['REGISTERED'].includes(status)) return 'WAITING';
  if (['WAITING_CONSULTANT', 'UNDER_CONSULTATION'].includes(status)) return 'CONSULTANT';
  if (['WAITING_DOCTOR', 'UNDER_DOCTOR', 'WAITING_DOCTOR_REVIEW'].includes(status)) return 'DOCTOR';
  if (['COMPLETED', 'CANCELLED'].includes(status)) return 'COMPLETED';
  return 'DOCTOR';
};

const visitToQueuePatient = (visit) => {
  const patient = visit.Patient || visit.patient || {};
  const status = normalizeVisitStatus(visit.status);

  return {
    id: visit.id,
    visitId: visit.id,
    patientRecordId: patient.id,
    patientId: patient.patientNo,
    name: [patient.firstName, patient.lastName].filter(Boolean).join(' ') || 'Unknown Patient',
    phone: patient.phone || '',
    gender: patient.gender || '',
    age: calculateAge(patient.dateOfBirth),
    queueNumber: visit.queueNumber ? `Q-${String(visit.queueNumber).padStart(3, '0')}` : 'Q-000',
    reason: visit.visitReason || 'General visit',
    registrationDate: visit.visitDate ? visit.visitDate.split('T')[0] : todayIso(),
    status,
    rawStatus: visit.status,
    statusColor: (statusMeta[status] || statusMeta.WAITING).color,
  };
};

const ReceptionistDashboard = () => {
  const { user, logout, login } = useAuth();
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState('dashboard');
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState(initialAppointments);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [loadingQueue, setLoadingQueue] = useState(false);
  const [queueError, setQueueError] = useState('');
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [screenLocked, setScreenLocked] = useState(false);
  const [lockPassword, setLockPassword] = useState('');
  const [lockError, setLockError] = useState('');
  const [lockLoading, setLockLoading] = useState(false);

  const displayUser = useMemo(() => ({
    ...user,
    name: [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.name || 'Receptionist',
  }), [user]);

  const queue = useMemo(
    () => patients.filter((patient) => patient.status !== 'COMPLETED'),
    [patients]
  );

  const waitingCount = queue.filter((patient) => patient.status === 'WAITING').length;
  const nextQueueNumber = `Q-${String(queue.length + 1).padStart(3, '0')}`;

  const loadActiveVisits = async () => {
    setLoadingQueue(true);
    setQueueError('');

    try {
      const response = await visitService.getActive();
      setPatients((response.data.data || []).map(visitToQueuePatient));
    } catch (error) {
      setQueueError(error?.response?.data?.message || 'Unable to load patient queue.');
    } finally {
      setLoadingQueue(false);
    }
  };

  useEffect(() => {
    loadActiveVisits();
  }, []);

  const addNotification = (notification) => {
    setNotifications((prev) => [
      {
        id: Date.now(),
        read: false,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        ...notification,
      },
      ...prev,
    ]);
  };

  const handleRegisterComplete = async (patient) => {
    const patientResponse = await patientService.create({
      firstName: patient.firstName.trim(),
      lastName: patient.lastName.trim(),
      dateOfBirth: ageToDateOfBirth(patient.age),
      gender: String(patient.gender || 'OTHER').toUpperCase(),
      phone: patient.phone,
      address: patient.address,
    });

    const queueNumber = Number(String(patient.queueNumber || nextQueueNumber).replace(/\D/g, '')) || queue.length + 1;
    const visitResponse = await visitService.create({
      patientId: patientResponse.data.data.id,
      visitReason: patient.reason || 'General visit',
      queueNumber,
      registeredBy: user?.id,
      status: 'REGISTERED',
    });

    const registeredPatient = visitToQueuePatient(visitResponse.data.data);

    setPatients((prev) => {
      const exists = prev.some((item) => item.id === registeredPatient.id);
      return exists ? prev : [registeredPatient, ...prev];
    });
    addNotification({
      type: 'success',
      message: `${registeredPatient.name} registered and added to ${registeredPatient.queueNumber}.`,
    });

    return registeredPatient;
  };

  const handleSendToConsultant = async (patientId) => {
    const patient = patients.find((item) => item.id === patientId);
    if (!patient) return;
    if (patient.status !== 'WAITING') {
      setQueueError(`${patient.name} is already ${statusMeta[patient.status]?.label || patient.status}.`);
      return;
    }

    try {
      setQueueError('');
      const sentAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const response = await visitService.sendToConsultant(patient.visitId || patient.id);
      const updatedPatient = visitToQueuePatient(response.data.data);

      setPatients((prev) => prev.map((item) => (
        item.id === patientId
          ? { ...updatedPatient, sentAt }
          : item
      )));
      addNotification({
        type: 'info',
        message: `${patient.name} sent to consultant at ${sentAt}.`,
      });
      setActivePage('tracking');
      loadActiveVisits();
    } catch (error) {
      setQueueError(error?.response?.data?.message || 'Unable to send patient to consultant.');
      throw error;
    }
  };

  const handleAppointmentCheckIn = (appointmentId) => {
    const appointment = appointments.find((item) => item.id === appointmentId);
    if (!appointment || appointment.status === 'CHECKED_IN') return;

    setAppointments((prev) => prev.map((item) => (
      item.id === appointmentId ? { ...item, status: 'CHECKED_IN' } : item
    )));
    addNotification({
      type: 'success',
      message: `${appointment.patientName} checked in for ${appointment.time}.`,
    });
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })));
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
    } catch (error) {
      setLockError('Unable to unlock. Please try again.');
    } finally {
      setLockLoading(false);
    }
  };

  const renderRequests = () => {
    const sentRequests = patients.filter((patient) => patient.status === 'CONSULTANT');

    return (
      <section className="card border-0 shadow-sm">
        <div className="card-body">
        <div className="d-flex align-items-start justify-content-between flex-wrap gap-3 mb-3">
          <div>
            <h2 className="h4 fw-bold mb-1">Send Patient Request</h2>
            <p className="text-secondary mb-0">Move waiting patients from reception to the consultant queue.</p>
          </div>
          <span className="badge text-bg-success rounded-pill">{waitingCount} waiting</span>
        </div>
        {queueError && <div className="alert alert-warning">{queueError}</div>}
        <div className="row g-3">
          <div className="col-12 col-lg-6">
            <h3 className="h5 fw-bold mb-3">Waiting Patients</h3>
            <div className="list-group">
              {queue.filter((patient) => patient.status === 'WAITING').map((patient) => (
                <article key={patient.id} className="list-group-item d-flex align-items-center justify-content-between gap-3">
                  <div>
                    <strong className="d-block">{patient.name}</strong>
                    <span className="small text-secondary">{patient.queueNumber} - {patient.reason}</span>
                  </div>
                  <button type="button" className="btn btn-sm btn-success" onClick={() => handleSendToConsultant(patient.id).catch(() => {})}>
                    Send
                  </button>
                </article>
              ))}
              {loadingQueue && <p className="text-center text-secondary border rounded p-3 mb-0">Loading queue...</p>}
              {!loadingQueue && waitingCount === 0 && <p className="text-center text-secondary border border-dashed rounded p-3 mb-0">No waiting patients to send.</p>}
            </div>
          </div>
          <div className="col-12 col-lg-6">
            <h3 className="h5 fw-bold mb-3">Sent Requests</h3>
            <div className="list-group">
              {sentRequests.map((patient) => (
                <article key={`${patient.id}-${patient.sentAt || 'sent'}`} className="list-group-item">
                  <div>
                    <strong className="d-block">{patient.name}</strong>
                    <span className="small text-secondary">With Consultant{patient.sentAt ? ` since ${patient.sentAt}` : ''}</span>
                  </div>
                </article>
              ))}
              {sentRequests.length === 0 && <p className="text-center text-secondary border rounded p-3 mb-0">No requests sent yet.</p>}
            </div>
          </div>
        </div>
        </div>
      </section>
    );
  };

  const renderTracking = () => (
    <section className="card border-0 shadow-sm">
      <div className="card-body">
      <div className="d-flex align-items-start justify-content-between flex-wrap gap-3 mb-3">
        <div>
          <h2 className="h4 fw-bold mb-1">Patient Tracking</h2>
          <p className="text-secondary mb-0">Follow every active patient from reception through consultation.</p>
        </div>
        <span className="badge text-bg-success rounded-pill">{queue.length} active</span>
      </div>
      <div className="row g-3">
        {queue.map((patient) => {
          const meta = statusMeta[patient.status] || statusMeta.WAITING;
          return (
            <div className="col-12 col-md-6 col-xl-4" key={patient.id}>
            <article className="card h-100 border-0 shadow-sm border-top border-4" style={{ borderTopColor: meta.color }}>
              <div className="card-body">
              <strong className="d-block mb-1">{patient.name}</strong>
              <span className="badge text-bg-success mb-2">{meta.label}</span>
              <small className="d-block text-secondary">{patient.queueNumber} - {patient.reason}</small>
              </div>
            </article>
            </div>
          );
        })}
        {queue.length === 0 && <p className="text-center text-secondary border rounded p-3 mb-0">No active patients in the reception workflow.</p>}
      </div>
      </div>
    </section>
  );

  const renderContent = () => {
    switch (activePage) {
      case 'patients':
      case 'search':
        return <PatientsList patients={patients} onRegister={() => setActivePage('register')} />;
      case 'register':
        return (
          <PatientRegistration
            nextQueueNumber={nextQueueNumber}
            onCancel={() => setActivePage('dashboard')}
            onComplete={handleRegisterComplete}
            onSendToConsultant={handleSendToConsultant}
            onViewQueue={() => setActivePage('queue')}
          />
        );
      case 'queue':
        return (
          <>
            {queueError && <div className="alert alert-warning">{queueError}</div>}
            <QueueTable queue={queue} onSendToConsultant={handleSendToConsultant} loading={loadingQueue} />
          </>
        );
      case 'appointments':
        return <AppointmentsList appointments={appointments} onCheckIn={handleAppointmentCheckIn} />;
      case 'requests':
        return renderRequests();
      case 'tracking':
        return renderTracking();
      case 'notifications':
        return <NotificationsPanel notifications={notifications} onMarkAllRead={markAllNotificationsRead} />;
      case 'dashboard':
      default:
        return (
          <DashboardOverview
            patients={patients}
            queue={queue}
            appointments={appointments}
            onRegister={() => setActivePage('register')}
            onSearch={() => setActivePage('patients')}
          />
        );
    }
  };

  return (
    <AppShell
      title="Reception Desk"
      subtitle="Patient Flow Management"
      headerVariant="ministry"
      bannerTitle="MINISTRY OF HEALTH"
      bannerSubtitle="KAM MEDICAL SERVICE"
      bannerActions={
        <div className="reception-account-menu-wrap">
          {accountMenuOpen && (
            <button
              type="button"
              className="reception-account-menu-backdrop"
              aria-label="Close account menu"
              onClick={() => setAccountMenuOpen(false)}
            />
          )}

          <button
            type="button"
            className="reception-menu-button"
            aria-label="Open account actions"
            aria-haspopup="menu"
            aria-expanded={accountMenuOpen}
            onClick={() =>
              setAccountMenuOpen((value) => !value)
            }
          >
            &#8942;
          </button>

          {accountMenuOpen && (
            <div
              className="reception-account-menu"
              role="menu"
            >
              <button
                type="button"
                role="menuitem"
                onClick={handleLockScreen}
              >
                <span aria-hidden="true">&#128274;</span>
                Lock screen
              </button>

              <button
                type="button"
                role="menuitem"
                className="reception-menu-danger"
                onClick={handleLogout}
              >
                <span aria-hidden="true">&#9211;</span>
                Logout
              </button>
            </div>
          )}
        </div>
      }
      showAppHeader={false}
    >
      <div className="reception-portal-shell">
        <Sidebar
          activePage={activePage}
          notificationCount={notifications.filter((notification) => !notification.read).length}
          queueCount={waitingCount}
          setActivePage={setActivePage}
        />
        <main className="reception-portal-main">
          <Header
            notifications={notifications}
            setActivePage={setActivePage}
            user={displayUser}
          />
          <div className="reception-portal-content">
            {renderContent()}
          </div>
        </main>
      </div>

      {screenLocked && (
        <div
          className="reception-lock-screen"
          role="dialog"
          aria-modal="true"
          aria-labelledby="reception-lock-title"
        >
          <form
            className="reception-lock-panel"
            onSubmit={handleUnlockScreen}
          >
            <div className="reception-lock-avatar">
              RD
            </div>

            <span className="reception-lock-kicker">
              Screen locked
            </span>

            <h2 id="reception-lock-title">
              {displayUser.name}
            </h2>

            <label htmlFor="reception-lock-password">
              Password
            </label>

            <input
              id="reception-lock-password"
              type="password"
              className="form-control"
              value={lockPassword}
              onChange={(event) =>
                setLockPassword(event.target.value)
              }
              autoComplete="current-password"
              autoFocus
            />

            {lockError && (
              <div className="reception-lock-error" role="alert">
                {lockError}
              </div>
            )}

            <button
              type="submit"
              className="reception-lock-primary"
              disabled={lockLoading}
            >
              {lockLoading ? 'Unlocking...' : 'Unlock screen'}
            </button>

            <button
              type="button"
              className="reception-lock-secondary"
              onClick={handleLogout}
            >
              Logout instead
            </button>
          </form>
        </div>
      )}

      <style>{`
        .reception-account-menu-wrap {
          position: relative;
          z-index: 1300;
        }

        .reception-menu-button {
          width: 34px;
          height: 34px;
          display: grid;
          place-items: center;
          border: 1px solid #b7c9e7;
          border-radius: 8px;
          background: #ffffff;
          color: #198754;
          font: inherit;
          font-size: 22px;
          line-height: 1;
          font-weight: 800;
          cursor: pointer;
        }

        .reception-menu-button:hover,
        .reception-menu-button[aria-expanded='true'] {
          background: #e7f4ed;
          border-color: #198754;
        }

        .reception-account-menu-backdrop {
          position: fixed;
          inset: 0;
          border: 0;
          background: transparent;
          z-index: 1200;
          cursor: default;
        }

        .reception-account-menu {
          position: absolute;
          top: calc(100% + 10px);
          right: 0;
          z-index: 1300;
          width: 190px;
          padding: 8px;
          border: 1px solid #d8e2ef;
          border-radius: 10px;
          background: #ffffff;
          box-shadow: 0 16px 36px rgba(42, 70, 111, 0.16);
        }

        .reception-account-menu button {
          width: 100%;
          min-height: 40px;
          display: flex;
          align-items: center;
          gap: 10px;
          border: 0;
          border-radius: 8px;
          background: transparent;
          color: #214334;
          padding: 0 10px;
          font: inherit;
          font-size: 13px;
          font-weight: 800;
          text-align: left;
          cursor: pointer;
        }

        .reception-account-menu button:hover {
          background: #e7f4ed;
          color: #146c43;
        }

        .reception-account-menu .reception-menu-danger {
          color: #b42318;
        }

        .reception-account-menu .reception-menu-danger:hover {
          background: #fff1f0;
          color: #912018;
        }

        .reception-lock-screen {
          position: fixed;
          inset: 0;
          z-index: 2000;
          display: grid;
          place-items: center;
          padding: 20px;
          background: rgba(18, 50, 61, 0.72);
          backdrop-filter: blur(8px);
        }

        .reception-lock-panel {
          width: min(100%, 400px);
          display: grid;
          gap: 14px;
          padding: 28px;
          border: 1px solid #d8e2ef;
          border-radius: 14px;
          background: #ffffff;
          color: #214334;
          box-shadow: 0 24px 60px rgba(18, 50, 61, 0.32);
        }

        .reception-lock-avatar {
          width: 64px;
          height: 64px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: #198754;
          color: #ffffff;
          font-size: 20px;
          font-weight: 900;
        }

        .reception-lock-kicker {
          color: #198754;
          font-size: 12px;
          font-weight: 900;
          text-transform: uppercase;
        }

        .reception-lock-panel h2 {
          margin: -8px 0 4px;
          color: #214334;
          font-size: 24px;
          line-height: 1.2;
          letter-spacing: 0;
        }

        .reception-lock-panel label {
          color: #214334;
          font-size: 13px;
          font-weight: 800;
        }

        .reception-lock-panel .form-control {
          min-height: 44px;
          border-color: #d5dfec;
          border-radius: 10px;
        }

        .reception-lock-error {
          border: 1px solid #f4b8b2;
          border-radius: 10px;
          background: #fff1f0;
          color: #912018;
          padding: 10px 12px;
          font-size: 13px;
          font-weight: 700;
        }

        .reception-lock-primary,
        .reception-lock-secondary {
          min-height: 42px;
          border-radius: 10px;
          font: inherit;
          font-size: 14px;
          font-weight: 900;
          cursor: pointer;
        }

        .reception-lock-primary {
          border: 1px solid #198754;
          background: #198754;
          color: #ffffff;
        }

        .reception-lock-primary:disabled {
          opacity: 0.7;
          cursor: progress;
        }

        .reception-lock-secondary {
          border: 1px solid #b7c9e7;
          background: #ffffff;
          color: #198754;
        }

        .reception-portal-shell {
          min-height: calc(100vh - 113px);
          display: flex;
          gap: 24px;
          padding: 20px 22px;
          background: #eef7f1;
          color: #214334;
        }

        .reception-portal-sidebar {
          width: 224px;
          min-height: calc(100vh - 153px);
          flex-shrink: 0;
          overflow: visible;
          display: flex;
          flex-direction: column;
          background: #ffffff;
          border: 1px solid #d8e2ef;
          border-radius: 14px;
          box-shadow: 0 8px 20px rgba(42, 70, 111, 0.08);
        }

        .reception-sidebar-brand {
          min-height: 48px;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 16px;
          background: #198754;
          color: #ffffff;
          font-weight: 800;
        }

        .reception-brand-mark {
          width: 22px;
          height: 22px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: #ffffff;
          color: #198754;
          font-size: 10px;
          font-weight: 900;
        }

        .reception-profile-card {
          padding: 18px 16px 16px;
          text-align: center;
          border-bottom: 1px solid #dbe5f1;
        }

        .reception-profile-avatar {
          width: 76px;
          height: 76px;
          display: grid;
          place-items: center;
          margin: -2px auto 10px;
          border: 5px solid #ffffff;
          border-radius: 50%;
          background: #198754;
          color: #ffffff;
          box-shadow: 0 0 0 1px #cbd8e9;
          font-size: 22px;
          font-weight: 900;
        }

        .reception-profile-card strong,
        .reception-profile-card span {
          display: block;
        }

        .reception-profile-card strong {
          color: #214334;
          font-size: 14px;
          line-height: 1.25;
        }

        .reception-profile-card span {
          margin-top: 4px;
          color: #198754;
          font-size: 12px;
          font-weight: 700;
        }

        .reception-sidebar-nav {
          flex: 1;
          display: grid;
          align-content: start;
          gap: 4px;
          padding: 14px 12px;
        }

        .reception-menu-group {
          position: relative;
          display: grid;
          gap: 6px;
        }

        .reception-sidebar-link,
        .reception-sub-link {
          min-height: 36px;
          width: 100%;
          border: 0;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding: 0 12px;
          background: transparent;
          color: #2d5a43;
          font: inherit;
          font-size: 14px;
          font-weight: 600;
          text-align: left;
          cursor: pointer;
        }

        .reception-sub-menu {
          position: absolute;
          top: 0;
          left: calc(100% + 12px);
          z-index: 120;
          width: 190px;
          display: grid;
          gap: 6px;
          padding: 8px;
          border: 1px solid #d8e2ef;
          border-radius: 10px;
          background: #ffffff;
          box-shadow: 0 16px 36px rgba(42, 70, 111, 0.16);
        }

        .reception-sub-link {
          min-height: 32px;
          font-size: 13px;
        }

        .reception-sidebar-link:hover,
        .reception-sub-link:hover,
        .reception-sidebar-link.is-active,
        .reception-sub-link.is-active {
          background: #e7f4ed;
          color: #146c43;
        }

        .reception-nav-badge {
          min-width: 24px;
          min-height: 22px;
          display: inline-grid;
          place-items: center;
          border-radius: 999px;
          background: #198754;
          color: #ffffff;
          font-size: 12px;
          font-weight: 800;
        }

        .reception-sidebar-footer {
          padding: 12px 16px;
          border-top: 1px solid #dbe5f1;
          color: #2d5a43;
          font-size: 11px;
          font-weight: 700;
        }

        .reception-portal-main {
          min-width: 0;
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .reception-toolbar {
          position: relative;
          min-height: 56px;
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          gap: 14px;
          padding: 8px 22px;
          background: #ffffff;
          border: 1px solid #d8e2ef;
          border-radius: 14px;
          box-shadow: 0 4px 12px rgba(42, 70, 111, 0.08);
        }

        .reception-greeting {
          min-width: 0;
          text-align: center;
        }

        .reception-greeting h1 {
          margin: 0;
          color: #214334;
          font-size: 20px;
          line-height: 1.2;
          font-weight: 900;
          letter-spacing: 0;
        }

        .reception-greeting p {
          margin: 3px 0 0;
          color: #91a5c2;
          font-size: 12px;
          font-weight: 700;
        }

        .reception-toolbar-actions {
          display: flex;
          justify-content: flex-end;
        }

        .reception-notification-button {
          position: relative;
          min-height: 36px;
          border: 1px solid #b7c9e7;
          border-radius: 8px;
          background: #ffffff;
          color: #198754;
          padding: 0 12px;
          font: inherit;
          font-size: 13px;
          font-weight: 800;
          cursor: pointer;
        }

        .reception-notification-button:hover {
          background: #e7f4ed;
          border-color: #198754;
        }

        .reception-notification-count {
          position: absolute;
          top: -9px;
          right: -9px;
          min-width: 22px;
          min-height: 22px;
          display: grid;
          place-items: center;
          border: 2px solid #ffffff;
          border-radius: 999px;
          background: #dc3545;
          color: #ffffff;
          padding: 0 5px;
          font-size: 11px;
          font-weight: 900;
        }

        .reception-portal-content {
          width: min(100%, 1500px);
          margin: 28px auto 0;
        }

        .reception-portal-shell .table-responsive {
          width: 100%;
        }

        .reception-portal-shell .table {
          min-width: 980px;
        }

        .reception-portal-shell .card {
          padding: 0;
          border: 1px solid #d8e2ef !important;
          border-radius: 14px;
          box-shadow: none !important;
          color: #214334;
        }

        .reception-portal-shell .card-body {
          padding: 28px 32px;
        }

        .reception-portal-shell h1,
        .reception-portal-shell h2,
        .reception-portal-shell h3,
        .reception-portal-shell h4,
        .reception-portal-shell h5 {
          color: #214334;
          letter-spacing: 0;
        }

        .reception-portal-shell .text-secondary {
          color: #91a5c2 !important;
        }

        .reception-portal-shell .display-6 {
          color: #198754;
          font-size: 30px;
        }

        .reception-portal-shell .table > :not(caption) > * > * {
          padding: 14px 16px;
          border-bottom-color: #e2e9f3;
        }

        .reception-portal-shell thead,
        .reception-portal-shell .table-light {
          --bs-table-bg: #f5f8fc;
          --bs-table-color: #8da0bd;
          color: #8da0bd;
          text-transform: uppercase;
          font-size: 12px;
          letter-spacing: 0;
        }

        .reception-portal-shell .badge {
          border-radius: 999px;
          font-weight: 800;
        }

        .reception-portal-shell .text-bg-success,
        .reception-portal-shell .bg-success {
          background-color: #198754 !important;
          color: #ffffff !important;
        }

        .reception-portal-shell .btn-success {
          border-color: #198754;
          background: #198754;
          color: #ffffff;
        }

        .reception-portal-shell .btn-outline-success {
          border-color: #b7c9e7;
          color: #198754;
          background: #ffffff;
        }

        .reception-portal-shell .btn-outline-success:hover,
        .reception-portal-shell .btn-success:hover {
          border-color: #146c43;
          background: #146c43;
          color: #ffffff;
        }

        .reception-portal-shell .form-control,
        .reception-portal-shell .form-select {
          min-height: 42px;
          border-color: #d5dfec;
          border-radius: 10px;
          color: #214334;
        }

        @media (max-width: 1050px) {
          .reception-portal-shell {
            flex-direction: column;
          }

          .reception-portal-sidebar {
            width: 100%;
            min-height: 0;
          }

          .reception-sidebar-nav {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 720px) {
          .reception-portal-shell {
            padding: 14px;
          }

          .reception-toolbar {
            grid-template-columns: 1fr;
            padding: 12px;
          }

          .reception-toolbar-spacer {
            display: none;
          }

          .reception-toolbar-actions {
            justify-content: center;
          }

          .reception-sidebar-nav {
            grid-template-columns: 1fr;
          }

          .reception-sub-menu {
            position: static;
            width: 100%;
            box-shadow: none;
          }

          .reception-portal-shell .card-body {
            padding: 20px;
          }
        }
      `}</style>
    </AppShell>
  );
};

export default ReceptionistDashboard;
