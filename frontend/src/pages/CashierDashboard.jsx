import React, { useEffect, useMemo, useState } from 'react';
import AppShell from '../components/common/AppShell';
import { useAuth } from '../hooks/useAuth';

const sidebarItems = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'billing', label: 'Billing / Invoices' },
  { id: 'payments', label: 'Payments' },
  { id: 'receipts', label: 'Receipts' },
  { id: 'history', label: 'Payment History' },
  { id: 'tracking', label: 'Patient Tracking' },
  { id: 'notifications', label: 'Notifications' },
];

const CashierDashboard = () => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [paymentForm, setPaymentForm] = useState({ method: 'Cash', amount: '' });
  const [invoices, setInvoices] = useState([
    { id: 'INV-001', patient: 'John Doe', consultationFee: 10000, laboratoryFee: 15000, medicineCost: 22000, otherServices: 0, status: 'Unpaid' },
    { id: 'INV-002', patient: 'Jane Smith', consultationFee: 10000, laboratoryFee: 0, medicineCost: 18000, otherServices: 5000, status: 'Unpaid' },
    { id: 'INV-003', patient: 'Bob Wilson', consultationFee: 10000, laboratoryFee: 8000, medicineCost: 12000, otherServices: 0, status: 'Pending' },
  ]);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const invoiceTotal = (invoice) => invoice.consultationFee + invoice.laboratoryFee + invoice.medicineCost + invoice.otherServices;
  const paidInvoices = invoices.filter((invoice) => invoice.status === 'Paid');
  const unpaidInvoices = invoices.filter((invoice) => invoice.status !== 'Paid');
  const todaysRevenue = paymentHistory.reduce((total, payment) => total + payment.amountPaid, 0);

  const stats = [
    { label: "Today's revenue", value: `TSh ${todaysRevenue.toLocaleString()}` },
    { label: 'Pending payments', value: invoices.filter((invoice) => invoice.status === 'Pending').length },
    { label: 'Paid invoices', value: paidInvoices.length },
    { label: 'Unpaid invoices', value: unpaidInvoices.length },
  ];

  const displayUser = useMemo(() => ({
    ...user,
    name: [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.name || 'Cashier',
  }), [user]);

  const unpaidCount = unpaidInvoices.length;
  const initials = displayUser.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'CD';
  const greetingHour = currentTime.getHours();
  const greeting = greetingHour < 12 ? 'Good Morning' : greetingHour < 17 ? 'Good Afternoon' : 'Good Evening';

  const filteredHistory = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return paymentHistory;
    return paymentHistory.filter((payment) => (
      payment.patient.toLowerCase().includes(term)
      || payment.invoiceId.toLowerCase().includes(term)
      || payment.date.includes(term)
    ));
  }, [paymentHistory, searchTerm]);

  const handleSelectInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setPaymentForm({ method: 'Cash', amount: String(invoiceTotal(invoice)) });
    setActiveSection('payments');
  };

  const handleRecordPayment = () => {
    if (!selectedInvoice) {
      alert('Select an invoice first.');
      setActiveSection('billing');
      return;
    }

    const total = invoiceTotal(selectedInvoice);
    const amountPaid = Number(paymentForm.amount);
    if (!amountPaid || amountPaid < 1) {
      alert('Enter the payment amount.');
      return;
    }

    const status = amountPaid >= total ? 'Paid' : 'Partial';
    const payment = {
      id: Date.now(),
      invoiceId: selectedInvoice.id,
      patient: selectedInvoice.patient,
      method: paymentForm.method,
      amountPaid,
      balance: Math.max(total - amountPaid, 0),
      status,
      date: new Date().toLocaleDateString('en-US'),
    };

    setPaymentHistory((prev) => [payment, ...prev]);
    setInvoices((prev) => prev.map((invoice) => (invoice.id === selectedInvoice.id ? { ...invoice, status } : invoice)));
    setSelectedInvoice({ ...selectedInvoice, status });
    setActiveSection('receipts');
  };

  const renderInvoiceCards = () => (
    <div className="cashier-table-wrap">
      <table className="cashier-table">
        <thead>
          <tr>
            <th>Invoice</th>
            <th>Patient</th>
            <th>Consultation</th>
            <th>Laboratory</th>
            <th>Medicine</th>
            <th>Total</th>
            <th>Status</th>
            <th className="align-end">Action</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((invoice) => (
            <tr key={invoice.id}>
              <td className="strong">{invoice.id}</td>
              <td>{invoice.patient}</td>
              <td>TSh {invoice.consultationFee.toLocaleString()}</td>
              <td>TSh {invoice.laboratoryFee.toLocaleString()}</td>
              <td>TSh {invoice.medicineCost.toLocaleString()}</td>
              <td className="strong">TSh {invoiceTotal(invoice).toLocaleString()}</td>
              <td>
                <span className={`cashier-status ${invoice.status.toLowerCase()}`}>{invoice.status}</span>
              </td>
              <td className="align-end">
                <button type="button" onClick={() => handleSelectInvoice(invoice)}>Open Payment</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderDashboard = () => (
    <>
      <section className="cashier-hero">
        <div>
          <span>Cashier workflow</span>
          <h1>Cashier Desk</h1>
          <p>Manage billing, payments, receipts, and final patient completion without exposing clinical notes.</p>
        </div>
        <button type="button" onClick={() => setActiveSection('billing')}>Open Billing</button>
      </section>
      <section className="cashier-stat-grid">
        {stats.map((stat) => (
          <article key={stat.label}>
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
          </article>
        ))}
      </section>
    </>
  );

  const renderBilling = () => (
    <section className="cashier-panel">
      <div className="cashier-panel-title">
        <h2>Billing / Invoices</h2>
        <span>Consultation, laboratory, medicine, and services</span>
      </div>
      {renderInvoiceCards()}
    </section>
  );

  const renderPayments = () => (
    <section className="cashier-panel">
      <div className="cashier-panel-title">
        <h2>Payments</h2>
        <span>Record method, amount, balance, and status</span>
      </div>
      {selectedInvoice ? (
        <div className="cashier-two-column">
          <div className="cashier-breakdown">
            <h3>{selectedInvoice.patient}</h3>
            <dl>
              <div><dt>Consultation fee</dt><dd>TSh {selectedInvoice.consultationFee.toLocaleString()}</dd></div>
              <div><dt>Laboratory fee</dt><dd>TSh {selectedInvoice.laboratoryFee.toLocaleString()}</dd></div>
              <div><dt>Medicine cost</dt><dd>TSh {selectedInvoice.medicineCost.toLocaleString()}</dd></div>
              <div><dt>Other services</dt><dd>TSh {selectedInvoice.otherServices.toLocaleString()}</dd></div>
              <div><dt>Total</dt><dd>TSh {invoiceTotal(selectedInvoice).toLocaleString()}</dd></div>
            </dl>
          </div>
          <div className="cashier-form-grid single">
            <label>Payment Method
              <select value={paymentForm.method} onChange={(event) => setPaymentForm({ ...paymentForm, method: event.target.value })}>
                <option>Cash</option>
                <option>Mobile Money</option>
                <option>Card</option>
                <option>Insurance</option>
              </select>
            </label>
            <label>Amount Paid<input type="number" value={paymentForm.amount} onChange={(event) => setPaymentForm({ ...paymentForm, amount: event.target.value })} /></label>
            <button type="button" className="primary-action" onClick={handleRecordPayment}>Record Payment</button>
          </div>
        </div>
      ) : (
        <div className="cashier-empty-state">
          <p>Select an invoice before recording payment.</p>
          <button type="button" onClick={() => setActiveSection('billing')}>Open Billing</button>
        </div>
      )}
    </section>
  );

  const renderReceipts = () => (
    <section className="cashier-panel">
      <div className="cashier-panel-title">
        <h2>Receipts</h2>
        <span>Generate, print, and download receipt</span>
      </div>
      <div className="cashier-card-grid">
        {paymentHistory.map((payment) => (
          <article key={payment.id}>
            <small>{payment.status}</small>
            <strong>{payment.patient}</strong>
            <span>{payment.invoiceId} - TSh {payment.amountPaid.toLocaleString()}</span>
            <div className="cashier-actions">
              <button type="button" className="secondary-action">Print</button>
              <button type="button" className="primary-action">Download</button>
            </div>
          </article>
        ))}
        {paymentHistory.length === 0 && <p className="cashier-empty">No receipts generated yet.</p>}
      </div>
    </section>
  );

  const renderHistory = () => (
    <section className="cashier-panel">
      <div className="cashier-panel-title">
        <h2>Payment History</h2>
        <span>Search by patient, invoice, or date</span>
      </div>
      <div className="cashier-form-grid single">
        <label>Search<input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Patient, invoice, or date" /></label>
      </div>
      <div className="cashier-card-grid">
        {filteredHistory.map((payment) => (
          <article key={payment.id}>
            <small>{payment.date}</small>
            <strong>{payment.patient}</strong>
            <span>{payment.invoiceId} - {payment.method} - TSh {payment.amountPaid.toLocaleString()}</span>
            <small>Balance: TSh {payment.balance.toLocaleString()}</small>
          </article>
        ))}
        {filteredHistory.length === 0 && <p className="cashier-empty">No matching payments.</p>}
      </div>
    </section>
  );

  const renderTracking = () => (
    <section className="cashier-panel">
      <div className="cashier-panel-title">
        <h2>Patient Tracking</h2>
        <span>Payment stage and completion</span>
      </div>
      <div className="cashier-card-grid">
        {invoices.map((invoice) => (
          <article key={invoice.id}>
            <strong>{invoice.patient}</strong>
            <span>{invoice.status === 'Paid' ? 'Completed after payment' : 'At payment stage'}</span>
            <small>{invoice.id}</small>
          </article>
        ))}
      </div>
    </section>
  );

  const renderNotifications = () => (
    <section className="cashier-panel">
      <div className="cashier-panel-title">
        <h2>Notifications</h2>
        <span>Billing requests and pending payments</span>
      </div>
      <div className="cashier-card-grid">
        <article><strong>{unpaidInvoices.length} pending payments</strong><span>Patients waiting for payment processing.</span></article>
        <article><strong>{invoices.length} billing requests</strong><span>Invoices available from pharmacy or services.</span></article>
      </div>
    </section>
  );

  const sectionContent = {
    dashboard: renderDashboard,
    billing: renderBilling,
    payments: renderPayments,
    receipts: renderReceipts,
    history: renderHistory,
    tracking: renderTracking,
    notifications: renderNotifications,
  };

  return (
    <AppShell
      title="Cashier Desk"
      subtitle="Billing and Payments"
      headerVariant="ministry"
      bannerTitle="MINISTRY OF HEALTH"
      bannerSubtitle="KAZIMILICARE PHARMACY"
      showAppHeader={false}
    >
      <div className="cashier-shell">
        <aside className="cashier-sidebar" aria-label="Cashier sidebar">
          <div className="cashier-sidebar-brand">
            <span className="cashier-brand-mark">KC</span>
            <strong>KazimiliCare</strong>
          </div>

          <div className="cashier-profile-card">
            <div className="cashier-profile-avatar">{initials}</div>
            <strong>{displayUser.name}</strong>
            <span>Cashier Desk</span>
          </div>

          <nav>
            {sidebarItems.map((item) => (
              <button type="button" key={item.id} className={activeSection === item.id ? 'active' : ''} onClick={() => setActiveSection(item.id)}>
                <span>{item.label}</span>
                {item.id === 'notifications' && unpaidCount > 0 && (
                  <span className="cashier-nav-badge">{unpaidCount}</span>)}
              </button>
            ))}
          </nav>

          <div className="cashier-sidebar-footer">
            <span>KazimiliCare v1.0.0</span>
          </div>
        </aside>

        <main className="cashier-main">
          <header className="cashier-toolbar">
            <div className="cashier-toolbar-spacer" />
            <div className="cashier-greeting">
              <h1>{greeting}, {displayUser.name}</h1>
              <p>Cashier Desk - {currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            <div className="cashier-toolbar-actions">
              <button type="button" className="cashier-notification-button" onClick={() => setActiveSection('notifications')}>
                <span>Notifications</span>
                {unpaidCount > 0 && <span className="cashier-notification-count">{unpaidCount}</span>}
              </button>
            </div>
          </header>

          <div className="cashier-content">
            {sectionContent[activeSection]()}
          </div>
        </main>
      </div>

      <style>{`
        .cashier-shell {
          min-height: calc(100vh - 113px);
          display: flex;
          gap: 24px;
          padding: 20px 22px;
          background: #eef7f1;
          color: #214334;
        }

        .cashier-sidebar {
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

        .cashier-sidebar-brand {
          min-height: 48px;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 16px;
          background: #006780;
          color: #ffffff;
          font-weight: 800;
        }

        .cashier-brand-mark {
          width: 22px;
          height: 22px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: #ffffff;
          color: #006780;
          font-size: 10px;
          font-weight: 900;
        }

        .cashier-profile-card {
          padding: 18px 16px 16px;
          text-align: center;
          border-bottom: 1px solid #dbe5f1;
        }

        .cashier-profile-avatar {
          width: 76px;
          height: 76px;
          display: grid;
          place-items: center;
          margin: -2px auto 10px;
          border: 5px solid #ffffff;
          border-radius: 50%;
          background: #006780;
          color: #ffffff;
          box-shadow: 0 0 0 1px #cbd8e9;
          font-size: 22px;
          font-weight: 900;
        }

        .cashier-profile-card strong,
        .cashier-profile-card span {
          display: block;
        }

        .cashier-profile-card strong {
          color: #214334;
          font-size: 14px;
          line-height: 1.25;
        }

        .cashier-profile-card span {
          margin-top: 4px;
          color: #006780;
          font-size: 12px;
          font-weight: 700;
        }

        .cashier-sidebar nav {
          flex: 1;
          display: grid;
          align-content: start;
          gap: 4px;
          padding: 14px 12px;
        }

        .cashier-sidebar button {
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
          color: #244e5a;
          font: inherit;
          font-size: 14px;
          font-weight: 600;
          text-align: left;
          cursor: pointer;
        }

        .cashier-sidebar button:hover,
        .cashier-sidebar button.active {
          background: #eaf5f8;
          color: #004f62;
        }

        .cashier-nav-badge,
        .cashier-notification-count {
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

        .cashier-sidebar-footer {
          padding: 12px 16px;
          border-top: 1px solid #dbe5f1;
          color: #244e5a;
          font-size: 11px;
          font-weight: 700;
        }

        .cashier-main {
          min-width: 0;
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .cashier-toolbar {
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

        .cashier-greeting {
          min-width: 0;
          text-align: center;
        }

        .cashier-greeting h1 {
          margin: 0;
          color: #214334;
          font-size: 20px;
          line-height: 1.2;
          font-weight: 900;
          letter-spacing: 0;
        }

        .cashier-greeting p {
          margin: 3px 0 0;
          color: #91a5c2;
          font-size: 12px;
          font-weight: 700;
        }

        .cashier-toolbar-actions {
          display: flex;
          justify-content: flex-end;
        }

        .cashier-notification-button {
          position: relative;
          min-height: 36px;
          border: 1px solid #b7c9e7;
          border-radius: 8px;
          background: #ffffff;
          color: #006780;
          padding: 0 12px;
          font: inherit;
          font-size: 13px;
          font-weight: 800;
          cursor: pointer;
        }

        .cashier-notification-button:hover {
          background: #eaf5f8;
          border-color: #006780;
        }

        .cashier-notification-count {
          position: absolute;
          top: -9px;
          right: -9px;
          border: 2px solid #ffffff;
        }

        .cashier-content {
          width: min(100%, 1500px);
          margin: 28px auto 0;
          display: grid;
          gap: 18px;
        }

        .cashier-hero,
        .cashier-panel,
        .cashier-stat-grid article,
        .cashier-breakdown {
          border: 1px solid #d8e2ef;
          border-radius: 14px;
          background: #ffffff;
          color: #214334;
          box-shadow: none;
        }

        .cashier-hero {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          padding: 28px 32px;
        }

        .cashier-hero span,
        .cashier-panel-title span,
        .cashier-stat-grid span {
          display: block;
          color: #006780;
          font-size: 12px;
          font-weight: 900;
          text-transform: uppercase;
        }

        .cashier-hero h1 {
          margin: 6px 0;
          color: #214334;
          font-size: 30px;
          line-height: 1.2;
          letter-spacing: 0;
        }

        .cashier-hero p {
          margin: 0;
          color: #5e7869;
        }

        .cashier-stat-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 14px;
        }

        .cashier-stat-grid article {
          min-height: 118px;
          padding: 18px;
          display: grid;
          align-content: space-between;
          border-top: 4px solid #006780;
        }

        .cashier-stat-grid strong {
          color: #214334;
          font-size: 26px;
          overflow-wrap: anywhere;
        }

        .cashier-panel {
          padding: 28px 32px;
        }

        .cashier-panel-title {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 14px;
          margin-bottom: 18px;
        }

        .cashier-panel-title h2 {
          margin: 0 0 4px;
          color: #214334;
          font-size: 24px;
          line-height: 1.2;
          letter-spacing: 0;
        }

        .cashier-table-wrap {
          width: 100%;
          overflow-x: auto;
        }

        .cashier-table {
          width: 100%;
          min-width: 980px;
          border-collapse: collapse;
        }

        .cashier-table th,
        .cashier-table td {
          padding: 14px 16px;
          border-bottom: 1px solid #e2e9f3;
          color: #214334;
          vertical-align: middle;
          text-align: left;
        }

        .cashier-table th {
          background: #f5f8fc;
          color: #8da0bd;
          font-size: 12px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0;
        }

        .cashier-table .strong {
          font-weight: 900;
        }

        .cashier-table .align-end {
          text-align: right;
        }

        .cashier-status {
          display: inline-grid;
          place-items: center;
          min-height: 24px;
          border-radius: 999px;
          padding: 0 10px;
          font-size: 12px;
          font-weight: 900;
        }

        .cashier-status.unpaid {
          background: #fff1f0;
          color: #b42318;
        }

        .cashier-status.pending,
        .cashier-status.partial {
          background: #fff8e1;
          color: #9a6700;
        }

        .cashier-status.paid {
          background: #e7f4ed;
          color: #146c43;
        }

        .cashier-card-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 12px;
        }

        .cashier-card-grid article {
          border: 1px solid #e2eaee;
          border-radius: 8px;
          background: #f9fbfc;
          padding: 14px;
          display: grid;
          gap: 8px;
        }

        .cashier-card-grid strong {
          color: #214334;
        }

        .cashier-card-grid span,
        .cashier-card-grid small,
        .cashier-empty,
        .cashier-empty-state {
          color: #65747a;
          font-size: 13px;
          line-height: 1.4;
        }

        .cashier-two-column {
          display: grid;
          grid-template-columns: minmax(260px, 1fr) minmax(260px, 1fr);
          gap: 16px;
        }

        .cashier-breakdown {
          padding: 18px;
        }

        .cashier-breakdown h3 {
          margin: 0 0 12px;
          color: #214334;
          font-size: 20px;
          letter-spacing: 0;
        }

        .cashier-breakdown dl {
          margin: 0;
          display: grid;
          gap: 8px;
        }

        .cashier-breakdown div {
          display: flex;
          justify-content: space-between;
          gap: 14px;
          border-bottom: 1px solid #edf2f4;
          padding-bottom: 8px;
        }

        .cashier-breakdown dt {
          color: #65747a;
          font-weight: 800;
        }

        .cashier-breakdown dd {
          margin: 0;
          color: #214334;
          font-weight: 900;
          text-align: right;
        }

        .cashier-form-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
          margin-bottom: 16px;
        }

        .cashier-form-grid.single {
          grid-template-columns: 1fr;
        }

        .cashier-form-grid label {
          display: grid;
          gap: 7px;
          color: #34484f;
          font-size: 13px;
          font-weight: 900;
        }

        .cashier-form-grid input,
        .cashier-form-grid select {
          width: 100%;
          min-height: 42px;
          border: 1px solid #d5dfec;
          border-radius: 10px;
          color: #214334;
          padding: 10px 12px;
          font: inherit;
          outline: none;
        }

        .cashier-form-grid input:focus,
        .cashier-form-grid select:focus {
          border-color: #006780;
          box-shadow: 0 0 0 3px rgba(0, 103, 128, 0.12);
        }

        .cashier-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          flex-wrap: wrap;
        }

        .primary-action,
        .secondary-action,
        .cashier-hero button,
        .cashier-card-grid button,
        .cashier-table button,
        .cashier-empty-state button {
          min-height: 40px;
          border-radius: 8px;
          padding: 0 16px;
          font: inherit;
          font-size: 14px;
          font-weight: 900;
          cursor: pointer;
        }

        .primary-action,
        .cashier-hero button,
        .cashier-card-grid button,
        .cashier-table button,
        .cashier-empty-state button {
          border: 1px solid #006780;
          background: #006780;
          color: #ffffff;
        }

        .primary-action:hover,
        .cashier-hero button:hover,
        .cashier-card-grid button:hover,
        .cashier-table button:hover,
        .cashier-empty-state button:hover {
          border-color: #004f62;
          background: #004f62;
        }

        .secondary-action {
          border: 1px solid #cfdde2;
          background: #ffffff;
          color: #23414b;
        }

        .cashier-empty-state {
          min-height: 220px;
          display: grid;
          place-items: center;
          align-content: center;
          gap: 12px;
          text-align: center;
        }

        @media (max-width: 1050px) {
          .cashier-shell {
            flex-direction: column;
          }

          .cashier-sidebar {
            width: 100%;
            min-height: 0;
          }

          .cashier-sidebar nav,
          .cashier-stat-grid,
          .cashier-two-column {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 720px) {
          .cashier-shell {
            padding: 14px;
          }

          .cashier-toolbar {
            grid-template-columns: 1fr;
            padding: 12px;
          }

          .cashier-toolbar-spacer {
            display: none;
          }

          .cashier-toolbar-actions {
            justify-content: center;
          }

          .cashier-content {
            margin-top: 18px;
          }

          .cashier-sidebar nav,
          .cashier-stat-grid,
          .cashier-two-column,
          .cashier-form-grid {
            grid-template-columns: 1fr;
          }

          .cashier-hero,
          .cashier-panel-title {
            align-items: flex-start;
            flex-direction: column;
          }

          .cashier-hero,
          .cashier-panel {
            padding: 20px;
          }
        }
      `}</style>
    </AppShell>
  );
};

export default CashierDashboard;
