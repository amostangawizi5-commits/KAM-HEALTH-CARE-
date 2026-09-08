import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AppShell from '../components/common/AppShell';
import { useAuth } from '../hooks/useAuth';
import { doctorService } from '../services/api';

const sidebarItems = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'patients', label: 'My Patients' },
  { id: 'consultations', label: 'Consultations' },
  { id: 'laboratory', label: 'Laboratory Requests' },
  { id: 'prescriptions', label: 'Prescriptions' },
  { id: 'tracking', label: 'Patient Tracking' },
  { id: 'notifications', label: 'Notifications' },
];

const sectionSubmenus = {
  dashboard: ['Overview', 'Waiting Patients', 'Today Status'],
  patients: ['Assigned Queue', 'Patient Details', 'Start Consultation'],
  consultations: ['Patient Summary', 'Clinical Notes', 'Next Action'],
  laboratory: ['Select Tests', 'Pending Requests', 'Results'],
  prescriptions: ['Medicine', 'Dosage', 'Instructions', 'Pharmacy'],
  tracking: ['Workflow Status', 'Laboratory', 'Pharmacy', 'Complete'],
  notifications: ['Unread Alerts', 'Workflow Updates'],
};

const submenuTargets = {
  dashboard: {
    Overview: 'dashboard',
    'Waiting Patients': 'patients',
    'Today Status': 'dashboard',
  },
  patients: {
    'Assigned Queue': 'patients',
    'Patient Details': 'patients',
    'Start Consultation': 'consultations',
  },
  consultations: {
    'Patient Summary': 'consultations',
    'Clinical Notes': 'consultations',
    'Next Action': 'tracking',
  },
  laboratory: {
    'Select Tests': 'laboratory',
    'Pending Requests': 'laboratory',
    Results: 'laboratory',
  },
  prescriptions: {
    Medicine: 'prescriptions',
    Dosage: 'prescriptions',
    Instructions: 'prescriptions',
    Pharmacy: 'prescriptions',
  },
  tracking: {
    'Workflow Status': 'tracking',
    Laboratory: 'laboratory',
    Pharmacy: 'prescriptions',
    Complete: 'tracking',
  },
  notifications: {
    'Unread Alerts': 'notifications',
    'Workflow Updates': 'tracking',
  },
};

const defaultPatients = [
  {
    id: 1,
    name: 'John Doe',
    gender: 'Male',
    age: 34,
    queue: '01',
    time: '2 min',
    reason: 'Headache and fever',
    status: 'Waiting for Doctor',
    history: [
      'Malaria treated in 2025',
      'No known allergies',
    ],
    visits: [
      'Consultant assessment today',
      'Outpatient visit - 12 Jun 2026',
    ],
  },
  {
    id: 2,
    name: 'Jane Smith',
    gender: 'Female',
    age: 29,
    queue: '02',
    time: '5 min',
    reason: 'Chest pain',
    status: 'Waiting for Doctor',
    history: [
      'Hypertension follow-up',
      'Family history of asthma',
    ],
    visits: [
      'Consultant assessment today',
      'Emergency review - 04 May 2026',
    ],
  },
];

const labTestOptions = [
  'Full Blood Count',
  'Malaria RDT',
  'Blood Sugar',
  'Urine Analysis',
  'Chest X-Ray',
  'ECG',
  'Sputum Test',
  'COVID-19 Test',
];

const medicineOptions = [
  'Paracetamol',
  'Amoxicillin',
  'Ibuprofen',
  'Metformin',
  'ORS',
  'Cetirizine',
];

const emptyConsultation = {
  symptoms: '',
  examination: '',
  diagnosis: '',
  treatmentPlan: '',
  notes: '',
};

const emptyPrescription = {
  medicine: '',
  dosage: '',
  frequency: '',
  duration: '',
  instructions: '',
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

const visitToDoctorPatient = (visit) => {
  const patient = visit.Patient || visit.patient || {};
  const assessment = visit.ConsultantAssessment || visit.consultantAssessment || {};
  const consultant = assessment.consultant;

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
    reason: assessment.chiefComplaint || visit.visitReason || 'From Consultant',
    status: visit.status === 'UNDER_DOCTOR' ? 'With Doctor' : 'Waiting for Doctor',
    rawStatus: visit.status,
    consultantName: consultant
      ? [consultant.firstName, consultant.lastName].filter(Boolean).join(' ')
      : 'Consultant',
    assessment,
    history: [
      patient.allergies ? `Allergies: ${patient.allergies}` : 'No allergies recorded',
      assessment.medicalHistory || 'No medical history recorded yet',
    ],
    visits: [
      'Consultant assessment today',
      assessment.notes ? `Consultant notes: ${assessment.notes}` : 'No consultant notes recorded',
    ],
  };
};

const DoctorDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, login } = useAuth();

  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [screenLocked, setScreenLocked] = useState(false);
  const [lockPassword, setLockPassword] = useState('');
  const [lockError, setLockError] = useState('');
  const [lockLoading, setLockLoading] = useState(false);

  const [waitingPatients, setWaitingPatients] =
    useState([]);

  const [currentPatient, setCurrentPatient] = useState(null);

  const [completedPatients, setCompletedPatients] =
    useState([]);

  const [consultation, setConsultation] =
    useState(emptyConsultation);

  const [prescription, setPrescription] =
    useState(emptyPrescription);

  const [labNotes, setLabNotes] = useState('');

  const [selectedTests, setSelectedTests] =
    useState([]);

  const [labRequests, setLabRequests] =
    useState([]);

  const [labResults, setLabResults] =
    useState([]);

  const [modal, setModal] = useState(null);
  const [loadingQueue, setLoadingQueue] = useState(false);
  const [queueError, setQueueError] = useState('');

  const loadDoctorQueue = async () => {
    setLoadingQueue(true);
    setQueueError('');

    try {
      const response = await doctorService.getQueue();
      setWaitingPatients((response.data.data || []).map(visitToDoctorPatient));
    } catch (error) {
      setQueueError(error?.response?.data?.message || 'Unable to load doctor queue.');
    } finally {
      setLoadingQueue(false);
    }
  };

  /* ===============================
     RECEIVED PATIENT FROM CONSULTANT
  =============================== */

  useEffect(() => {
    loadDoctorQueue();
  }, []);

  useEffect(() => {
    const transferredPatient =
      location.state?.transferredPatient ||
      JSON.parse(
        sessionStorage.getItem('transferredPatient') ||
          'null'
      );

    if (!transferredPatient) return;

    const incomingPatient = {
      ...transferredPatient,
      queue: transferredPatient.queue || '03',
      time: 'Just now',
      reason:
        transferredPatient.assessment?.chiefComplaint ||
        transferredPatient.reason ||
        'From Consultant',
      status: 'Waiting for Doctor',
      history:
        transferredPatient.history || [
          'No medical history recorded yet',
        ],
      visits:
        transferredPatient.visits || [
          'Consultant assessment today',
        ],
    };

    setWaitingPatients((prev) => {
      const alreadyListed = prev.some(
        (patient) =>
          patient.id === incomingPatient.id &&
          patient.name === incomingPatient.name
      );

      return alreadyListed
        ? prev
        : [incomingPatient, ...prev];
    });

    setCurrentPatient(incomingPatient);

    setConsultation({
      symptoms: incomingPatient.reason || '',
      examination: '',
      diagnosis: '',
      treatmentPlan: '',
      notes:
        transferredPatient.assessment?.notes || '',
    });

    setActiveSection('consultations');

    sessionStorage.removeItem('transferredPatient');
  }, [location.state]);

  /* ===============================
     USER
  =============================== */

  const displayUser = useMemo(
    () => ({
      ...user,
      name:
        [user?.firstName, user?.lastName]
          .filter(Boolean)
          .join(' ') ||
        user?.name ||
        'Doctor',
    }),
    [user]
  );

  /* ===============================
     PATIENT STATUS
  =============================== */

  const patientStatuses = useMemo(() => {
    return waitingPatients.map((patient) => {
      const hasLabRequest = labRequests.some(
        (request) =>
          request.patientId === patient.id
      );

      const hasLabResult = labResults.some(
        (result) =>
          result.patientId === patient.id
      );

      const isCompleted = completedPatients.some(
        (item) => item.id === patient.id
      );

      if (isCompleted) {
        return {
          ...patient,
          status: 'Completed',
        };
      }

      if (hasLabResult) {
        return {
          ...patient,
          status: 'Doctor Review',
        };
      }

      if (hasLabRequest) {
        return {
          ...patient,
          status: 'At Laboratory',
        };
      }

      if (currentPatient?.id === patient.id) {
        return {
          ...patient,
          status: 'With Doctor',
        };
      }

      return patient;
    });
  }, [
    completedPatients,
    currentPatient,
    labRequests,
    labResults,
    waitingPatients,
  ]);

  /* ===============================
     DASHBOARD STATISTICS
  =============================== */

  const dashboardStats = [
    {
      label: 'Patients Assigned',
      value: patientStatuses.length,
      icon: 'PA',
      target: 'patients',
    },
    {
      label: 'Waiting Patients',
      value: patientStatuses.filter(
        (patient) =>
          patient.status ===
          'Waiting for Doctor'
      ).length,
      icon: 'WP',
      target: 'patients',
    },
    {
      label: 'Pending Lab Results',
      value: labRequests.filter(
        (request) => !request.result
      ).length,
      icon: 'LR',
      target: 'laboratory',
    },
    {
      label: 'Pending Prescriptions',
      value:
        prescription.medicine && currentPatient
          ? 1
          : 0,
      icon: 'RX',
      target: 'prescriptions',
    },
    {
      label: "Today's Consultations",
      value:
        completedPatients.length +
        (currentPatient ? 1 : 0),
      icon: 'TC',
      target: 'consultations',
    },
  ];

  /* ===============================
     NOTIFICATIONS
  =============================== */

  const notifications = useMemo(
    () => [
      {
        id: 'waiting',
        read: waitingPatients.length === 0,
        message: `${waitingPatients.length} patients waiting for doctor review`,
      },
      {
        id: 'lab',
        read:
          labRequests.filter(
            (request) => !request.result
          ).length === 0,
        message: `${
          labRequests.filter(
            (request) => !request.result
          ).length
        } pending laboratory results`,
      },
    ],
    [labRequests, waitingPatients.length]
  );

  /* ===============================
     SELECT PATIENT
  =============================== */

  const handleSelectPatient = (patient) => {
    const openPatient = {
      ...patient,
      status: 'With Doctor',
      rawStatus: 'UNDER_DOCTOR',
    };

    setCurrentPatient(openPatient);

    if (patient.visitId || patient.id) {
      doctorService.startConsultation(patient.visitId || patient.id)
        .then((response) => {
          const updatedPatient = {
            ...openPatient,
            ...visitToDoctorPatient(response.data.data),
            status: 'With Doctor',
            rawStatus: 'UNDER_DOCTOR',
          };
          setCurrentPatient(updatedPatient);
          setWaitingPatients((prev) => prev.map((item) => (
            item.id === updatedPatient.id ? updatedPatient : item
          )));
        })
        .catch(() => {});
    }

    setConsultation({
      symptoms: patient.reason || '',
      examination: '',
      diagnosis: '',
      treatmentPlan: '',
      notes: '',
    });

    setPrescription(emptyPrescription);
    setSelectedTests([]);
    setLabNotes('');

    setModal(null);

    setActiveSection('consultations');
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

  /* ===============================
     CONSULTATION
  =============================== */

  const handleConsultationChange = (
    field,
    value
  ) => {
    setConsultation((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  /* ===============================
     PRESCRIPTION
  =============================== */

  const handlePrescriptionChange = (
    field,
    value
  ) => {
    setPrescription((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  /* ===============================
     LAB TEST
  =============================== */

  const handleToggleLabTest = (test) => {
    setSelectedTests((prev) =>
      prev.includes(test)
        ? prev.filter((item) => item !== test)
        : [...prev, test]
    );
  };

  const handleRequestLab = () => {
    if (!currentPatient) {
      alert('Please select a patient first.');
      setActiveSection('patients');
      return;
    }

    if (selectedTests.length === 0) {
      alert(
        'Please select at least one laboratory test.'
      );
      return;
    }

    const request = {
      id: Date.now(),
      patientId: currentPatient.id,
      patientName: currentPatient.name,
      tests: selectedTests,
      notes:
        labNotes || consultation.notes,
      status: 'Pending results',
      requestedAt:
        new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
    };

    setLabRequests((prev) => [
      request,
      ...prev,
    ]);

    setSelectedTests([]);
    setLabNotes([]);

    setActiveSection('laboratory');
  };

  /* ===============================
     RECEIVE LAB RESULT
  =============================== */

  const handleReceiveLabResult = (request) => {
    const result = {
      ...request,
      result:
        'Results received. Review diagnosis and treatment plan.',
      status: 'Result ready',
    };

    setLabResults((prev) => [
      result,
      ...prev.filter(
        (item) => item.id !== request.id
      ),
    ]);

    setLabRequests((prev) =>
      prev.map((item) =>
        item.id === request.id
          ? result
          : item
      )
    );

    setModal(null);
    setActiveSection('laboratory');
  };

  /* ===============================
     SEND TO PHARMACY
  =============================== */

  const handleSendToPharmacy = async () => {
    if (!currentPatient) {
      alert('Please select a patient first.');
      setActiveSection('patients');
      return;
    }

    if (
      !prescription.medicine ||
      !prescription.dosage ||
      !prescription.frequency ||
      !prescription.duration
    ) {
      alert(
        'Please complete medicine, dosage, frequency, and duration.'
      );
      setActiveSection('prescriptions');
      return;
    }

    try {
      await doctorService.saveConsultation({
        visitId: currentPatient.visitId || currentPatient.id,
        doctorId: user?.id,
        observations: consultation.examination,
        diagnosis: consultation.diagnosis,
        treatmentPlan: consultation.treatmentPlan,
        notes: consultation.notes || consultation.symptoms,
        decision: 'SEND_PHARMACY',
      });

      setCompletedPatients((prev) => [
        {
          ...currentPatient,
          status: 'Sent to Pharmacy',
        },
        ...prev,
      ]);

      setWaitingPatients((prev) =>
        prev.filter(
          (patient) =>
            patient.id !== currentPatient.id
        )
      );

      setCurrentPatient(null);
      setPrescription(emptyPrescription);
      setConsultation(emptyConsultation);

      setModal(null);
      setActiveSection('tracking');
    } catch (error) {
      alert(error?.response?.data?.message || 'Unable to send patient to Pharmacy.');
    }
  };

  /* ===============================
     COMPLETE TREATMENT
  =============================== */

  const handleCompleteTreatment = async () => {
    if (!currentPatient) {
      alert('Please select a patient first.');
      return;
    }

    try {
      await doctorService.saveConsultation({
        visitId: currentPatient.visitId || currentPatient.id,
        doctorId: user?.id,
        observations: consultation.examination,
        diagnosis: consultation.diagnosis,
        treatmentPlan: consultation.treatmentPlan,
        notes: consultation.notes || consultation.symptoms,
        decision: 'DISCHARGE',
      });

      setCompletedPatients((prev) => [
        {
          ...currentPatient,
          status: 'Completed Treatment',
        },
        ...prev,
      ]);

      setWaitingPatients((prev) =>
        prev.filter(
          (patient) =>
            patient.id !== currentPatient.id
        )
      );

      setCurrentPatient(null);
      setPrescription(emptyPrescription);
      setConsultation(emptyConsultation);

      setModal(null);
    } catch (error) {
      alert(error?.response?.data?.message || 'Unable to complete treatment.');
    }
  };

  /* ===============================
     PATIENT SUMMARY
  =============================== */

  const PatientSummary = () => (
    <div className="alert alert-success d-flex align-items-center gap-3 mb-0">
      <span className="fs-4">🩺</span>

      <div>
        <small className="d-block text-uppercase fw-bold">
          Current Patient
        </small>

        <strong>
          {currentPatient
            ? currentPatient.name
            : 'No patient selected'}
        </strong>
      </div>
    </div>
  );

  /* ===============================
     DASHBOARD
  =============================== */

  const renderDashboard = () => (
    <>
      <section className="row g-3">
        {dashboardStats.map((item) => (
          <div
            className="col-12 col-sm-6 col-xl"
            key={item.label}
          >
            <button
              type="button"
              className="doctor-stat-card card border-0 shadow-sm h-100"
              onClick={() => setActiveSection(item.target)}
            >
              <div className="card-body">
                <div className="d-flex justify-content-between">
                  <div>
                    <small className="text-secondary fw-semibold">
                      {item.label}
                    </small>

                    <h2 className="display-6 fw-bold mt-2 mb-0">
                      {item.value}
                    </h2>
                  </div>

                  <span className="fs-2">
                    {item.icon}
                  </span>
                </div>
              </div>
            </button>
          </div>
        ))}
      </section>

      <section className="card border-0 shadow-sm mt-4">
        <div className="card-body">
          {queueError && (
            <div className="alert alert-warning">
              {queueError}
            </div>
          )}

          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-3">
            <h2 className="h4 fw-bold mb-0">
              Waiting Patients
            </h2>

            <span className="badge text-bg-success rounded-pill">
              {waitingPatients.length} queued
            </span>
          </div>

          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">

              <thead className="table-success">
                <tr>
                  <th>#</th>
                  <th>Patient</th>
                  <th>Age</th>
                  <th>Complaint</th>
                  <th>Time</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {loadingQueue ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="text-center text-secondary py-4"
                    >
                      Loading doctor queue...
                    </td>
                  </tr>
                ) : patientStatuses.map((patient) => (
                  <tr key={patient.id}>

                    <td>
                      <span className="badge text-bg-success">
                        {patient.queue}
                      </span>
                    </td>

                    <td>
                      <strong>
                        {patient.name}
                      </strong>
                    </td>

                    <td>{patient.age || '-'}</td>

                    <td>
                      {patient.reason}
                    </td>

                    <td>
                      {patient.time}
                    </td>

                    <td>
                      <span className="badge text-bg-warning">
                        {patient.status}
                      </span>
                    </td>

                    <td>
                      <button
                        type="button"
                        className="btn btn-sm btn-success"
                        onClick={() =>
                          handleSelectPatient(patient)
                        }
                      >
                        Open
                      </button>
                    </td>

                  </tr>
                ))}

                {!loadingQueue && patientStatuses.length === 0 && (
                  <tr>
                    <td
                      colSpan="7"
                      className="text-center text-secondary py-4"
                    >
                      No waiting patients.
                    </td>
                  </tr>
                )}
              </tbody>

            </table>
          </div>

        </div>
      </section>
    </>
  );

  /* ===============================
     PATIENTS
  =============================== */

  const renderPatients = () => (
    <section className="card border-0 shadow-sm">

      <div className="card-body">

        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">

          <div>
            <h2 className="h4 fw-bold mb-1">
              My Patients
            </h2>

            <small className="text-secondary">
              Patients assigned to you for treatment
            </small>
          </div>

          <span className="badge text-bg-success">
            {patientStatuses.length} Patients
          </span>

        </div>

        <div className="table-responsive">

          <table className="table table-hover align-middle">

            <thead className="table-success">

              <tr>
                <th>Queue</th>
                <th>Patient</th>
                <th>Gender</th>
                <th>Age</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Action</th>
              </tr>

            </thead>

            <tbody>

              {patientStatuses.map((patient) => (
                <tr key={patient.id}>

                  <td>
                    <span className="badge text-bg-success">
                      #{patient.queue}
                    </span>
                  </td>

                  <td>
                    <strong>
                      {patient.name}
                    </strong>
                  </td>

                  <td>
                    {patient.gender || '-'}
                  </td>

                  <td>
                    {patient.age || '-'}
                  </td>

                  <td>
                    {patient.reason}
                  </td>

                  <td>
                    <span className="badge text-bg-warning">
                      {patient.status}
                    </span>
                  </td>

                  <td>

                    <button
                      type="button"
                      className="btn btn-sm btn-outline-success"
                      onClick={() => {
                        setCurrentPatient(patient);
                        setModal('patient');
                      }}
                    >
                      View
                    </button>

                    <button
                      type="button"
                      className="btn btn-sm btn-success ms-2"
                      onClick={() =>
                        handleSelectPatient(patient)
                      }
                    >
                      Consult
                    </button>

                  </td>

                </tr>
              ))}

            </tbody>

          </table>

        </div>

      </div>

    </section>
  );

  /* ===============================
     CONSULTATIONS
  =============================== */

  const renderConsultations = () => (
    <section className="card border-0 shadow-sm">

      <div className="card-body">

        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">

          <div>
            <h2 className="h4 fw-bold mb-1">
              Consultations
            </h2>

            <small className="text-secondary">
              Clinical assessment and treatment planning
            </small>
          </div>

          <PatientSummary />

        </div>

        {!currentPatient ? (
          <div className="text-center py-5">

            <div className="display-4 mb-3">
              🩺
            </div>

            <h3 className="h5 fw-bold">
              No Patient Selected
            </h3>

            <p className="text-secondary">
              Select a patient before starting consultation.
            </p>

            <button
              type="button"
              className="btn btn-success"
              onClick={() =>
                setActiveSection('patients')
              }
            >
              Open My Patients
            </button>

          </div>
        ) : (
          <div className="row g-4">

            <div className="col-12 col-md-6">
              {currentPatient.assessment && (
                <div className="alert alert-info mb-0 h-100">
                  <strong className="d-block mb-2">
                    Consultant Assessment
                  </strong>
                  <div className="small">
                    <div>
                      <strong>Consultant:</strong> {currentPatient.consultantName}
                    </div>
                    <div>
                      <strong>Complaint:</strong> {currentPatient.assessment.chiefComplaint || currentPatient.reason}
                    </div>
                    <div>
                      <strong>Vitals:</strong>{' '}
                      {[
                        currentPatient.assessment.temperature && `${currentPatient.assessment.temperature} C`,
                        currentPatient.assessment.bloodPressureSystolic && currentPatient.assessment.bloodPressureDiastolic && `${currentPatient.assessment.bloodPressureSystolic}/${currentPatient.assessment.bloodPressureDiastolic}`,
                        currentPatient.assessment.pulseRate && `${currentPatient.assessment.pulseRate} bpm`,
                        currentPatient.assessment.oxygenSaturation && `${currentPatient.assessment.oxygenSaturation}% SpO2`,
                      ].filter(Boolean).join(' | ') || 'Not recorded'}
                    </div>
                    {currentPatient.assessment.medicalHistory && (
                      <div>
                        <strong>History:</strong> {currentPatient.assessment.medicalHistory}
                      </div>
                    )}
                    {currentPatient.assessment.notes && (
                      <div>
                        <strong>Notes:</strong> {currentPatient.assessment.notes}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="col-12 col-md-6">

              <label className="form-label fw-semibold">
                Symptoms / Complaints
              </label>

              <textarea
                className="form-control"
                rows="4"
                value={consultation.symptoms}
                onChange={(e) =>
                  handleConsultationChange(
                    'symptoms',
                    e.target.value
                  )
                }
              />

            </div>

            <div className="col-12 col-md-6">

              <label className="form-label fw-semibold">
                Clinical Examination
              </label>

              <textarea
                className="form-control"
                rows="4"
                value={consultation.examination}
                onChange={(e) =>
                  handleConsultationChange(
                    'examination',
                    e.target.value
                  )
                }
              />

            </div>

            <div className="col-12 col-md-6">

              <label className="form-label fw-semibold">
                Diagnosis
              </label>

              <textarea
                className="form-control"
                rows="4"
                value={consultation.diagnosis}
                onChange={(e) =>
                  handleConsultationChange(
                    'diagnosis',
                    e.target.value
                  )
                }
              />

            </div>

            <div className="col-12 col-md-6">

              <label className="form-label fw-semibold">
                Treatment Plan
              </label>

              <textarea
                className="form-control"
                rows="4"
                value={consultation.treatmentPlan}
                onChange={(e) =>
                  handleConsultationChange(
                    'treatmentPlan',
                    e.target.value
                  )
                }
              />

            </div>

            <div className="col-12">

              <label className="form-label fw-semibold">
                Consultation Notes
              </label>

              <textarea
                className="form-control"
                rows="3"
                value={consultation.notes}
                onChange={(e) =>
                  handleConsultationChange(
                    'notes',
                    e.target.value
                  )
                }
              />

            </div>

            <div className="col-12 d-flex justify-content-end gap-2 flex-wrap">

              <button
                type="button"
                className="btn btn-outline-success"
                onClick={() =>
                  setActiveSection('laboratory')
                }
              >
                Request Laboratory
              </button>

              <button
                type="button"
                className="btn btn-success"
                onClick={() =>
                  setActiveSection('prescriptions')
                }
              >
                Continue to Prescription
              </button>

            </div>

          </div>
        )}

      </div>

    </section>
  );

  /* ===============================
     LABORATORY
  =============================== */

  const renderLaboratory = () => (
    <section className="card border-0 shadow-sm">

      <div className="card-body">

        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">

          <div>
            <h2 className="h4 fw-bold mb-1">
              Laboratory Requests
            </h2>

            <small className="text-secondary">
              Request and review laboratory investigations
            </small>
          </div>

          <PatientSummary />

        </div>

        <div className="row g-4">

          <div className="col-12 col-lg-5">

            <div className="card border shadow-sm h-100">

              <div className="card-body">

                <h3 className="h5 fw-bold mb-3">
                  Select Tests
                </h3>

                <div className="row g-2">

                  {labTestOptions.map((test) => (
                    <div
                      className="col-12 col-sm-6"
                      key={test}
                    >

                      <label className="border rounded p-3 d-flex align-items-center gap-2 h-100">

                        <input
                          className="form-check-input m-0"
                          type="checkbox"
                          checked={selectedTests.includes(test)}
                          onChange={() =>
                            handleToggleLabTest(test)
                          }
                        />

                        <span>{test}</span>

                      </label>

                    </div>
                  ))}

                </div>

                <label className="form-label fw-semibold mt-4">
                  Clinical Notes

                  <textarea
                    className="form-control mt-1"
                    rows="4"
                    value={labNotes}
                    onChange={(e) =>
                      setLabNotes(e.target.value)
                    }
                  />
                </label>

                <button
                  type="button"
                  className="btn btn-success w-100"
                  onClick={handleRequestLab}
                >
                  Send Laboratory Request
                </button>

              </div>

            </div>

          </div>


          <div className="col-12 col-lg-7">

            <div className="card border shadow-sm">

              <div className="card-body">

                <h3 className="h5 fw-bold mb-3">
                  Laboratory Requests
                </h3>

                <div className="table-responsive">

                  <table className="table table-hover align-middle">

                    <thead className="table-success">
                      <tr>
                        <th>Patient</th>
                        <th>Tests</th>
                        <th>Time</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>

                    <tbody>

                      {labRequests
                        .filter(
                          (request) =>
                            !request.result
                        )
                        .map((request) => (
                          <tr key={request.id}>

                            <td>
                              <strong>
                                {request.patientName}
                              </strong>
                            </td>

                            <td>
                              {request.tests.join(', ')}
                            </td>

                            <td>
                              {request.requestedAt}
                            </td>

                            <td>
                              <span className="badge text-bg-warning">
                                Pending
                              </span>
                            </td>

                            <td>

                              <button
                                type="button"
                                className="btn btn-sm btn-success"
                                onClick={() => {
                                  setModal({
                                    type: 'labResult',
                                    request,
                                  });
                                }}
                              >
                                Receive Result
                              </button>

                            </td>

                          </tr>
                        ))}

                    </tbody>

                  </table>

                </div>


                <h3 className="h5 fw-bold mt-4 mb-3">
                  Laboratory Results
                </h3>

                <div className="table-responsive">

                  <table className="table table-hover align-middle">

                    <thead className="table-light">
                      <tr>
                        <th>Patient</th>
                        <th>Tests</th>
                        <th>Result</th>
                        <th>Status</th>
                      </tr>
                    </thead>

                    <tbody>

                      {labResults.map((result) => (
                        <tr key={result.id}>

                          <td>
                            {result.patientName}
                          </td>

                          <td>
                            {result.tests.join(', ')}
                          </td>

                          <td>
                            {result.result}
                          </td>

                          <td>
                            <span className="badge text-bg-success">
                              Ready
                            </span>
                          </td>

                        </tr>
                      ))}

                      {labResults.length === 0 && (
                        <tr>
                          <td
                            colSpan="4"
                            className="text-center text-secondary"
                          >
                            No laboratory results received.
                          </td>
                        </tr>
                      )}

                    </tbody>

                  </table>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

    </section>
  );

  /* ===============================
     PRESCRIPTIONS
  =============================== */

  const renderPrescriptions = () => (
    <section className="card border-0 shadow-sm">

      <div className="card-body">

        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">

          <div>
            <h2 className="h4 fw-bold mb-1">
              Prescriptions
            </h2>

            <small className="text-secondary">
              Prepare medication for the patient
            </small>
          </div>

          <PatientSummary />

        </div>

        {!currentPatient ? (
          <div className="text-center py-5">

            <p className="text-secondary">
              Select a patient before prescribing medicine.
            </p>

            <button
              type="button"
              className="btn btn-success"
              onClick={() =>
                setActiveSection('patients')
              }
            >
              Open My Patients
            </button>

          </div>
        ) : (
          <div className="row g-3">

            <div className="col-12 col-md-6">

              <label className="form-label fw-semibold">
                Medicine
              </label>

              <select
                className="form-select"
                value={prescription.medicine}
                onChange={(e) =>
                  handlePrescriptionChange(
                    'medicine',
                    e.target.value
                  )
                }
              >
                <option value="">
                  Choose medicine
                </option>

                {medicineOptions.map(
                  (medicine) => (
                    <option
                      key={medicine}
                      value={medicine}
                    >
                      {medicine}
                    </option>
                  )
                )}
              </select>

            </div>


            <div className="col-12 col-md-6">

              <label className="form-label fw-semibold">
                Dosage
              </label>

              <input
                className="form-control"
                value={prescription.dosage}
                onChange={(e) =>
                  handlePrescriptionChange(
                    'dosage',
                    e.target.value
                  )
                }
                placeholder="500 mg"
              />

            </div>


            <div className="col-12 col-md-6">

              <label className="form-label fw-semibold">
                Frequency
              </label>

              <input
                className="form-control"
                value={prescription.frequency}
                onChange={(e) =>
                  handlePrescriptionChange(
                    'frequency',
                    e.target.value
                  )
                }
                placeholder="3 times daily"
              />

            </div>


            <div className="col-12 col-md-6">

              <label className="form-label fw-semibold">
                Duration
              </label>

              <input
                className="form-control"
                value={prescription.duration}
                onChange={(e) =>
                  handlePrescriptionChange(
                    'duration',
                    e.target.value
                  )
                }
                placeholder="5 days"
              />

            </div>


            <div className="col-12">

              <label className="form-label fw-semibold">
                Instructions
              </label>

              <textarea
                className="form-control"
                rows="3"
                value={prescription.instructions}
                onChange={(e) =>
                  handlePrescriptionChange(
                    'instructions',
                    e.target.value
                  )
                }
              />

            </div>


            <div className="col-12 d-flex justify-content-end gap-2 flex-wrap">

              <button
                type="button"
                className="btn btn-outline-success"
                onClick={() =>
                  setActiveSection('tracking')
                }
              >
                Track Patient
              </button>

              <button
                type="button"
                className="btn btn-success"
                onClick={() =>
                  setModal('sendPharmacy')
                }
              >
                Send to Pharmacy
              </button>

            </div>

          </div>
        )}

      </div>

    </section>
  );

  /* ===============================
     TRACKING
  =============================== */

  const renderTracking = () => (
    <section className="card border-0 shadow-sm">

      <div className="card-body">

        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">

          <div>
            <h2 className="h4 fw-bold mb-1">
              Patient Tracking
            </h2>

            <small className="text-secondary">
              Monitor patient treatment workflow
            </small>
          </div>

          <span className="badge text-bg-success">
            Workflow Status
          </span>

        </div>

        <div className="table-responsive">

          <table className="table table-hover align-middle">

            <thead className="table-success">

              <tr>
                <th>Patient</th>
                <th>Queue</th>
                <th>Status</th>
                <th>Complaint</th>
                <th>Action</th>
              </tr>

            </thead>

            <tbody>

              {patientStatuses.map((patient) => (
                <tr key={patient.id}>

                  <td>
                    <strong>
                      {patient.name}
                    </strong>
                  </td>

                  <td>
                    #{patient.queue}
                  </td>

                  <td>

                    <span className="badge text-bg-success">
                      {patient.status}
                    </span>

                  </td>

                  <td>
                    {patient.reason}
                  </td>

                  <td>

                    <button
                      type="button"
                      className="btn btn-sm btn-outline-success"
                      onClick={() =>
                        handleSelectPatient(patient)
                      }
                    >
                      Open Case
                    </button>

                  </td>

                </tr>
              ))}


              {completedPatients.map(
                (patient) => (
                  <tr key={`${patient.id}-${patient.status}`}>

                    <td>
                      <strong>
                        {patient.name}
                      </strong>
                    </td>

                    <td>
                      #{patient.queue}
                    </td>

                    <td>
                      <span className="badge text-bg-success">
                        {patient.status}
                      </span>
                    </td>

                    <td>
                      Treatment completed
                    </td>

                    <td>
                      <span className="text-success fw-semibold">
                        Completed
                      </span>
                    </td>

                  </tr>
                )
              )}

            </tbody>

          </table>

        </div>

        <div className="d-flex justify-content-end gap-2 flex-wrap mt-3">

          <button
            type="button"
            className="btn btn-outline-success"
            onClick={() =>
              setActiveSection('laboratory')
            }
          >
            Laboratory Results
          </button>

          <button
            type="button"
            className="btn btn-outline-success"
            onClick={() =>
              setActiveSection('prescriptions')
            }
          >
            Pharmacy
          </button>

          {currentPatient && (
            <button
              type="button"
              className="btn btn-success"
              onClick={() =>
                setModal('completeTreatment')
              }
            >
              Complete Treatment
            </button>
          )}

        </div>

      </div>

    </section>
  );

  /* ===============================
     NOTIFICATIONS
  =============================== */

  const renderNotifications = () => (
    <section className="card border-0 shadow-sm">

      <div className="card-body">

        <div className="d-flex justify-content-between align-items-center mb-4">

          <div>
            <h2 className="h4 fw-bold mb-1">
              Notifications
            </h2>

            <small className="text-secondary">
              Important workflow alerts
            </small>
          </div>

          <span className="badge text-bg-success">
            {notifications.filter(
              (item) => !item.read
            ).length}{' '}
            Unread
          </span>

        </div>

        <div className="table-responsive">

          <table className="table table-hover align-middle">

            <thead className="table-success">

              <tr>
                <th>Notification</th>
                <th>Status</th>
              </tr>

            </thead>

            <tbody>

              {notifications.map(
                (notification) => (
                  <tr key={notification.id}>

                    <td>
                      {notification.message}
                    </td>

                    <td>
                      <span
                        className={`badge ${
                          notification.read
                            ? 'text-bg-secondary'
                            : 'text-bg-warning'
                        }`}
                      >
                        {notification.read
                          ? 'Read'
                          : 'Unread'}
                      </span>
                    </td>

                  </tr>
                )
              )}

            </tbody>

          </table>

        </div>

      </div>

    </section>
  );

  /* ===============================
     SECTION CONTENT
  =============================== */

  const sectionContent = {
    dashboard: renderDashboard,
    patients: renderPatients,
    consultations: renderConsultations,
    laboratory: renderLaboratory,
    prescriptions: renderPrescriptions,
    tracking: renderTracking,
    notifications: renderNotifications,
  };

  const activeSectionTitle =
    sidebarItems.find((item) => item.id === activeSection)?.label ||
    'Dashboard';

  const activeSubmenuItems =
    sectionSubmenus[activeSection] || [activeSectionTitle];

  const getSubmenuTarget = (item) => {
    return submenuTargets[activeSection]?.[item] || activeSection;
  };

  const displayInitials = displayUser.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((name) => name.charAt(0).toUpperCase())
    .join('') || 'DR';

  return (
    <AppShell
      title="Doctor Desk"
      subtitle="Treatment Planning"
      headerVariant="ministry"
      bannerTitle="MINISTRY OF HEALTH"
      bannerSubtitle="KAM MEDICAL SERVICE"
      bannerActions={
        <div className="doctor-user-menu doctor-banner-actions">
          {accountMenuOpen && (
            <button
              type="button"
              className="doctor-account-menu-backdrop"
              aria-label="Close account menu"
              onClick={() => setAccountMenuOpen(false)}
            />
          )}

          <button
            type="button"
            className="doctor-menu-button"
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
              className="doctor-account-menu"
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
                className="doctor-menu-danger"
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

      <div
        className={`doctor-portal-shell ${
          sidebarOpen ? '' : 'is-sidebar-hidden'
        }`}
      >

        {/* ================= SIDEBAR ================= */}

        <aside className="doctor-portal-sidebar">

          <div className="doctor-sidebar-brand">
            <span className="doctor-brand-mark">KC</span>
            <strong>KazimiliCare</strong>
          </div>

          <div className="doctor-profile-card">
            <div className="doctor-profile-avatar">
              {displayInitials}
            </div>

            <strong>
              Doctor
            </strong>

            <span>
              Clinical Desk
            </span>
          </div>

          <nav className="doctor-sidebar-nav">

            {sidebarItems.map((item) => (

              <button
                type="button"
                key={item.id}
                className={`doctor-sidebar-link ${
                  activeSection === item.id
                    ? 'is-active'
                    : ''
                }`}
                onClick={() =>
                  setActiveSection(item.id)
                }
              >

                <span>
                  {item.label}
                </span>

	                {item.id === 'patients' &&
	                  waitingPatients.length > 0 && (
	                    <span className="doctor-nav-badge">
	                      {waitingPatients.length}
	                    </span>
	                  )}

                {item.id === 'laboratory' &&
                  labRequests.filter(
	                    (request) =>
	                      !request.result
	                  ).length > 0 && (
	                    <span className="doctor-nav-badge">
	                      {
	                        labRequests.filter(
                          (request) =>
                            !request.result
                        ).length
                      }
                    </span>
                  )}

              </button>

            ))}

          </nav>

          <div className="doctor-sidebar-footer">
            <span>KazimiliCare v1.0.0</span>
          </div>

        </aside>


        {/* ================= MAIN ================= */}

        <main className="doctor-portal-main">

          {/* TOP BAR */}

          <header className="doctor-toolbar">

            <button
              type="button"
              className="doctor-icon-button"
              aria-label="Open menu"
              aria-expanded={sidebarOpen}
              onClick={() => setSidebarOpen((value) => !value)}
            >
              &#9776;
            </button>

            <div className="doctor-toolbar-spacer" />

            <div className="doctor-toolbar-tools" aria-hidden="true">
              <span>A</span>
              <span>-</span>
              <span>+</span>
              <span>?</span>
            </div>

          </header>

          {/* PAGE CONTENT */}

          <div className="doctor-portal-content">

            <div className="doctor-breadcrumb">
              <span>Home</span>
              <span>&gt;</span>
              <strong>{activeSectionTitle}</strong>
            </div>

            <div className="doctor-content-grid">

              <nav className="doctor-section-rail">
                {activeSubmenuItems.map((item, index) => (
                  <button
                    type="button"
                    key={`${activeSection}-${item}`}
                    className={index === 0 ? 'is-active' : ''}
                    onClick={() => setActiveSection(getSubmenuTarget(item))}
                  >
                    {item}
                  </button>
                ))}
              </nav>

              <div className="doctor-section-area">
                {sectionContent[activeSection]()}
              </div>

            </div>

          </div>

        </main>

      </div>

      {screenLocked && (
        <div
          className="doctor-lock-screen"
          role="dialog"
          aria-modal="true"
          aria-labelledby="doctor-lock-title"
        >
          <form
            className="doctor-lock-panel"
            onSubmit={handleUnlockScreen}
          >
            <div className="doctor-lock-avatar">
              {displayInitials}
            </div>

            <span className="doctor-lock-kicker">
              Screen locked
            </span>

            <h2 id="doctor-lock-title">
              Doctor desk locked
            </h2>

            <label htmlFor="doctor-lock-password">
              Password
            </label>

            <input
              id="doctor-lock-password"
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
              <div className="doctor-lock-error" role="alert">
                {lockError}
              </div>
            )}

            <button
              type="submit"
              className="doctor-lock-primary"
              disabled={lockLoading}
            >
              {lockLoading ? 'Unlocking...' : 'Unlock screen'}
            </button>

            <button
              type="button"
              className="doctor-lock-secondary"
              onClick={handleLogout}
            >
              Logout instead
            </button>
          </form>
        </div>
      )}

      <style>{`
        .doctor-portal-shell {
          min-height: calc(100vh - 103px);
          display: flex;
          gap: 34px;
          padding: 20px 22px;
          background: #eef7f1;
          color: #214334;
        }

        .doctor-portal-sidebar {
          width: 224px;
          min-height: calc(100vh - 143px);
          flex-shrink: 0;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          background: #ffffff;
          border: 1px solid #d8e2ef;
          border-radius: 14px;
          box-shadow: 0 8px 20px rgba(42, 70, 111, 0.08);
        }

        .doctor-portal-shell.is-sidebar-hidden .doctor-portal-sidebar {
          display: none;
        }

        .doctor-sidebar-brand {
          min-height: 48px;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 16px;
          background: #198754;
          color: #ffffff;
          font-weight: 800;
        }

        .doctor-brand-mark {
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

        .doctor-profile-card {
          padding: 18px 16px 16px;
          text-align: center;
          border-bottom: 1px solid #dbe5f1;
        }

        .doctor-profile-avatar {
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

        .doctor-profile-card strong,
        .doctor-profile-card span {
          display: block;
        }

        .doctor-profile-card strong {
          color: #214334;
          font-size: 14px;
          line-height: 1.25;
        }

        .doctor-profile-card span {
          margin-top: 4px;
          color: #198754;
          font-size: 12px;
          font-weight: 700;
        }

        .doctor-sidebar-nav {
          flex: 1;
          display: grid;
          align-content: start;
          gap: 4px;
          padding: 14px 12px;
        }

        .doctor-sidebar-link {
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

        .doctor-sidebar-link:hover,
        .doctor-sidebar-link.is-active {
          background: #e7f4ed;
          color: #146c43;
        }

        .doctor-nav-badge {
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

        .doctor-sidebar-footer {
          padding: 12px 16px;
          border-top: 1px solid #dbe5f1;
          color: #2d5a43;
          font-size: 11px;
          font-weight: 700;
        }

        .doctor-portal-main {
          min-width: 0;
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .doctor-toolbar {
          min-height: 56px;
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 8px 22px;
          background: #ffffff;
          border: 1px solid #d8e2ef;
          border-radius: 14px;
          box-shadow: 0 4px 12px rgba(42, 70, 111, 0.08);
        }

        .doctor-toolbar-spacer {
          flex: 1;
        }

        .doctor-icon-button,
        .doctor-toolbar-tools span,
        .doctor-user-avatar {
          width: 34px;
          height: 34px;
          display: grid;
          place-items: center;
          border: 1px solid #d4dfec;
          border-radius: 9px;
          background: #f8fbff;
          color: #198754;
          font-weight: 800;
        }

        .doctor-icon-button {
          cursor: pointer;
          font: inherit;
        }

        .doctor-toolbar-tools {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 0 8px;
          border-right: 1px solid #dbe5f1;
        }

        .doctor-toolbar-tools span {
          width: 28px;
          height: 28px;
          border-radius: 8px;
          font-size: 12px;
        }

        .doctor-user-menu {
          position: relative;
          display: flex;
          align-items: center;
          gap: 10px;
          color: #214334;
          z-index: 65;
        }

        .doctor-user-menu strong {
          font-size: 14px;
          line-height: 1;
          white-space: nowrap;
        }

        .doctor-user-avatar {
          border-radius: 50%;
          background: #e7f4ed;
        }

        .doctor-menu-button {
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

        .doctor-menu-button:hover,
        .doctor-menu-button[aria-expanded='true'] {
          background: #e7f4ed;
          border-color: #198754;
        }

        .doctor-account-menu-backdrop {
          position: fixed;
          inset: 0;
          border: 0;
          background: transparent;
          z-index: 55;
          cursor: default;
        }

        .doctor-account-menu {
          position: absolute;
          top: calc(100% + 10px);
          right: 0;
          z-index: 70;
          width: 190px;
          padding: 8px;
          border: 1px solid #d8e2ef;
          border-radius: 10px;
          background: #ffffff;
          box-shadow: 0 16px 36px rgba(42, 70, 111, 0.16);
        }

        .doctor-account-menu button {
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

        .doctor-account-menu button:hover {
          background: #e7f4ed;
          color: #146c43;
        }

        .doctor-account-menu .doctor-menu-danger {
          color: #b42318;
        }

        .doctor-account-menu .doctor-menu-danger:hover {
          background: #fff1f0;
          color: #912018;
        }

        .doctor-lock-screen {
          position: fixed;
          inset: 0;
          z-index: 2000;
          display: grid;
          place-items: center;
          padding: 20px;
          background: rgba(18, 50, 61, 0.72);
          backdrop-filter: blur(8px);
        }

        .doctor-lock-panel {
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

        .doctor-lock-avatar {
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

        .doctor-lock-kicker {
          color: #198754;
          font-size: 12px;
          font-weight: 900;
          text-transform: uppercase;
        }

        .doctor-lock-panel h2 {
          margin: -8px 0 4px;
          color: #214334;
          font-size: 24px;
          line-height: 1.2;
          letter-spacing: 0;
        }

        .doctor-lock-panel label {
          color: #214334;
          font-size: 13px;
          font-weight: 800;
        }

        .doctor-lock-panel .form-control {
          min-height: 44px;
          border-color: #d5dfec;
          border-radius: 10px;
        }

        .doctor-lock-error {
          border: 1px solid #f4b8b2;
          border-radius: 10px;
          background: #fff1f0;
          color: #912018;
          padding: 10px 12px;
          font-size: 13px;
          font-weight: 700;
        }

        .doctor-lock-primary,
        .doctor-lock-secondary {
          min-height: 42px;
          border-radius: 10px;
          font: inherit;
          font-size: 14px;
          font-weight: 900;
          cursor: pointer;
        }

        .doctor-lock-primary {
          border: 1px solid #198754;
          background: #198754;
          color: #ffffff;
        }

        .doctor-lock-primary:disabled {
          opacity: 0.7;
          cursor: progress;
        }

        .doctor-lock-secondary {
          border: 1px solid #b7c9e7;
          background: #ffffff;
          color: #198754;
        }

        .doctor-portal-content {
          width: min(100%, 1320px);
          margin: 28px auto 0;
        }

        .doctor-breadcrumb {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 0 0 24px;
          color: #9badc8;
          font-size: 14px;
          font-weight: 600;
        }

        .doctor-breadcrumb strong {
          color: #214334;
        }

        .doctor-content-grid {
          display: grid;
          grid-template-columns: 210px minmax(0, 1fr);
          gap: 40px;
          align-items: start;
        }

        .doctor-section-rail {
          position: sticky;
          top: 20px;
          display: grid;
          gap: 18px;
          margin-left: 10px;
          padding: 4px 0 4px 22px;
          border-left: 1px solid #cfdaea;
        }

        .doctor-section-rail button {
          position: relative;
          min-height: 32px;
          border: 0;
          background: transparent;
          color: #9badc8;
          padding: 0;
          font: inherit;
          font-size: 14px;
          font-weight: 600;
          text-align: left;
          cursor: pointer;
        }

        .doctor-section-rail button::before {
          content: '';
          position: absolute;
          left: -26px;
          top: 50%;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: transparent;
          transform: translateY(-50%);
        }

        .doctor-section-rail button:hover,
        .doctor-section-rail button.is-active {
          color: #214334;
          font-weight: 800;
        }

        .doctor-section-rail button:hover::before,
        .doctor-section-rail button.is-active::before {
          background: #198754;
        }

        .doctor-section-area {
          min-width: 0;
          display: grid;
          gap: 24px;
        }

        .doctor-stat-card {
          width: 100%;
          text-align: left;
          cursor: pointer;
          transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
        }

        .doctor-stat-card:hover,
        .doctor-stat-card:focus-visible {
          border-color: #198754 !important;
          box-shadow: 0 12px 26px rgba(25, 135, 84, 0.16) !important;
          transform: translateY(-2px);
        }

        .doctor-stat-card:focus-visible {
          outline: 3px solid rgba(25, 135, 84, 0.2);
          outline-offset: 3px;
        }

        .doctor-portal-shell .card {
          padding: 0;
          border: 1px solid #d8e2ef !important;
          border-radius: 14px;
          box-shadow: none !important;
          color: #214334;
        }

        .doctor-portal-shell .card-body {
          padding: 28px 32px;
        }

        .doctor-portal-shell h2,
        .doctor-portal-shell h3,
        .doctor-portal-shell h4,
        .doctor-portal-shell h5 {
          color: #214334;
          letter-spacing: 0;
        }

        .doctor-portal-shell .text-secondary {
          color: #91a5c2 !important;
        }

        .doctor-portal-shell .alert-success {
          border: 1px solid #d8e2ef;
          background: #f5f8fc;
          color: #214334;
        }

        .doctor-portal-shell .display-6 {
          color: #198754;
          font-size: 30px;
        }

        .doctor-portal-shell .fs-2 {
          width: 40px;
          height: 40px;
          display: grid;
          place-items: center;
          border-radius: 10px;
          background: #e7f4ed;
          color: #198754;
          font-size: 13px !important;
          font-weight: 900;
        }

        .doctor-portal-shell .table {
          color: #214334;
        }

        .doctor-portal-shell .table > :not(caption) > * > * {
          padding: 14px 16px;
          border-bottom-color: #e2e9f3;
        }

        .doctor-portal-shell thead,
        .doctor-portal-shell .table-success,
        .doctor-portal-shell .table-light {
          --bs-table-bg: #f5f8fc;
          --bs-table-color: #8da0bd;
          color: #8da0bd;
          text-transform: uppercase;
          font-size: 12px;
          letter-spacing: 0;
        }

        .doctor-portal-shell .badge {
          border-radius: 999px;
          font-weight: 800;
        }

        .doctor-portal-shell .text-bg-success,
        .doctor-portal-shell .bg-success {
          background-color: #198754 !important;
          color: #ffffff !important;
        }

        .doctor-portal-shell .text-bg-warning {
          background-color: #e7f4ed !important;
          color: #198754 !important;
        }

        .doctor-portal-shell .btn-success {
          border-color: #198754;
          background: #198754;
          color: #ffffff;
        }

        .doctor-portal-shell .btn-outline-success {
          border-color: #b7c9e7;
          color: #198754;
          background: #ffffff;
        }

        .doctor-portal-shell .btn-outline-success:hover,
        .doctor-portal-shell .btn-success:hover {
          border-color: #146c43;
          background: #146c43;
          color: #ffffff;
        }

        .doctor-portal-shell .form-control,
        .doctor-portal-shell .form-select {
          min-height: 42px;
          border-color: #d5dfec;
          border-radius: 10px;
          color: #214334;
        }

        .doctor-portal-shell textarea.form-control {
          min-height: 118px;
        }

        .doctor-portal-shell label.border {
          border-color: #d8e2ef !important;
          border-radius: 12px !important;
          color: #214334;
          background: #fbfdff;
        }

        @media (max-width: 1050px) {
          .doctor-portal-shell {
            flex-direction: column;
          }

          .doctor-portal-sidebar {
            width: 100%;
            min-height: 0;
          }

          .doctor-sidebar-nav {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .doctor-content-grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }

          .doctor-section-rail {
            position: static;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 12px 18px;
          }
        }

        @media (max-width: 720px) {
          .doctor-portal-shell {
            padding: 14px;
          }

          .doctor-toolbar {
            align-items: flex-start;
            flex-wrap: wrap;
            padding: 12px;
          }

          .doctor-toolbar-spacer {
            display: none;
          }

          .doctor-toolbar-tools {
            order: 3;
            width: 100%;
            border-right: 0;
            padding: 0;
          }

          .doctor-user-menu {
            flex: 1;
            justify-content: flex-end;
            min-width: 0;
          }

          .doctor-user-menu strong {
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .doctor-sidebar-nav,
          .doctor-section-rail {
            grid-template-columns: 1fr;
          }

          .doctor-portal-shell .card-body {
            padding: 20px;
          }
        }
      `}</style>


      {/* ================= PATIENT DETAILS MODAL ================= */}

      {modal === 'patient' && currentPatient && (

        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{
            backgroundColor:
              'rgba(0,0,0,0.5)',
          }}
        >

          <div className="modal-dialog modal-lg modal-dialog-centered">

            <div className="modal-content">

              <div className="modal-header">

                <h5 className="modal-title fw-bold">
                  Patient Details
                </h5>

                <button
                  type="button"
                  className="btn-close"
                  onClick={() =>
                    setModal(null)
                  }
                />

              </div>

              <div className="modal-body">

                <div className="table-responsive">

                  <table className="table table-bordered">

                    <tbody>

                      <tr>
                        <th>Patient Name</th>
                        <td>
                          {currentPatient.name}
                        </td>
                      </tr>

                      <tr>
                        <th>Gender</th>
                        <td>
                          {currentPatient.gender ||
                            '-'}
                        </td>
                      </tr>

                      <tr>
                        <th>Age</th>
                        <td>
                          {currentPatient.age ||
                            '-'}
                        </td>
                      </tr>

                      <tr>
                        <th>Queue Number</th>
                        <td>
                          #{currentPatient.queue}
                        </td>
                      </tr>

                      <tr>
                        <th>Chief Complaint</th>
                        <td>
                          {currentPatient.reason}
                        </td>
                      </tr>

                    </tbody>

                  </table>

                </div>


                <h6 className="fw-bold mt-4">
                  Medical History
                </h6>

                <ul className="list-group">

                  {currentPatient.history?.map(
                    (item) => (
                      <li
                        className="list-group-item"
                        key={item}
                      >
                        {item}
                      </li>
                    )
                  )}

                </ul>


                <h6 className="fw-bold mt-4">
                  Previous Visits
                </h6>

                <ul className="list-group">

                  {currentPatient.visits?.map(
                    (visit) => (
                      <li
                        className="list-group-item"
                        key={visit}
                      >
                        {visit}
                      </li>
                    )
                  )}

                </ul>

              </div>

              <div className="modal-footer">

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() =>
                    setModal(null)
                  }
                >
                  Close
                </button>

                <button
                  type="button"
                  className="btn btn-success"
                  onClick={() =>
                    handleSelectPatient(
                      currentPatient
                    )
                  }
                >
                  Start Consultation
                </button>

              </div>

            </div>

          </div>

        </div>

      )}


      {/* ================= LAB RESULT MODAL ================= */}

      {modal?.type === 'labResult' && (

        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{
            backgroundColor:
              'rgba(0,0,0,0.5)',
          }}
        >

          <div className="modal-dialog modal-dialog-centered">

            <div className="modal-content">

              <div className="modal-header">

                <h5 className="modal-title fw-bold">
                  Receive Laboratory Result
                </h5>

                <button
                  type="button"
                  className="btn-close"
                  onClick={() =>
                    setModal(null)
                  }
                />

              </div>

              <div className="modal-body">

                <p>
                  Laboratory results for:
                </p>

                <h5 className="fw-bold">
                  {modal.request.patientName}
                </h5>

                <p className="text-secondary">
                  {modal.request.tests.join(', ')}
                </p>

                <div className="alert alert-success">
                  Results are ready for doctor review.
                </div>

              </div>

              <div className="modal-footer">

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() =>
                    setModal(null)
                  }
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="btn btn-success"
                  onClick={() =>
                    handleReceiveLabResult(
                      modal.request
                    )
                  }
                >
                  Receive Result
                </button>

              </div>

            </div>

          </div>

        </div>

      )}


      {/* ================= PHARMACY CONFIRMATION ================= */}

      {modal === 'sendPharmacy' && (

        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{
            backgroundColor:
              'rgba(0,0,0,0.5)',
          }}
        >

          <div className="modal-dialog modal-dialog-centered">

            <div className="modal-content">

              <div className="modal-header">

                <h5 className="modal-title fw-bold">
                  Send Prescription
                </h5>

                <button
                  type="button"
                  className="btn-close"
                  onClick={() =>
                    setModal(null)
                  }
                />

              </div>

              <div className="modal-body">

                <p>
                  Send prescription for:
                </p>

                <h5 className="fw-bold">
                  {currentPatient?.name}
                </h5>

                <div className="alert alert-success">

                  <strong>
                    {prescription.medicine}
                  </strong>

                  <br />

                  {prescription.dosage}
                  {' — '}
                  {prescription.frequency}
                  {' — '}
                  {prescription.duration}

                </div>

                <p className="text-secondary mb-0">
                  The prescription will be sent to the Pharmacy workflow.
                </p>

              </div>

              <div className="modal-footer">

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() =>
                    setModal(null)
                  }
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="btn btn-success"
                  onClick={handleSendToPharmacy}
                >
                  Confirm & Send
                </button>

              </div>

            </div>

          </div>

        </div>

      )}


      {/* ================= COMPLETE TREATMENT MODAL ================= */}

      {modal === 'completeTreatment' && (

        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{
            backgroundColor:
              'rgba(0,0,0,0.5)',
          }}
        >

          <div className="modal-dialog modal-dialog-centered">

            <div className="modal-content">

              <div className="modal-header">

                <h5 className="modal-title fw-bold">
                  Complete Treatment
                </h5>

                <button
                  type="button"
                  className="btn-close"
                  onClick={() =>
                    setModal(null)
                  }
                />

              </div>

              <div className="modal-body">

                <div className="alert alert-warning">

                  Are you sure you want to mark{' '}

                  <strong>
                    {currentPatient?.name}
                  </strong>

                  {' '}as completed?

                </div>

              </div>

              <div className="modal-footer">

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() =>
                    setModal(null)
                  }
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="btn btn-success"
                  onClick={
                    handleCompleteTreatment
                  }
                >
                  Complete Treatment
                </button>

              </div>

            </div>

          </div>

        </div>

      )}

    </AppShell>
  );
};

export default DoctorDashboard;
