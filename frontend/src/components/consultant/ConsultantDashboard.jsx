// src/components/consultant/ConsultantDashboard.jsx
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { consultantService } from '../../services/api';
import Sidebar from './Sidebar';
import Header from './Header';
import Dashboard from './Dashboard';
import PatientRequests from './PatientRequests';
import Consultations from './Consultations';
import MyPatients from './MyPatients';
import PatientTracking from './PatientTracking';
import Notifications from './Notifications';

const shellStyles = {
  layout: {
    minHeight: '100vh',
    background: '#f0f4f8',
  },
};

const ConsultantDashboard = () => {
  const { user } = useContext(AuthContext);
  const [activePage, setActivePage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Data states
  const [dashboardStats, setDashboardStats] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [requests, setRequests] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [patients, setPatients] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientTracking, setPatientTracking] = useState(null);

  // Pagination states
  const [requestsPagination, setRequestsPagination] = useState({ page: 1, total: 0, limit: 10 });
  const [consultationsPagination, setConsultationsPagination] = useState({ page: 1, total: 0, limit: 10 });
  const [patientsPagination, setPatientsPagination] = useState({ page: 1, total: 0, limit: 10 });
  const [notificationsPagination, setNotificationsPagination] = useState({ page: 1, total: 0, limit: 10 });

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handlePageChange = (page) => {
    setActivePage(page);
    if (window.innerWidth <= 768) {
      setSidebarOpen(false);
    }
  };

  // Fetch dashboard data
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [statsRes, scheduleRes, notificationsRes] = await Promise.all([
        consultantService.getDashboardStats(),
        consultantService.getTodaySchedule(),
        consultantService.getNotifications(),
      ]);
      setDashboardStats(statsRes.data);
      setSchedule(scheduleRes.data);
      setNotifications(notificationsRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch requests
  const fetchRequests = async (page = 1, status = 'ALL', search = '') => {
    try {
      setLoading(true);
      const response = await consultantService.getPatientRequests({ page, limit: 10, status, search });
      setRequests(response.data.requests);
      setRequestsPagination({
        page: response.data.page,
        total: response.data.total,
        limit: response.data.limit,
      });
    } catch (err) {
      setError('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  // Fetch consultations
  const fetchConsultations = async (page = 1, status = 'ALL', search = '') => {
    try {
      setLoading(true);
      const response = await consultantService.getConsultations({ page, limit: 10, status, search });
      setConsultations(response.data.consultations);
      setConsultationsPagination({
        page: response.data.page,
        total: response.data.total,
        limit: response.data.limit,
      });
    } catch (err) {
      setError('Failed to load consultations');
    } finally {
      setLoading(false);
    }
  };

  // Fetch patients
  const fetchPatients = async (page = 1, search = '') => {
    try {
      setLoading(true);
      const response = await consultantService.getPatients({ page, limit: 10, search });
      setPatients(response.data.patients);
      setPatientsPagination({
        page: response.data.page,
        total: response.data.total,
        limit: response.data.limit,
      });
    } catch (err) {
      setError('Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  // Fetch notifications
  const fetchNotifications = async (page = 1) => {
    try {
      setLoading(true);
      const response = await consultantService.getNotifications({ page, limit: 10 });
      setNotifications(response.data.notifications);
      setNotificationsPagination({
        page: response.data.page,
        total: response.data.total,
        limit: response.data.limit,
      });
    } catch (err) {
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  // Fetch patient tracking
  const fetchPatientTracking = async (patientId) => {
    try {
      setLoading(true);
      const response = await consultantService.getPatientTracking(patientId);
      setPatientTracking(response.data);
    } catch (err) {
      setError('Failed to load patient tracking');
    } finally {
      setLoading(false);
    }
  };

  // Handle page change
  const handlePageChangeTable = (page, type) => {
    switch(type) {
      case 'requests':
        fetchRequests(page);
        break;
      case 'consultations':
        fetchConsultations(page);
        break;
      case 'patients':
        fetchPatients(page);
        break;
      case 'notifications':
        fetchNotifications(page);
        break;
      default:
        break;
    }
  };

  // Render content
  const renderContent = () => {
    if (loading) {
      return (
        <div className="d-flex flex-column align-items-center justify-content-center py-5" style={{ minHeight: 400 }}>
          <div className="spinner-border text-info" role="status" aria-label="Loading"></div>
          <p className="mt-3 mb-0 text-secondary small">Loading...</p>
        </div>);
    }

    if (error) {
      return (
        <div className="bg-white text-center rounded-4 shadow-sm px-3 py-5">
          <span className="d-block fs-1 mb-3 text-warning">Warning</span>
          <p className="text-secondary mb-3">{error}</p>
          <button onClick={() => window.location.reload()} className="btn btn-info text-white fw-semibold px-4">
            Retry
          </button>
        </div>);
    }

    switch(activePage) {
      case 'dashboard':
        return (
          <Dashboard
            stats={dashboardStats}
            schedule={schedule}
            notifications={notifications}
            onRefresh={fetchDashboardData}
          />);
      case 'requests':
        return (
          <PatientRequests
            requests={requests}
            pagination={requestsPagination}
            onPageChange={(page) => handlePageChangeTable(page, 'requests')}
            onFilter={fetchRequests}
            onAccept={async (id, data) => {
              await consultantService.acceptRequest(id, data);
              fetchRequests(requestsPagination.page);
            }}
            onReject={async (id) => {
              await consultantService.rejectRequest(id);
              fetchRequests(requestsPagination.page);
            }}
            onRefresh={() => fetchRequests(requestsPagination.page)}
          />);
      case 'consultations':
        return (
          <Consultations
            consultations={consultations}
            pagination={consultationsPagination}
            onPageChange={(page) => handlePageChangeTable(page, 'consultations')}
            onFilter={fetchConsultations}
            onStart={async (id) => {
              await consultantService.startConsultation(id);
              fetchConsultations(consultationsPagination.page);
            }}
            onComplete={async (id, data) => {
              await consultantService.completeConsultation(id, data);
              fetchConsultations(consultationsPagination.page);
            }}
            onRefresh={() => fetchConsultations(consultationsPagination.page)}
          />);
      case 'patients':
        return (
          <MyPatients
            patients={patients}
            pagination={patientsPagination}
            onPageChange={(page) => handlePageChangeTable(page, 'patients')}
            onSearch={fetchPatients}
            onViewPatient={(id) => {
              setSelectedPatient(id);
              setActivePage('tracking');
            }}
            onRefresh={() => fetchPatients(patientsPagination.page)}
          />);
      case 'tracking':
        return (
          <PatientTracking
            patientId={selectedPatient}
            trackingData={patientTracking}
            onUpdateStatus={async (status) => {
              await consultantService.updatePatientStatus(selectedPatient, status);
              fetchPatientTracking(selectedPatient);
            }}
            onRefresh={() => fetchPatientTracking(selectedPatient)}
          />);
      case 'notifications':
        return (
          <Notifications
            notifications={notifications}
            pagination={notificationsPagination}
            onPageChange={(page) => handlePageChangeTable(page, 'notifications')}
            onMarkRead={async (id) => {
              await consultantService.markNotificationRead(id);
              fetchNotifications(notificationsPagination.page);
            }}
            onMarkAllRead={async () => {
              await consultantService.markAllRead();
              fetchNotifications(notificationsPagination.page);
            }}
            onRefresh={() => fetchNotifications(notificationsPagination.page)}
          />);
      default:
        return (
          <Dashboard
            stats={dashboardStats}
            schedule={schedule}
            notifications={notifications}
            onRefresh={fetchDashboardData}
          />);
    }
  };

  // Fetch data on page change
  useEffect(() => {
    if (activePage === 'requests') {
      fetchRequests();
    } else if (activePage === 'consultations') {
      fetchConsultations();
    } else if (activePage === 'patients') {
      fetchPatients();
    } else if (activePage === 'notifications') {
      fetchNotifications();
    } else if (activePage === 'tracking' && selectedPatient) {
      fetchPatientTracking(selectedPatient);
    }
  }, [activePage]);

  return (
    <div className="d-flex position-relative" style={shellStyles.layout}>
      <Sidebar
        activePage={activePage}
        setActivePage={handlePageChange}
        user={user}
        isOpen={sidebarOpen}
        onClose={toggleSidebar}
      />
      <div className="flex-grow-1 d-flex flex-column overflow-x-hidden" style={{ minWidth: 0 }}>
        <Header
          user={user}
          notifications={notifications}
          setActivePage={setActivePage}
          toggleSidebar={toggleSidebar}
        />
        <main className="flex-grow-1 overflow-auto p-3 p-md-4 p-xl-5">
          {renderContent()}
        </main>
      </div>
    </div>);
};

export default ConsultantDashboard;
