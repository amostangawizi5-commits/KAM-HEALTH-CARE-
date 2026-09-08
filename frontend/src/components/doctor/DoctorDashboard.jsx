// src/components/doctor/DoctorDashboard.jsx
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { doctorService } from '../../services/api';
import Sidebar from './Sidebar';
import Header from './Header';
import Dashboard from './Dashboard';
import MyPatients from './MyPatients';
import Consultations from './Consultations';
import LabRequests from './LabRequests';
import Prescriptions from './Prescriptions';
import PatientTracking from './PatientTracking';

const DoctorDashboard = () => {
  const { user } = useContext(AuthContext);
  const [activePage, setActivePage] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Data states
  const [dashboardStats, setDashboardStats] = useState(null);
  const [patients, setPatients] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [labRequests, setLabRequests] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientTracking, setPatientTracking] = useState(null);

  // Pagination states
  const [patientsPagination, setPatientsPagination] = useState({ page: 1, total: 0, limit: 10 });
  const [consultationsPagination, setConsultationsPagination] = useState({ page: 1, total: 0, limit: 10 });
  const [labPagination, setLabPagination] = useState({ page: 1, total: 0, limit: 10 });
  const [prescriptionsPagination, setPrescriptionsPagination] = useState({ page: 1, total: 0, limit: 10 });

  // Fetch all data on load
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [statsRes, scheduleRes, notificationsRes] = await Promise.all([
        doctorService.getDashboardStats(),
        doctorService.getTodaySchedule(),
        doctorService.getNotifications(),
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

  // Fetch patients
  const fetchPatients = async (page = 1, search = '') => {
    try {
      setLoading(true);
      const response = await doctorService.getPatients({ page, limit: 10, search });
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

  // Fetch consultations
  const fetchConsultations = async (page = 1, status = '') => {
    try {
      setLoading(true);
      const response = await doctorService.getConsultations({ page, limit: 10, status });
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

  // Fetch lab requests
  const fetchLabRequests = async (page = 1, status = '') => {
    try {
      setLoading(true);
      const response = await doctorService.getLabRequests({ page, limit: 10, status });
      setLabRequests(response.data.requests);
      setLabPagination({
        page: response.data.page,
        total: response.data.total,
        limit: response.data.limit,
      });
    } catch (err) {
      setError('Failed to load lab requests');
    } finally {
      setLoading(false);
    }
  };

  // Fetch prescriptions
  const fetchPrescriptions = async (page = 1, status = '') => {
    try {
      setLoading(true);
      const response = await doctorService.getPrescriptions({ page, limit: 10, status });
      setPrescriptions(response.data.prescriptions);
      setPrescriptionsPagination({
        page: response.data.page,
        total: response.data.total,
        limit: response.data.limit,
      });
    } catch (err) {
      setError('Failed to load prescriptions');
    } finally {
      setLoading(false);
    }
  };

  // Fetch patient tracking
  const fetchPatientTracking = async (patientId) => {
    try {
      setLoading(true);
      const response = await doctorService.getPatientTracking(patientId);
      setPatientTracking(response.data);
    } catch (err) {
      setError('Failed to load patient tracking');
    } finally {
      setLoading(false);
    }
  };

  // Handle page change
  const handlePageChange = (page, type) => {
    switch(type) {
      case 'patients':
        fetchPatients(page);
        break;
      case 'consultations':
        fetchConsultations(page);
        break;
      case 'lab':
        fetchLabRequests(page);
        break;
      case 'prescriptions':
        fetchPrescriptions(page);
        break;
      default:
        break;
    }
  };

  // Render content based on active page
  const renderContent = () => {
    if (loading) {
      return (
        <div className="d-flex flex-column align-items-center justify-content-center py-5">
          <div className="spinner-border text-success" role="status" aria-label="Loading"></div>
          <p className="text-secondary mt-3 mb-0">Loading...</p>
        </div>);
    }

    if (error) {
      return (
        <div className="card border-0 shadow-sm text-center">
          <div className="card-body py-5">
          <span className="d-block h4 text-warning">Warning</span>
          <p className="text-secondary">{error}</p>
          <button onClick={() => window.location.reload()} className="btn btn-success fw-semibold">
            Retry
          </button>
          </div>
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
      case 'patients':
        return (
          <MyPatients
            patients={patients}
            pagination={patientsPagination}
            onPageChange={(page) => handlePageChange(page, 'patients')}
            onSearch={fetchPatients}
            onViewPatient={(id) => {
              setSelectedPatient(id);
              setActivePage('tracking');
            }}
            onRefresh={() => fetchPatients(patientsPagination.page)}
          />);
      case 'consultations':
        return (
          <Consultations
            consultations={consultations}
            pagination={consultationsPagination}
            onPageChange={(page) => handlePageChange(page, 'consultations')}
            onFilter={fetchConsultations}
            onStartConsultation={async (id) => {
              await doctorService.startConsultation(id);
              fetchConsultations(consultationsPagination.page);
            }}
            onCompleteConsultation={async (id, data) => {
              await doctorService.completeConsultation(id, data);
              fetchConsultations(consultationsPagination.page);
            }}
            onRefresh={() => fetchConsultations(consultationsPagination.page)}
          />);
      case 'lab-requests':
        return (
          <LabRequests
            labRequests={labRequests}
            pagination={labPagination}
            onPageChange={(page) => handlePageChange(page, 'lab')}
            onFilter={fetchLabRequests}
            onCreateRequest={async (data) => {
              await doctorService.createLabRequest(data);
              fetchLabRequests(labPagination.page);
            }}
            onRefresh={() => fetchLabRequests(labPagination.page)}
          />);
      case 'prescriptions':
        return (
          <Prescriptions
            prescriptions={prescriptions}
            pagination={prescriptionsPagination}
            onPageChange={(page) => handlePageChange(page, 'prescriptions')}
            onFilter={fetchPrescriptions}
            onCreatePrescription={async (data) => {
              await doctorService.createPrescription(data);
              fetchPrescriptions(prescriptionsPagination.page);
            }}
            onRefill={async (id) => {
              await doctorService.refillPrescription(id);
              fetchPrescriptions(prescriptionsPagination.page);
            }}
            onRefresh={() => fetchPrescriptions(prescriptionsPagination.page)}
          />);
      case 'tracking':
        return (
          <PatientTracking
            patientId={selectedPatient}
            trackingData={patientTracking}
            onUpdateStatus={async (status) => {
              await doctorService.updatePatientStatus(selectedPatient, status);
              fetchPatientTracking(selectedPatient);
            }}
            onRefresh={() => fetchPatientTracking(selectedPatient)}
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

  // Initial data fetch for active page
  useEffect(() => {
    if (activePage === 'patients') {
      fetchPatients();
    } else if (activePage === 'consultations') {
      fetchConsultations();
    } else if (activePage === 'lab-requests') {
      fetchLabRequests();
    } else if (activePage === 'prescriptions') {
      fetchPrescriptions();
    } else if (activePage === 'tracking' && selectedPatient) {
      fetchPatientTracking(selectedPatient);
    }
  }, [activePage]);

  return (
    <div className="d-flex min-vh-100 bg-light">
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        user={user}
      />
      <div className="flex-grow-1 d-flex flex-column" style={{ minWidth: 0 }}>
        <Header
          user={user}
          notifications={notifications}
          setActivePage={setActivePage}
        />
        <main className="flex-grow-1 overflow-auto p-3 p-md-4">
          {renderContent()}
        </main>
      </div>
    </div>);
};

export default DoctorDashboard;
