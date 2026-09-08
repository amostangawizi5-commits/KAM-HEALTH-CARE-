import React, { useMemo, useState } from 'react';
import AppShell from '../components/common/AppShell';

const sidebarItems = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'prescriptions', label: 'Prescriptions' },
  { id: 'dispensing', label: 'Dispensing' },
  { id: 'inventory', label: 'Inventory' },
  { id: 'tracking', label: 'Patient Tracking' },
  { id: 'notifications', label: 'Notifications' },
];

const PharmacyDashboard = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [dispensedToday, setDispensedToday] = useState([]);
  const [prescriptions, setPrescriptions] = useState([
    { id: 1, patient: 'John Doe', medicine: 'Amoxicillin', dosage: '500 mg', duration: '5 days', quantity: 15, status: 'Pending' },
    { id: 2, patient: 'Jane Smith', medicine: 'Ibuprofen', dosage: '400 mg', duration: '3 days', quantity: 9, status: 'Pending' },
    { id: 3, patient: 'Bob Wilson', medicine: 'ORS', dosage: '1 sachet', duration: '2 days', quantity: 6, status: 'Pending' },
  ]);
  const [inventory, setInventory] = useState([
    { id: 1, name: 'Amoxicillin', stock: 80, expiry: '2027-02-12' },
    { id: 2, name: 'Ibuprofen', stock: 14, expiry: '2026-10-20' },
    { id: 3, name: 'ORS', stock: 120, expiry: '2028-01-18' },
    { id: 4, name: 'Metformin', stock: 8, expiry: '2026-09-01' },
  ]);
  const [newMedicine, setNewMedicine] = useState({ name: '', stock: '', expiry: '' });
  const [dispenseForm, setDispenseForm] = useState({ quantity: '', note: '' });

  const lowStockItems = inventory.filter((item) => item.stock <= 15);
  const expiredItems = inventory.filter((item) => new Date(item.expiry) < new Date());
  const totalInventory = inventory.reduce((total, item) => total + Number(item.stock || 0), 0);

  const stats = [
    { label: 'Pending prescriptions', value: prescriptions.filter((item) => item.status === 'Pending').length },
    { label: 'Medicines dispensed today', value: dispensedToday.length },
    { label: 'Low-stock medicines', value: lowStockItems.length },
    { label: 'Total inventory', value: totalInventory },
  ];

  const trackedPatients = useMemo(() => {
    return [
      ...prescriptions.map((item) => ({ patient: item.patient, status: item.status === 'Completed' ? 'Ready for Cashier' : 'Waiting at Pharmacy', detail: item.medicine })),
      ...dispensedToday.map((item) => ({ patient: item.patient, status: 'Billing request sent to Cashier', detail: item.medicine })),
    ];
  }, [dispensedToday, prescriptions]);

  const handleAcceptPrescription = (prescription) => {
    setSelectedPrescription(prescription);
    setDispenseForm({ quantity: String(prescription.quantity), note: '' });
    setActiveSection('dispensing');
  };

  const handleRejectPrescription = (prescriptionId) => {
    setPrescriptions((prev) => prev.map((item) => (item.id === prescriptionId ? { ...item, status: 'Rejected' } : item)));
  };

  const handleDispense = () => {
    if (!selectedPrescription) {
      alert('Select a prescription first.');
      setActiveSection('prescriptions');
      return;
    }

    const quantity = Number(dispenseForm.quantity);
    if (!quantity || quantity < 1) {
      alert('Enter the quantity dispensed.');
      return;
    }

    setInventory((prev) => prev.map((item) => (
      item.name === selectedPrescription.medicine
        ? { ...item, stock: Math.max(Number(item.stock) - quantity, 0) }
        : item
    )));
    setPrescriptions((prev) => prev.map((item) => (
      item.id === selectedPrescription.id ? { ...item, status: 'Completed' } : item
    )));
    setDispensedToday((prev) => [{ ...selectedPrescription, dispensedQuantity: quantity, note: dispenseForm.note }, ...prev]);
    setSelectedPrescription(null);
    setDispenseForm({ quantity: '', note: '' });
    setActiveSection('tracking');
  };

  const handleAddMedicine = (event) => {
    event.preventDefault();
    setInventory((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: newMedicine.name,
        stock: Number(newMedicine.stock),
        expiry: newMedicine.expiry,
      },
    ]);
    setNewMedicine({ name: '', stock: '', expiry: '' });
  };

  const renderDashboard = () => (
    <>
      <section className="pharmacy-hero">
        <div>
          <span>Pharmacy workflow</span>
          <h1>Pharmacy Desk</h1>
          <p>Receive prescriptions from Doctor, dispense medicines, manage stock, and send billing requests to Cashier.</p>
        </div>
        <button type="button" onClick={() => setActiveSection('prescriptions')}>Open Prescriptions</button>
      </section>
      <section className="pharmacy-stat-grid">
        {stats.map((stat) => (
          <article key={stat.label}>
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
          </article>
        ))}
      </section>
    </>
  );

  const renderPrescriptions = () => (
    <section className="pharmacy-panel">
      <div className="pharmacy-panel-title">
        <h2>Prescriptions</h2>
        <span>Kupokea prescription kutoka Doctor</span>
      </div>
      <div className="pharmacy-card-grid">
        {prescriptions.map((item) => (
          <article key={item.id}>
            <small>{item.status}</small>
            <strong>{item.patient}</strong>
            <span>{item.medicine} - {item.dosage} - {item.duration}</span>
            <div className="pharmacy-actions">
              <button type="button" className="secondary-action" onClick={() => handleRejectPrescription(item.id)}>Reject</button>
              <button type="button" className="primary-action" onClick={() => handleAcceptPrescription(item)}>Accept</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );

  const renderDispensing = () => (
    <section className="pharmacy-panel">
      <div className="pharmacy-panel-title">
        <h2>Dispensing</h2>
        <span>Confirm medicine and quantity</span>
      </div>
      {selectedPrescription ? (
        <div className="pharmacy-form-grid">
          <label>Patient<input value={selectedPrescription.patient} readOnly /></label>
          <label>Medicine<input value={selectedPrescription.medicine} readOnly /></label>
          <label>Quantity Dispensed<input type="number" value={dispenseForm.quantity} onChange={(event) => setDispenseForm({ ...dispenseForm, quantity: event.target.value })} /></label>
          <label className="wide">Dispensing Note<textarea rows="3" value={dispenseForm.note} onChange={(event) => setDispenseForm({ ...dispenseForm, note: event.target.value })} /></label>
          <div className="pharmacy-actions wide">
            <button type="button" className="primary-action" onClick={handleDispense}>Mark Prescription Completed</button>
          </div>
        </div>
      ) : (
        <div className="pharmacy-empty-state">
          <p>Select a prescription before dispensing medicine.</p>
          <button type="button" onClick={() => setActiveSection('prescriptions')}>Open Prescriptions</button>
        </div>
      )}
    </section>
  );

  const renderInventory = () => (
    <section className="pharmacy-panel">
      <div className="pharmacy-panel-title">
        <h2>Inventory</h2>
        <span>Add medicine, update stock, view low stock</span>
      </div>
      <form className="pharmacy-form-grid" onSubmit={handleAddMedicine}>
        <label>Medicine Name<input value={newMedicine.name} onChange={(event) => setNewMedicine({ ...newMedicine, name: event.target.value })} required /></label>
        <label>Stock<input type="number" value={newMedicine.stock} onChange={(event) => setNewMedicine({ ...newMedicine, stock: event.target.value })} required /></label>
        <label>Expiry Date<input type="date" value={newMedicine.expiry} onChange={(event) => setNewMedicine({ ...newMedicine, expiry: event.target.value })} required /></label>
        <div className="pharmacy-actions"><button type="submit" className="primary-action">Add Medicine</button></div>
      </form>
      <div className="inventory-list">
        {inventory.map((item) => (
          <article key={item.id}>
            <strong>{item.name}</strong>
            <span>{item.stock} in stock</span>
            <small>Expires {item.expiry}</small>
          </article>
        ))}
      </div>
    </section>
  );

  const renderTracking = () => (
    <section className="pharmacy-panel">
      <div className="pharmacy-panel-title">
        <h2>Patient Tracking</h2>
        <span>After dispensing, send billing to Cashier</span>
      </div>
      <div className="pharmacy-card-grid">
        {trackedPatients.map((item, index) => (
          <article key={`${item.patient}-${index}`}>
            <strong>{item.patient}</strong>
            <span>{item.status}</span>
            <small>{item.detail}</small>
          </article>
        ))}
      </div>
    </section>
  );

  const renderNotifications = () => (
    <section className="pharmacy-panel">
      <div className="pharmacy-panel-title">
        <h2>Notifications</h2>
        <span>New prescription and stock alerts</span>
      </div>
      <div className="pharmacy-card-grid">
        <article><strong>{prescriptions.filter((item) => item.status === 'Pending').length} new prescriptions</strong><span>Doctor prescription requests waiting for review.</span></article>
        <article><strong>{lowStockItems.length} low stock alerts</strong><span>{lowStockItems.map((item) => item.name).join(', ') || 'No low stock items.'}</span></article>
        <article><strong>{expiredItems.length} expired medicines</strong><span>{expiredItems.map((item) => item.name).join(', ') || 'No expired medicines.'}</span></article>
      </div>
    </section>
  );

  const sectionContent = {
    dashboard: renderDashboard,
    prescriptions: renderPrescriptions,
    dispensing: renderDispensing,
    inventory: renderInventory,
    tracking: renderTracking,
    notifications: renderNotifications,
  };

  return (
    <AppShell
      title="Pharmacy Desk"
      subtitle="Medicine Dispensing"
      headerVariant="ministry"
      bannerTitle="MINISTRY OF HEALTH"
      bannerSubtitle="KAZIMILICARE PHARMACY"
    >
      <div className="pharmacy-shell">
        <aside className="pharmacy-sidebar" aria-label="Pharmacy sidebar">
          <div className="pharmacy-sidebar-heading">
            <span>KazimiliCare</span>
            <strong>Pharmacy</strong>
          </div>
          <nav>
            {sidebarItems.map((item) => (
              <button type="button" key={item.id} className={activeSection === item.id ? 'active' : ''} onClick={() => setActiveSection(item.id)}>
                {item.label}
              </button>
            ))}
          </nav>
        </aside>
        <main className="pharmacy-content">
          {sectionContent[activeSection]()}
        </main>
      </div>

      <style>{`
        .pharmacy-shell { min-height: calc(100vh - 118px); background: #f1f4f5; display: grid; grid-template-columns: 240px minmax(0, 1fr); align-items: start; }
        .pharmacy-sidebar { position: sticky; top: 76px; min-height: calc(100vh - 76px); background: #ffffff; border-right: 1px solid #dce6ea; padding: 18px 14px; }
        .pharmacy-sidebar-heading { padding: 0 8px 14px; border-bottom: 1px solid #e2eaee; margin-bottom: 14px; }
        .pharmacy-sidebar-heading span, .pharmacy-hero span, .pharmacy-panel-title span { display: block; color: #006780; font-size: 12px; font-weight: 900; text-transform: uppercase; }
        .pharmacy-sidebar-heading strong { display: block; margin-top: 2px; color: #172126; font-size: 18px; }
        .pharmacy-sidebar nav { display: grid; gap: 8px; }
        .pharmacy-sidebar button { width: 100%; min-height: 42px; border: 1px solid #dce6ea; border-radius: 8px; background: #f8fbfc; color: #21333a; padding: 10px 12px; text-align: left; font: inherit; font-size: 14px; font-weight: 800; cursor: pointer; }
        .pharmacy-sidebar button:hover, .pharmacy-sidebar button.active { border-color: #006780; background: #eaf5f8; color: #004f62; }
        .pharmacy-content { width: 100%; max-width: 1180px; margin: 0 auto; padding: 24px; display: grid; gap: 18px; }
        .pharmacy-hero, .pharmacy-panel, .pharmacy-stat-grid article { border: 1px solid #dce6ea; border-radius: 8px; background: #ffffff; }
        .pharmacy-hero { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 24px; }
        .pharmacy-hero h1 { margin: 6px 0; color: #172126; font-size: clamp(26px, 4vw, 38px); }
        .pharmacy-hero p { margin: 0; color: #5c6d74; }
        .pharmacy-stat-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
        .pharmacy-stat-grid article { min-height: 118px; padding: 16px; display: grid; align-content: space-between; border-top: 4px solid #006780; }
        .pharmacy-stat-grid span, .pharmacy-card-grid span, .pharmacy-card-grid small, .inventory-list span, .inventory-list small { color: #65747a; font-size: 13px; line-height: 1.4; }
        .pharmacy-stat-grid strong { color: #15252c; font-size: 32px; }
        .pharmacy-panel { padding: 20px; }
        .pharmacy-panel-title { display: flex; align-items: center; justify-content: space-between; gap: 14px; margin-bottom: 16px; }
        .pharmacy-panel-title h2 { margin: 0; color: #172126; font-size: 22px; }
        .pharmacy-card-grid, .inventory-list { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; }
        .pharmacy-card-grid article, .inventory-list article { border: 1px solid #e2eaee; border-radius: 8px; background: #f9fbfc; padding: 14px; display: grid; gap: 8px; }
        .pharmacy-card-grid strong, .inventory-list strong { color: #172126; }
        .pharmacy-form-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; margin-bottom: 16px; }
        .pharmacy-form-grid label { display: grid; gap: 7px; color: #34484f; font-size: 13px; font-weight: 900; }
        .pharmacy-form-grid .wide, .pharmacy-actions.wide { grid-column: 1 / -1; }
        .pharmacy-form-grid input, .pharmacy-form-grid textarea { width: 100%; border: 1px solid #cfdde2; border-radius: 8px; padding: 10px 12px; font: inherit; outline: none; }
        .pharmacy-form-grid input:focus, .pharmacy-form-grid textarea:focus { border-color: #006780; box-shadow: 0 0 0 3px rgba(0, 103, 128, 0.12); }
        .pharmacy-actions { display: flex; justify-content: flex-end; gap: 10px; flex-wrap: wrap; }
        .primary-action, .secondary-action, .pharmacy-hero button, .pharmacy-empty-state button { min-height: 42px; border-radius: 8px; padding: 0 16px; font: inherit; font-size: 14px; font-weight: 900; cursor: pointer; }
        .primary-action, .pharmacy-hero button, .pharmacy-empty-state button { border: 0; background: #006780; color: #ffffff; }
        .secondary-action { border: 1px solid #cfdde2; background: #ffffff; color: #23414b; }
        .pharmacy-empty-state { min-height: 220px; display: grid; place-items: center; align-content: center; gap: 12px; color: #65747a; text-align: center; }
        @media (max-width: 980px) { .pharmacy-shell { grid-template-columns: 1fr; } .pharmacy-sidebar { position: static; min-height: auto; border-right: 0; border-bottom: 1px solid #dce6ea; } .pharmacy-sidebar nav, .pharmacy-stat-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } .pharmacy-form-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
        @media (max-width: 640px) { .pharmacy-content { padding: 16px; } .pharmacy-sidebar nav, .pharmacy-stat-grid, .pharmacy-form-grid { grid-template-columns: 1fr; } .pharmacy-hero, .pharmacy-panel-title { align-items: flex-start; flex-direction: column; } }
      `}</style>
    </AppShell>
  );
};

export default PharmacyDashboard;
