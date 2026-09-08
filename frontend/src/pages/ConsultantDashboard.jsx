import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { io } from 'socket.io-client';
import AppShell from '../components/common/AppShell';
import { useAuth } from '../hooks/useAuth';
import { consultantService } from '../services/api';

const textDark = '#1a2332';
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const socketUrl = apiUrl.replace(/\/api\/?$/, '');

const sidebarItems = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'requests', label: 'Patient Requests' },
  { id: 'consultations', label: 'Consultations' },
  { id: 'patients', label: 'My Patients' },
  { id: 'tracking', label: 'Patient Tracking' },
  { id: 'notifications', label: 'Notifications' },
];

const emptyAssessment = {
  weight: '',
  height: '',
  temperature: '',
  bloodPressureSystolic: '',
  bloodPressureDiastolic: '',
  pulseRate: '',
  oxygenSaturation: '',
  chiefComplaint: '',
  medicalHistory: '',
  notes: '',
};

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

const minutesSince = (dateValue) => {
  if (!dateValue) return 'Just now';

  const createdAt = new Date(dateValue);
  if (Number.isNaN(createdAt.getTime())) return 'Just now';

  const minutes = Math.max(0, Math.floor((Date.now() - createdAt.getTime()) / 60000));
  if (minutes < 1) return 'Just now';
  if (minutes === 1) return '1 min';
  return `${minutes} min`;
};

const visitToConsultantPatient = (visit) => {
  const patient = visit.Patient || visit.patient || {};

  return {
    id: visit.id,
    visitId: visit.id,
    patientRecordId: patient.id,
    patientNo: patient.patientNo,
    name: [patient.firstName, patient.lastName].filter(Boolean).join(' ') || 'Unknown Patient',
    gender: patient.gender || '',
    age: calculateAge(patient.dateOfBirth),
    queue: visit.queueNumber ? String(visit.queueNumber).padStart(2, '0') : '00',
    time: minutesSince(visit.visitDate),
    reason: visit.visitReason || 'General visit',
    rawStatus: visit.status,
    status: visit.status === 'UNDER_CONSULTATION' ? 'With Consultant' : 'From Reception',
  };
};

const ConsultantDashboard = () => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [patientRequests, setPatientRequests] = useState([]);
  const [myPatients, setMyPatients] = useState([]);
  const [sentPatients, setSentPatients] = useState([]);
  const [currentPatient, setCurrentPatient] = useState(null);
  const [assessment, setAssessment] = useState(emptyAssessment);
  const [loadingQueue, setLoadingQueue] = useState(false);
  const [queueError, setQueueError] = useState('');
  const [savingAssessment, setSavingAssessment] = useState(false);

  const loadConsultantQueue = useCallback(async ({ silent = false } = {}) => {
    if (!silent) {
      setLoadingQueue(true);
    }
    setQueueError('');

    try {
      const response = await consultantService.getQueue();
      const patients = (response.data.data || []).map(visitToConsultantPatient);
      setPatientRequests(patients.filter((patient) => patient.rawStatus === 'WAITING_CONSULTANT'));
      setMyPatients(patients.filter((patient) => patient.rawStatus === 'UNDER_CONSULTATION'));
    } catch (error) {
      setQueueError(error?.response?.data?.message || 'Unable to load consultant queue.');
    } finally {
      if (!silent) {
        setLoadingQueue(false);
      }
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    loadConsultantQueue();
  }, [loadConsultantQueue]);

  useEffect(() => {
    const socket = io(socketUrl, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });

    socket.emit('join-queue', 'consultant');

    socket.on('patient-sent-to-consultant', (visit) => {
      if (visit?.id) {
        const incomingPatient = visitToConsultantPatient(visit);

        if (incomingPatient.rawStatus === 'WAITING_CONSULTANT') {
          setPatientRequests((prev) => [
            incomingPatient,
            ...prev.filter((patient) => patient.id !== incomingPatient.id),
          ]);
          setMyPatients((prev) => prev.filter((patient) => patient.id !== incomingPatient.id));
        }
      }

      loadConsultantQueue({ silent: true });
    });

    const refreshTimer = window.setInterval(() => {
      loadConsultantQueue({ silent: true });
    }, 15000);

    return () => {
      window.clearInterval(refreshTimer);
      socket.disconnect();
    };
  }, [loadConsultantQueue]);

  const dashboardStats = [
    { label: 'Patients waiting', value: patientRequests.length },
    { label: 'Pending requests', value: patientRequests.length },
    { label: "Today's consultations", value: myPatients.length + sentPatients.length },
    { label: 'Sent to Doctor', value: sentPatients.length },
  ];

  const displayUser = useMemo(() => ({
    ...user,
    name: [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.name || 'Consultant',
  }), [user]);

  const notifications = useMemo(() => [
    {
      id: 'requests',
      read: patientRequests.length === 0,
      message: `${patientRequests.length} patient requests waiting`,
    },
    {
      id: 'doctor',
      read: true,
      message: `${sentPatients.length} patients sent to doctor`,
    },
  ], [patientRequests.length, sentPatients.length]);

  const trackedPatients = useMemo(() => {
    return [
      ...patientRequests.map((patient) => ({ ...patient, status: 'Waiting at Consultant' })),
      ...myPatients.map((patient) => ({ ...patient, status: currentPatient?.id === patient.id ? 'In Consultation' : 'With Consultant' })),
      ...sentPatients.map((patient) => ({ ...patient, status: 'Sent to Doctor' })),
    ];
  }, [currentPatient, myPatients, patientRequests, sentPatients]);

  const resetAssessment = (patient = null) => {
    setAssessment({
      ...emptyAssessment,
      chiefComplaint: patient?.reason || '',
    });
  };

  const handleAcceptRequest = async (patient) => {
    try {
      const response = await consultantService.startConsultation(patient.visitId || patient.id);
      const acceptedPatient = {
        ...patient,
        ...visitToConsultantPatient(response.data.data),
        status: 'With Consultant',
        rawStatus: 'UNDER_CONSULTATION',
      };

      setPatientRequests((prev) => prev.filter((item) => item.id !== patient.id));
      setMyPatients((prev) => [acceptedPatient, ...prev]);
      setCurrentPatient(acceptedPatient);
      resetAssessment(acceptedPatient);
      setActiveSection('consultations');
    } catch (error) {
      alert(error?.response?.data?.message || 'Unable to accept patient request.');
    }
  };

  const handleSelectPatient = (patient) => {
    setCurrentPatient(patient);
    resetAssessment(patient);
    setActiveSection('consultations');
  };

  const handleAssessmentChange = (field, value) => {
    setAssessment((prev) => ({ ...prev, [field]: value }));
  };

  const handleSendToDoctor = async () => {
    if (!currentPatient) {
      alert('Please select a patient first.');
      setActiveSection('patients');
      return;
    }

    if (!assessment.chiefComplaint.trim()) {
      alert('Please enter the chief complaint before sending to Doctor.');
      return;
    }

    const transferredPatient = {
      ...currentPatient,
      assessment,
      status: 'Sent to Doctor',
      source: 'Consultant',
    };

    setSavingAssessment(true);

    try {
      await consultantService.sendToDoctor({
        visitId: currentPatient.visitId || currentPatient.id,
        consultantId: user?.id,
        ...assessment,
      });

      setSentPatients((prev) => [transferredPatient, ...prev]);
      setMyPatients((prev) => prev.filter((patient) => patient.id !== currentPatient.id));
      setCurrentPatient(null);
      resetAssessment();
      setActiveSection('tracking');
    } catch (error) {
      alert(error?.response?.data?.message || 'Unable to send patient to Doctor.');
    } finally {
      setSavingAssessment(false);
    }
  };

  const renderPanel = (title, subtitle, children) => (
    <section className="consultant-panel">
      <div className="consultant-panel-title">
        <div>
          <h2>{title}</h2>
          {subtitle && <span>{subtitle}</span>}
        </div>
      </div>
      {children}
    </section>
  );

  const renderDashboard = () => (
    <>
      <section className="consultant-hero-panel">
        <div>
          <span>
            {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </span>
          <h1>Consultant Desk</h1>
          <p>Receive patients from Reception, complete initial assessment, and send ready cases to Doctor.</p>
        </div>
        <button type="button" onClick={() => setActiveSection('requests')}>Open Requests</button>
      </section>

      <section className="consultant-stat-grid">
        {dashboardStats.map((stat) => (
          <article key={stat.label}>
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
          </article>))}
      </section>
    </>);

  const renderRequests = () => (
    renderPanel('Patient Requests', 'Kupokea requests kutoka Reception',
      <>
        {queueError && <div className="alert alert-warning mb-3">{queueError}</div>}
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Queue</th>
                <th>Patient</th>
                <th>Gender</th>
                <th>Age</th>
                <th>Reason</th>
                <th>Waiting</th>
                <th>Status</th>
                <th className="text-end">Action</th>
              </tr>
            </thead>
            <tbody>
              {loadingQueue ? (
                <tr>
                  <td colSpan="8" className="text-center text-secondary py-4">
                    Loading patient requests...
                  </td>
                </tr>
              ) : patientRequests.length > 0 ? (
                patientRequests.map((patient) => (
                  <tr key={patient.id}>
                    <td className="fw-semibold" style={{ color: textDark }}>#{patient.queue}</td>
                    <td>
                      <strong className="d-block" style={{ color: textDark }}>{patient.name}</strong>
                      <span className="small text-secondary">{patient.patientNo || 'No patient number'}</span>
                    </td>
                    <td>{patient.gender || '-'}</td>
                    <td>{patient.age || '-'}</td>
                    <td style={{ minWidth: 220 }}>{patient.reason}</td>
                    <td>{patient.time}</td>
                    <td>
                      <span className="badge rounded-pill text-bg-warning">
                        Waiting Consultant
                      </span>
                    </td>
                    <td className="text-end">
                      <button
                        type="button"
                        className="btn btn-success btn-sm"
                        onClick={() => handleAcceptRequest(patient)}
                      >
                        Accept
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center text-secondary py-4">
                    No new patient requests.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </>));

  const renderConsultations = () => (
    renderPanel('Consultations', currentPatient ? currentPatient.name : 'Select patient',
      currentPatient ? (
        <div className="row g-3">
          {[
            ['Weight (kg)', 'weight'],
            ['Height (cm)', 'height'],
            ['Temperature C', 'temperature'],
            ['BP Systolic', 'bloodPressureSystolic'],
            ['BP Diastolic', 'bloodPressureDiastolic'],
            ['Pulse Rate', 'pulseRate'],
            ['Oxygen Saturation', 'oxygenSaturation'],
          ].map(([label, field]) => (
            <div className="col-12 col-md-6 col-xl-4" key={field}>
              <label className="form-label small fw-semibold text-secondary">{label}</label>
              <input className="form-control" type="number" value={assessment[field]} onChange={(event) => handleAssessmentChange(field, event.target.value)} />
            </div>
          ))}
          {[
            ['Chief Complaint', 'chiefComplaint', 2],
            ['Medical History', 'medicalHistory', 2],
            ['Consultation Notes', 'notes', 3],
          ].map(([label, field, rows]) => (
            <div className="col-12" key={field}>
              <label className="form-label small fw-semibold text-secondary">{label}</label>
              <textarea className="form-control" rows={rows} value={assessment[field]} onChange={(event) => handleAssessmentChange(field, event.target.value)} />
            </div>
          ))}
          <div className="col-12 d-flex flex-wrap gap-2 justify-content-end">
            <button type="button" className="btn btn-outline-secondary" onClick={() => setActiveSection('patients')}>My Patients</button>
            <button type="button" className="btn btn-info text-white fw-semibold" onClick={handleSendToDoctor} disabled={savingAssessment}>
              {savingAssessment ? 'Sending...' : 'Send Patient to Doctor'}
            </button>
          </div>
        </div>) : (
        <div className="text-center bg-light rounded-4 py-5">
          <p className="text-secondary">Select or accept a patient to start assessment.</p>
          <button type="button" className="btn btn-info text-white fw-semibold" onClick={() => setActiveSection('requests')}>Open Patient Requests</button>
        </div>)));

  const renderPatients = () => (
    renderPanel('My Patients', 'Patients waliopo kwake',
      <div className="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-3">
        {myPatients.map((patient) => (
          <div className="col" key={patient.id}>
            <article className="border rounded-4 p-3 h-100">
              <small className="text-secondary">#{patient.queue}</small>
              <strong className="d-block h6 mt-2 mb-1" style={{ color: textDark }}>{patient.name}</strong>
              <span className="d-block text-secondary mb-3">{patient.reason}</span>
              <button type="button" className="btn btn-info text-white btn-sm" onClick={() => handleSelectPatient(patient)}>Start Consultation</button>
            </article>
          </div>))}
        {myPatients.length === 0 && <p className="text-secondary mb-0">No patients assigned to you.</p>}
      </div>));

  const renderTracking = () => (
    renderPanel('Patient Tracking', 'Follow patient status',
      <div className="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-3">
        {trackedPatients.map((patient) => (
          <div className="col" key={`${patient.id}-${patient.status}`}>
            <article className="border rounded-4 p-3 h-100">
              <strong className="d-block h6 mb-2" style={{ color: textDark }}>{patient.name}</strong>
              <span className="badge rounded-pill text-bg-info mb-2">{patient.status}</span>
              <small className="d-block text-secondary">{patient.reason}</small>
            </article>
          </div>))}
        {trackedPatients.length === 0 && <p className="text-secondary mb-0">No patients to track yet.</p>}
      </div>));

  const renderNotifications = () => (
    renderPanel('Notifications', 'Alerts za requests mpya',
      <div className="row row-cols-1 row-cols-md-2 g-3">
        <div className="col">
          <article className="border rounded-4 p-3 h-100">
            <strong className="d-block h6" style={{ color: textDark }}>{patientRequests.length} new patient requests</strong>
            <span className="text-secondary">Reception has sent patients for initial consultation.</span>
          </article>
        </div>
        <div className="col">
          <article className="border rounded-4 p-3 h-100">
            <strong className="d-block h6" style={{ color: textDark }}>{sentPatients.length} sent to Doctor</strong>
            <span className="text-secondary">Patients already moved to Doctor review.</span>
          </article>
        </div>
      </div>));

  const sectionContent = {
    dashboard: renderDashboard,
    requests: renderRequests,
    consultations: renderConsultations,
    patients: renderPatients,
    tracking: renderTracking,
    notifications: renderNotifications,
  };

  const unreadCount = notifications.filter((notification) => !notification.read).length;
  const greetingHour = currentTime.getHours();
  const greeting = greetingHour < 12 ? 'Good Morning' : greetingHour < 17 ? 'Good Afternoon' : 'Good Evening';
  const initials = displayUser.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'CD';

  return (
    <AppShell
      title="Consultant Desk"
      subtitle="Clinical Assessment"
      headerVariant="ministry"
      bannerTitle="MINISTRY OF HEALTH"
      bannerSubtitle="KAZIMILICARE PHARMACY"
      showAppHeader={false}
    >
      <div className="consultant-portal-shell">
        <aside className="consultant-portal-sidebar" aria-label="Consultant sidebar">
          <div className="consultant-sidebar-brand">
            <span className="consultant-brand-mark">KC</span>
            <strong>KazimiliCare</strong>
          </div>

          <div className="consultant-profile-card">
            <div className="consultant-profile-avatar">{initials}</div>
            <strong>{displayUser.name}</strong>
            <span>Consultant Desk</span>
          </div>

          <nav className="consultant-sidebar-nav">
            {sidebarItems.map((item) => (
              <button
                type="button"
                key={item.id}
                className={`consultant-sidebar-link ${activeSection === item.id ? 'is-active' : ''}`}
                onClick={() => setActiveSection(item.id)}
              >
                <span>{item.label}</span>
                {item.id === 'requests' && patientRequests.length > 0 && (
                  <span className="consultant-nav-badge">{patientRequests.length}</span>)}
                {item.id === 'notifications' && unreadCount > 0 && (
                  <span className="consultant-nav-badge">{unreadCount}</span>)}
              </button>))}
          </nav>

          <div className="consultant-sidebar-footer">
            <span>KazimiliCare v1.0.0</span>
          </div>
        </aside>

        <main className="consultant-portal-main">
          <header className="consultant-toolbar">
            <div className="consultant-toolbar-spacer" />
            <div className="consultant-greeting">
              <h1>
                {greeting}, {displayUser.name}
              </h1>
              <p>Consultant Desk - {currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            <div className="consultant-toolbar-actions">
              <button
                type="button"
                className="consultant-notification-button"
                onClick={() => setActiveSection('notifications')}
              >
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <span className="consultant-notification-count">{unreadCount}</span>)}
              </button>
            </div>
          </header>

          <div className="consultant-portal-content">
            {sectionContent[activeSection]()}
          </div>
        </main>
      </div>

      <style>{`
        .consultant-portal-shell {
          min-height: calc(100vh - 113px);
          display: flex;
          gap: 24px;
          padding: 20px 22px;
          background: #eef7f1;
          color: #214334;
        }

        .consultant-portal-sidebar {
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

        .consultant-sidebar-brand {
          min-height: 48px;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 16px;
          background: #198754;
          color: #ffffff;
          font-weight: 800;
        }

        .consultant-brand-mark {
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

        .consultant-profile-card {
          padding: 18px 16px 16px;
          text-align: center;
          border-bottom: 1px solid #dbe5f1;
        }

        .consultant-profile-avatar {
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

        .consultant-profile-card strong,
        .consultant-profile-card span {
          display: block;
        }

        .consultant-profile-card strong {
          color: #214334;
          font-size: 14px;
          line-height: 1.25;
        }

        .consultant-profile-card span {
          margin-top: 4px;
          color: #198754;
          font-size: 12px;
          font-weight: 700;
        }

        .consultant-sidebar-nav {
          flex: 1;
          display: grid;
          align-content: start;
          gap: 4px;
          padding: 14px 12px;
        }

        .consultant-sidebar-link {
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

        .consultant-sidebar-link:hover,
        .consultant-sidebar-link.is-active {
          background: #e7f4ed;
          color: #146c43;
        }

        .consultant-nav-badge,
        .consultant-notification-count {
          min-width: 24px;
          min-height: 22px;
          display: inline-grid;
          place-items: center;
          border-radius: 999px;
          background: #dc3545;
          color: #ffffff;
          padding: 0 5px;
          font-size: 11px;
          font-weight: 900;
        }

        .consultant-sidebar-footer {
          padding: 12px 16px;
          border-top: 1px solid #dbe5f1;
          color: #2d5a43;
          font-size: 11px;
          font-weight: 700;
        }

        .consultant-portal-main {
          min-width: 0;
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .consultant-toolbar {
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

        .consultant-greeting {
          min-width: 0;
          text-align: center;
        }

        .consultant-greeting h1 {
          margin: 0;
          color: #214334;
          font-size: 20px;
          line-height: 1.2;
          font-weight: 900;
          letter-spacing: 0;
        }

        .consultant-greeting p {
          margin: 3px 0 0;
          color: #91a5c2;
          font-size: 12px;
          font-weight: 700;
        }

        .consultant-toolbar-actions {
          display: flex;
          justify-content: flex-end;
        }

        .consultant-notification-button {
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

        .consultant-notification-button:hover {
          background: #e7f4ed;
          border-color: #198754;
        }

        .consultant-notification-count {
          position: absolute;
          top: -9px;
          right: -9px;
          border: 2px solid #ffffff;
        }

        .consultant-portal-content {
          width: min(100%, 1500px);
          margin: 28px auto 0;
        }

        .consultant-hero-panel,
        .consultant-panel,
        .consultant-stat-grid article {
          border: 1px solid #d8e2ef;
          border-radius: 14px;
          background: #ffffff;
          color: #214334;
          box-shadow: none;
        }

        .consultant-hero-panel {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          padding: 28px 32px;
          margin-bottom: 18px;
        }

        .consultant-hero-panel span,
        .consultant-panel-title span,
        .consultant-stat-grid span {
          color: #198754;
          font-size: 12px;
          font-weight: 900;
          text-transform: uppercase;
        }

        .consultant-hero-panel h1 {
          margin: 6px 0;
          color: #214334;
          font-size: 30px;
          line-height: 1.2;
          letter-spacing: 0;
        }

        .consultant-hero-panel p {
          margin: 0;
          color: #5e7869;
        }

        .consultant-hero-panel button,
        .consultant-portal-shell .btn-success,
        .consultant-portal-shell .btn-info {
          border-color: #198754;
          background: #198754;
          color: #ffffff;
        }

        .consultant-hero-panel button {
          min-height: 42px;
          border: 1px solid #198754;
          border-radius: 8px;
          padding: 0 18px;
          font: inherit;
          font-size: 14px;
          font-weight: 900;
          cursor: pointer;
          white-space: nowrap;
        }

        .consultant-stat-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 14px;
        }

        .consultant-stat-grid article {
          min-height: 118px;
          display: grid;
          align-content: space-between;
          padding: 18px;
          border-top: 4px solid #198754;
        }

        .consultant-stat-grid strong {
          color: #214334;
          font-size: 30px;
        }

        .consultant-panel {
          padding: 28px 32px;
        }

        .consultant-panel-title {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 14px;
          margin-bottom: 18px;
        }

        .consultant-panel-title h2 {
          margin: 0 0 4px;
          color: #214334;
          font-size: 24px;
          line-height: 1.2;
          letter-spacing: 0;
        }

        .consultant-portal-shell .table {
          min-width: 980px;
        }

        .consultant-portal-shell .table > :not(caption) > * > * {
          padding: 14px 16px;
          border-bottom-color: #e2e9f3;
        }

        .consultant-portal-shell thead,
        .consultant-portal-shell .table-light {
          --bs-table-bg: #f5f8fc;
          --bs-table-color: #8da0bd;
          color: #8da0bd;
          text-transform: uppercase;
          font-size: 12px;
          letter-spacing: 0;
        }

        .consultant-portal-shell .text-secondary {
          color: #91a5c2 !important;
        }

        .consultant-portal-shell .form-control,
        .consultant-portal-shell .form-select {
          min-height: 42px;
          border-color: #d5dfec;
          border-radius: 10px;
          color: #214334;
        }

        @media (max-width: 1050px) {
          .consultant-portal-shell {
            flex-direction: column;
          }

          .consultant-portal-sidebar {
            width: 100%;
            min-height: 0;
          }

          .consultant-sidebar-nav,
          .consultant-stat-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 720px) {
          .consultant-portal-shell {
            padding: 14px;
          }

          .consultant-toolbar {
            grid-template-columns: 1fr;
            padding: 12px;
          }

          .consultant-toolbar-spacer {
            display: none;
          }

          .consultant-toolbar-actions {
            justify-content: center;
          }

          .consultant-sidebar-nav,
          .consultant-stat-grid {
            grid-template-columns: 1fr;
          }

          .consultant-hero-panel,
          .consultant-panel-title {
            align-items: flex-start;
            flex-direction: column;
          }

          .consultant-panel,
          .consultant-hero-panel {
            padding: 20px;
          }
        }
      `}</style>
    </AppShell>);
};

export default ConsultantDashboard;
