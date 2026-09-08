import React, { useMemo, useState } from 'react';
import AppShell from '../components/common/AppShell';

const sidebarItems = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'requests', label: 'Lab Requests' },
  { id: 'samples', label: 'Sample Collection' },
  { id: 'results', label: 'Result Entry' },
  { id: 'reports', label: 'Reports' },
  { id: 'tracking', label: 'Patient Tracking' },
  { id: 'notifications', label: 'Notifications' },
];

const initialRequests = [
  {
    id: 'LAB-001',
    patient: 'John Doe',
    doctor: 'Dr. Michael',
    tests: ['Malaria RDT', 'Full Blood Picture'],
    priority: 'Urgent',
    status: 'PENDING',
    requestedAt: '09:40 AM',
    notes: 'High fever and headache.',
  },
  {
    id: 'LAB-002',
    patient: 'Jane Smith',
    doctor: 'Dr. Sarah',
    tests: ['Blood Sugar', 'Urinalysis'],
    priority: 'Routine',
    status: 'PROCESSING',
    requestedAt: '10:15 AM',
    collectedAt: '10:28 AM',
    notes: 'Review glucose and urine markers.',
  },
  {
    id: 'LAB-003',
    patient: 'Bob Wilson',
    doctor: 'Dr. Michael',
    tests: ['CBC'],
    priority: 'Routine',
    status: 'COMPLETED',
    requestedAt: '08:55 AM',
    collectedAt: '09:05 AM',
    completedAt: '09:45 AM',
    result: 'CBC values within expected range.',
    conclusion: 'No critical abnormality detected.',
    sentToDoctor: true,
    notes: 'Persistent cough assessment.',
  },
];

const statusLabel = {
  PENDING: 'Waiting at Laboratory',
  PROCESSING: 'Sample Processing',
  COMPLETED: 'Results Sent to Doctor',
  REJECTED: 'Rejected',
};

const workflowSteps = [
  { id: 'dashboard', label: 'Requests', hint: 'Doctor orders' },
  { id: 'samples', label: 'Samples', hint: 'Receive and process' },
  { id: 'results', label: 'Results', hint: 'Enter findings' },
  { id: 'reports', label: 'Send Report', hint: 'Doctor review' },
];

const LaboratoryDashboard = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [requests, setRequests] = useState(initialRequests);
  const [resultForm, setResultForm] = useState({ result: '', conclusion: '' });

  const pendingRequests = requests.filter((request) => request.status === 'PENDING');
  const processingRequests = requests.filter((request) => request.status === 'PROCESSING');
  const completedReports = requests.filter((request) => request.status === 'COMPLETED');
  const urgentRequests = requests.filter((request) => request.priority === 'Urgent' && request.status !== 'COMPLETED');

  const currentStep = activeSection === 'requests'
    ? 'dashboard'
    : workflowSteps.some((step) => step.id === activeSection) ? activeSection : 'dashboard';

  const stats = [
    { label: 'Pending requests', value: pendingRequests.length },
    { label: 'Samples processing', value: processingRequests.length },
    { label: 'Reports completed', value: completedReports.length },
    { label: 'Urgent tests', value: urgentRequests.length },
  ];

  const trackedPatients = useMemo(() => (
    requests.map((request) => ({
      patient: request.patient,
      requestId: request.id,
      tests: request.tests.join(', '),
      status: statusLabel[request.status] || request.status,
      doctor: request.doctor,
    }))
  ), [requests]);

  const selectForResults = (request) => {
    setSelectedRequest(request);
    setResultForm({
      result: request.result || '',
      conclusion: request.conclusion || '',
    });
    setActiveSection('results');
  };

  const handleReceiveSample = (request) => {
    const collectedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const updatedRequest = { ...request, status: 'PROCESSING', collectedAt };

    setRequests((prev) => prev.map((item) => (
      item.id === request.id ? updatedRequest : item
    )));

    selectForResults(updatedRequest);
  };

  const handleRejectRequest = (requestId) => {
    setRequests((prev) => prev.map((item) => (
      item.id === requestId ? { ...item, status: 'REJECTED' } : item
    )));
  };

  const handleSubmitResult = (event) => {
    event.preventDefault();

    if (!selectedRequest) {
      alert('Select a laboratory request first.');
      setActiveSection('requests');
      return;
    }

    if (!resultForm.result.trim() || !resultForm.conclusion.trim()) {
      alert('Enter the result and conclusion before sending to doctor.');
      return;
    }

    const completedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setRequests((prev) => prev.map((item) => (
      item.id === selectedRequest.id
        ? {
          ...item,
          status: 'COMPLETED',
          completedAt,
          result: resultForm.result,
          conclusion: resultForm.conclusion,
          sentToDoctor: true,
        }
        : item
    )));

    setSelectedRequest(null);
    setResultForm({ result: '', conclusion: '' });
    setActiveSection('reports');
  };

  const renderRequestTable = (items, emptyText) => (
    <div className="lab-table-wrap">
      <table className="lab-table">
        <thead>
          <tr><th>Patient</th><th>Requested tests</th><th>Doctor</th><th>Priority</th><th>Time</th><th aria-label="Actions" /></tr>
        </thead>
        <tbody>
          {items.map((request) => (
            <tr key={request.id}>
              <td><strong>{request.patient}</strong><small>{request.id}</small></td>
              <td>{request.tests.join(', ')}</td>
              <td>{request.doctor}</td>
              <td><span className={`lab-priority ${request.priority.toLowerCase()}`}>{request.priority}</span></td>
              <td>{request.requestedAt}</td>
              <td className="lab-row-actions">
                {request.status === 'PENDING' && <button type="button" className="text-action danger" onClick={() => handleRejectRequest(request.id)}>Reject</button>}
                {request.status === 'PENDING' && <button type="button" className="text-action" onClick={() => handleReceiveSample(request)}>Receive</button>}
                {request.status === 'PROCESSING' && <button type="button" className="text-action" onClick={() => selectForResults(request)}>Enter result</button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {items.length === 0 && <p className="lab-empty">{emptyText}</p>}
    </div>
  );

  const renderDashboard = () => (
    <>
      <section className="lab-hero">
        <div>
          <span>Laboratory workflow</span>
          <h1>Laboratory Desk</h1>
          <p>Receive doctor test requests, collect samples, enter results, and send completed reports back to Doctor Review.</p>
        </div>
        <button type="button" onClick={() => setActiveSection('requests')}>Open Requests</button>
      </section>

      <section className="lab-workflow" aria-label="Laboratory workflow">
        {workflowSteps.map((step, index) => (
          <React.Fragment key={step.id}>
            <button type="button" className={currentStep === step.id ? 'current' : ''} onClick={() => setActiveSection(step.id)}>
              <span className="lab-step-number">{index + 1}</span>
              <span><strong>{step.label}</strong><small>{step.hint}</small></span>
            </button>
            {index < workflowSteps.length - 1 && <span className="lab-step-line" aria-hidden="true" />}
          </React.Fragment>
        ))}
      </section>

      <section className="lab-stat-grid">
        {stats.map((stat) => (
          <article key={stat.label}>
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
          </article>
        ))}
      </section>
    </>
  );

  const renderRequests = () => (
    <section className="lab-panel">
      <div className="lab-panel-title">
        <h2>Lab Requests</h2>
        <span>Requests from Doctor</span>
      </div>
      {renderRequestTable(pendingRequests, 'No pending laboratory requests.')}
    </section>
  );

  const renderSamples = () => (
    <section className="lab-panel">
      <div className="lab-panel-title">
        <h2>Sample Collection</h2>
        <span>Samples received and ready for testing</span>
      </div>
      {renderRequestTable(processingRequests, 'No samples currently processing.')}
    </section>
  );

  const renderResults = () => (
    <section className="lab-panel">
      <div className="lab-panel-title">
        <h2>Result Entry</h2>
        <span>Complete result and send back to doctor</span>
      </div>

      {selectedRequest ? (
        <form className="lab-form-grid" onSubmit={handleSubmitResult}>
          <label>Patient<input value={selectedRequest.patient} readOnly /></label>
          <label>Request ID<input value={selectedRequest.id} readOnly /></label>
          <label className="wide">Tests<input value={selectedRequest.tests.join(', ')} readOnly /></label>
          <label className="wide">Laboratory Result<textarea rows="4" value={resultForm.result} onChange={(event) => setResultForm({ ...resultForm, result: event.target.value })} /></label>
          <label className="wide">Conclusion<textarea rows="3" value={resultForm.conclusion} onChange={(event) => setResultForm({ ...resultForm, conclusion: event.target.value })} /></label>
          <div className="lab-actions wide">
            <button type="button" className="secondary-action" onClick={() => setActiveSection('samples')}>Back</button>
            <button type="submit" className="primary-action">Send Results to Doctor</button>
          </div>
        </form>
      ) : (
        <div className="lab-empty-state">
          <p>Select a processing sample before entering results.</p>
          <button type="button" onClick={() => setActiveSection('samples')}>Open Samples</button>
        </div>
      )}
    </section>
  );

  const renderReports = () => (
    <section className="lab-panel">
      <div className="lab-panel-title">
        <h2>Reports</h2>
        <span>Completed reports sent to Doctor Review</span>
      </div>
      <div className="lab-card-grid">
        {completedReports.map((report) => (
          <article key={report.id}>
            <small>{report.completedAt || 'Completed'} - {report.id}</small>
            <strong>{report.patient}</strong>
            <span>{report.result}</span>
            <small>{report.conclusion}</small>
          </article>
        ))}
        {completedReports.length === 0 && <p className="lab-empty">No completed reports yet.</p>}
      </div>
    </section>
  );

  const renderTracking = () => (
    <section className="lab-panel">
      <div className="lab-panel-title">
        <h2>Patient Tracking</h2>
        <span>Laboratory stage and next destination</span>
      </div>
      <div className="lab-card-grid">
        {trackedPatients.map((patient) => (
          <article key={patient.requestId}>
            <strong>{patient.patient}</strong>
            <span>{patient.status}</span>
            <small>{patient.tests}</small>
            <small>Next: {patient.status === 'Results Sent to Doctor' ? 'Doctor Review' : 'Laboratory'}</small>
          </article>
        ))}
      </div>
    </section>
  );

  const renderNotifications = () => (
    <section className="lab-panel">
      <div className="lab-panel-title">
        <h2>Notifications</h2>
        <span>Requests and urgent test alerts</span>
      </div>
      <div className="lab-card-grid">
        <article><strong>{pendingRequests.length} new lab requests</strong><span>Doctor requests waiting for sample receiving.</span></article>
        <article><strong>{processingRequests.length} samples processing</strong><span>Samples ready for result entry.</span></article>
        <article><strong>{urgentRequests.length} urgent tests</strong><span>Priority requests needing faster turnaround.</span></article>
      </div>
    </section>
  );

  const sectionContent = {
    dashboard: renderDashboard,
    requests: renderRequests,
    samples: renderSamples,
    results: renderResults,
    reports: renderReports,
    tracking: renderTracking,
    notifications: renderNotifications,
  };

  return (
    <AppShell
      title="Laboratory Desk"
      subtitle="Test Coordination"
      headerVariant="ministry"
      bannerTitle="MINISTRY OF HEALTH"
      bannerSubtitle="KAZIMILICARE LABORATORY"
    >
      <div className="lab-shell">
        <aside className="lab-sidebar" aria-label="Laboratory sidebar">
          <div className="lab-sidebar-heading">
            <span>KazimiliCare</span>
            <strong>Laboratory</strong>
          </div>
          <nav>
            {sidebarItems.map((item) => (
              <button type="button" key={item.id} className={activeSection === item.id ? 'active' : ''} onClick={() => setActiveSection(item.id)}>
                {item.label}
                {item.id === 'requests' && pendingRequests.length > 0 && <small>{pendingRequests.length}</small>}
              </button>
            ))}
          </nav>
        </aside>

        <main className="lab-content">
          <div className="lab-breadcrumb"><span>Home</span><b>/</b><strong>Laboratory Desk</strong><b>/</b><span>{sidebarItems.find((item) => item.id === activeSection)?.label}</span></div>
          <div className="lab-page-heading"><div><span>Laboratory operations</span><h1>{sidebarItems.find((item) => item.id === activeSection)?.label}</h1></div><span className="lab-date">Today, {new Date().toLocaleDateString()}</span></div>
          {sectionContent[activeSection]()}
        </main>
      </div>

      <style>{`
        .lab-shell { min-height: calc(100vh - 118px); background: #f1f4f5; display: grid; grid-template-columns: 240px minmax(0, 1fr); align-items: start; }
        .lab-sidebar { position: sticky; top: 76px; min-height: calc(100vh - 76px); background: #ffffff; border-right: 1px solid #dce6ea; padding: 18px 14px; }
        .lab-sidebar-heading { padding: 0 8px 14px; border-bottom: 1px solid #e2eaee; margin-bottom: 14px; }
        .lab-sidebar-heading span, .lab-hero span, .lab-panel-title span { display: block; color: #006780; font-size: 12px; font-weight: 900; text-transform: uppercase; }
        .lab-sidebar-heading strong { display: block; margin-top: 2px; color: #172126; font-size: 18px; }
        .lab-sidebar nav { display: grid; gap: 8px; }
        .lab-sidebar button { width: 100%; min-height: 42px; display: flex; align-items: center; justify-content: space-between; gap: 10px; border: 1px solid #dce6ea; border-radius: 8px; background: #f8fbfc; color: #21333a; padding: 10px 12px; text-align: left; font: inherit; font-size: 14px; font-weight: 800; cursor: pointer; }
        .lab-sidebar button:hover, .lab-sidebar button.active { border-color: #006780; background: #eaf5f8; color: #004f62; }
        .lab-sidebar button small { min-width: 24px; min-height: 22px; display: inline-grid; place-items: center; border-radius: 999px; background: #dc3545; color: #ffffff; font-size: 11px; font-weight: 900; }
        .lab-content { width: 100%; max-width: 1280px; margin: 0 auto; padding: 22px 28px 36px; display: grid; gap: 16px; }
        .lab-breadcrumb { display: flex; align-items: center; gap: 9px; color: #91a0a8; font-size: 12px; font-weight: 700; }
        .lab-breadcrumb strong { color: #1668a5; }
        .lab-page-heading { display: flex; align-items: end; justify-content: space-between; gap: 16px; }
        .lab-page-heading span:first-child, .lab-date { color: #2872aa; font-size: 12px; font-weight: 900; text-transform: uppercase; }
        .lab-page-heading h1 { margin: 4px 0 0; color: #263746; font-size: 26px; }
        .lab-date { color: #71818b; text-transform: none; }
        .lab-hero, .lab-panel, .lab-stat-grid article { border: 1px solid #dce6ea; border-radius: 8px; background: #ffffff; }
        .lab-hero { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 24px; }
        .lab-hero h1 { margin: 6px 0; color: #172126; font-size: clamp(26px, 4vw, 38px); }
        .lab-hero p { margin: 0; color: #5c6d74; }
        .lab-workflow { display: flex; align-items: center; padding: 18px 22px; border: 1px solid #dce6ea; border-radius: 8px; background: #ffffff; }
        .lab-workflow button { display: flex; align-items: center; gap: 10px; flex: 1; border: 0; background: transparent; color: #83919a; text-align: left; cursor: pointer; font: inherit; }
        .lab-workflow button.current { color: #196ca7; }
        .lab-step-number { width: 34px; height: 34px; display: grid; place-items: center; flex-shrink: 0; border: 1px solid #d8e1e6; border-radius: 50%; background: #f5f8fa; font-weight: 900; }
        .lab-workflow button.current .lab-step-number { border-color: #196ca7; background: #e6f2fb; }
        .lab-workflow strong, .lab-workflow small { display: block; }
        .lab-workflow strong { font-size: 13px; }
        .lab-workflow small { margin-top: 2px; font-size: 10px; color: #9ba8af; }
        .lab-step-line { height: 1px; flex: 1; min-width: 18px; background: #dbe3e8; }
        .lab-stat-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
        .lab-stat-grid article { min-height: 118px; padding: 16px; display: grid; align-content: space-between; border-top: 4px solid #006780; }
        .lab-stat-grid span, .lab-card-grid span, .lab-card-grid small { color: #65747a; font-size: 13px; line-height: 1.4; }
        .lab-stat-grid strong { color: #15252c; font-size: 32px; }
        .lab-panel { padding: 20px; }
        .lab-panel-title { display: flex; align-items: center; justify-content: space-between; gap: 14px; margin-bottom: 16px; }
        .lab-panel-title h2 { margin: 0; color: #172126; font-size: 22px; }
        .lab-card-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 12px; }
        .lab-card-grid article { border: 1px solid #e2eaee; border-radius: 8px; background: #f9fbfc; padding: 14px; display: grid; gap: 8px; }
        .lab-card-grid strong { color: #172126; }
        .lab-form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; margin-bottom: 16px; }
        .lab-form-grid label { display: grid; gap: 7px; color: #34484f; font-size: 13px; font-weight: 900; }
        .lab-form-grid .wide, .lab-actions.wide { grid-column: 1 / -1; }
        .lab-form-grid input, .lab-form-grid textarea { width: 100%; border: 1px solid #cfdde2; border-radius: 8px; padding: 10px 12px; font: inherit; outline: none; }
        .lab-form-grid input:focus, .lab-form-grid textarea:focus { border-color: #006780; box-shadow: 0 0 0 3px rgba(0, 103, 128, 0.12); }
        .lab-table-wrap { overflow-x: auto; }
        .lab-table { width: 100%; min-width: 760px; border-collapse: collapse; color: #52636d; font-size: 13px; }
        .lab-table th { padding: 11px 12px; border-bottom: 1px solid #dce6ea; color: #71818b; font-size: 10px; text-align: left; text-transform: uppercase; letter-spacing: .04em; }
        .lab-table td { padding: 14px 12px; border-bottom: 1px solid #edf1f3; vertical-align: middle; }
        .lab-table tr:last-child td { border-bottom: 0; }
        .lab-table td strong, .lab-table td small { display: block; }
        .lab-table td strong { color: #263746; }
        .lab-table td small { margin-top: 3px; color: #97a4ab; font-size: 11px; }
        .lab-priority { display: inline-block; padding: 4px 8px; border-radius: 999px; background: #e8f3f8; color: #126a83; font-size: 11px; font-weight: 900; }
        .lab-priority.urgent { background: #fff0e9; color: #c34f2e; }
        .lab-row-actions { white-space: nowrap; text-align: right; }
        .text-action { border: 0; background: transparent; color: #176da8; font: inherit; font-size: 12px; font-weight: 900; cursor: pointer; }
        .text-action.danger { margin-right: 10px; color: #c34f2e; }
        .lab-actions { display: flex; justify-content: flex-end; gap: 10px; flex-wrap: wrap; }
        .primary-action, .secondary-action, .lab-hero button, .lab-empty-state button { min-height: 42px; border-radius: 8px; padding: 0 16px; font: inherit; font-size: 14px; font-weight: 900; cursor: pointer; }
        .primary-action, .lab-hero button, .lab-empty-state button { border: 0; background: #006780; color: #ffffff; }
        .secondary-action { border: 1px solid #cfdde2; background: #ffffff; color: #23414b; }
        .lab-empty, .lab-empty-state { color: #65747a; font-size: 14px; }
        .lab-empty-state { min-height: 220px; display: grid; place-items: center; align-content: center; gap: 12px; text-align: center; }
        @media (max-width: 980px) { .lab-shell { grid-template-columns: 1fr; } .lab-sidebar { position: static; min-height: auto; border-right: 0; border-bottom: 1px solid #dce6ea; } .lab-sidebar nav, .lab-stat-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
        @media (max-width: 640px) { .lab-content { padding: 16px; } .lab-sidebar nav, .lab-stat-grid, .lab-form-grid { grid-template-columns: 1fr; } .lab-hero, .lab-panel-title, .lab-page-heading { align-items: flex-start; flex-direction: column; } .lab-workflow { align-items: stretch; flex-direction: column; gap: 8px; } .lab-step-line { width: 1px; height: 12px; min-width: 0; margin-left: 17px; } }
      `}</style>
    </AppShell>
  );
};

export default LaboratoryDashboard;
