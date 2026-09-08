const sequelize = require('../config/database');
const User = require('./User');
const Patient = require('./Patient');
const Visit = require('./Visit');
const ConsultantAssessment = require('./ConsultantAssessment');
const DoctorConsultation = require('./DoctorConsultation');
const Prescription = require('./Prescription');
const PrescriptionItem = require('./PrescriptionItem');
const Medicine = require('./Medicine');
const PharmacyBill = require('./PharmacyBill');
const BillItem = require('./BillItem');
const Payment = require('./Payment');

// Define relationships
// User -> Visit (registeredBy)
Visit.belongsTo(User, { as: 'registrar', foreignKey: 'registeredBy' });
User.hasMany(Visit, { as: 'registeredVisits', foreignKey: 'registeredBy' });

// Patient -> Visit
Patient.hasMany(Visit, { foreignKey: 'patientId' });
Visit.belongsTo(Patient, { foreignKey: 'patientId' });

// Visit -> ConsultantAssessment
Visit.hasOne(ConsultantAssessment, { foreignKey: 'visitId' });
ConsultantAssessment.belongsTo(Visit, { foreignKey: 'visitId' });

// User -> ConsultantAssessment (consultant)
ConsultantAssessment.belongsTo(User, { as: 'consultant', foreignKey: 'consultantId' });
User.hasMany(ConsultantAssessment, { as: 'consultantAssessments', foreignKey: 'consultantId' });

// Visit -> DoctorConsultation
Visit.hasOne(DoctorConsultation, { foreignKey: 'visitId' });
DoctorConsultation.belongsTo(Visit, { foreignKey: 'visitId' });

// User -> DoctorConsultation (doctor)
DoctorConsultation.belongsTo(User, { as: 'doctor', foreignKey: 'doctorId' });
User.hasMany(DoctorConsultation, { as: 'doctorConsultations', foreignKey: 'doctorId' });

// Visit -> Prescription
Visit.hasMany(Prescription, { foreignKey: 'visitId' });
Prescription.belongsTo(Visit, { foreignKey: 'visitId' });

// User -> Prescription (doctor)
Prescription.belongsTo(User, { as: 'doctor', foreignKey: 'doctorId' });
User.hasMany(Prescription, { as: 'doctorPrescriptions', foreignKey: 'doctorId' });

// User -> Prescription (pharmacist)
Prescription.belongsTo(User, { as: 'pharmacist', foreignKey: 'pharmacistId' });
User.hasMany(Prescription, { as: 'pharmacistPrescriptions', foreignKey: 'pharmacistId' });

// Prescription -> PrescriptionItem
Prescription.hasMany(PrescriptionItem, { foreignKey: 'prescriptionId' });
PrescriptionItem.belongsTo(Prescription, { foreignKey: 'prescriptionId' });

// Medicine -> PrescriptionItem
Medicine.hasMany(PrescriptionItem, { foreignKey: 'medicineId' });
PrescriptionItem.belongsTo(Medicine, { foreignKey: 'medicineId' });

// Visit -> PharmacyBill
Visit.hasOne(PharmacyBill, { foreignKey: 'visitId' });
PharmacyBill.belongsTo(Visit, { foreignKey: 'visitId' });

// PharmacyBill -> BillItem
PharmacyBill.hasMany(BillItem, { foreignKey: 'billId' });
BillItem.belongsTo(PharmacyBill, { as: 'bill', foreignKey: 'billId' });

// PharmacyBill -> Payment
PharmacyBill.hasMany(Payment, { foreignKey: 'billId' });
Payment.belongsTo(PharmacyBill, { as: 'bill', foreignKey: 'billId' });

// User -> Payment (receivedBy)
Payment.belongsTo(User, { as: 'receiver', foreignKey: 'receivedBy' });
User.hasMany(Payment, { as: 'receivedPayments', foreignKey: 'receivedBy' });

module.exports = {
  sequelize,
  User,
  Patient,
  Visit,
  ConsultantAssessment,
  DoctorConsultation,
  Prescription,
  PrescriptionItem,
  Medicine,
  PharmacyBill,
  BillItem,
  Payment
};
