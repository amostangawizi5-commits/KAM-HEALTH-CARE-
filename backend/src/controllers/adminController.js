const {
  BillItem,
  Medicine,
  Patient,
  Payment,
  PharmacyBill,
  Prescription,
  PrescriptionItem,
  User,
  Visit
} = require('../models');
const { Op } = require('sequelize');

exports.getUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] }
    });
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { email, password, firstName, lastName, role, phone } = req.body;
    const user = await User.create({ email, password, firstName, lastName, role, phone });
    const userData = user.toJSON();
    delete userData.password;
    res.status(201).json({ success: true, data: userData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const toNumber = (value) => Number(value || 0);

const patientName = (patient = {}) => {
  return [patient.firstName, patient.lastName].filter(Boolean).join(' ') || 'Unknown Patient';
};

exports.getOverview = async (req, res) => {
  try {
    const treatedStatuses = ['COMPLETED', 'DISPENSED', 'PAYMENT_PENDING', 'WAITING_PHARMACY', 'PRESCRIBED'];

    const [
      users,
      patientsCount,
      treatedVisits,
      payments,
      medicines,
      prescriptionItems,
      bills
    ] = await Promise.all([
      User.findAll({
        attributes: { exclude: ['password'] },
        order: [['createdAt', 'DESC']]
      }),
      Patient.count(),
      Visit.findAll({
        where: { status: { [Op.in]: treatedStatuses } },
        include: [{ model: Patient }],
        order: [['updatedAt', 'DESC']],
        limit: 30
      }),
      Payment.findAll({
        include: [
          {
            model: PharmacyBill,
            as: 'bill',
            include: [{ model: Visit, include: [Patient] }]
          },
          {
            model: User,
            as: 'receiver',
            attributes: ['id', 'firstName', 'lastName', 'role']
          }
        ],
        order: [['paidAt', 'DESC']],
        limit: 30
      }),
      Medicine.findAll({ order: [['name', 'ASC']] }),
      PrescriptionItem.findAll({
        include: [
          { model: Medicine },
          {
            model: Prescription,
            include: [{ model: Visit, include: [Patient] }]
          }
        ],
        order: [['updatedAt', 'DESC']],
        limit: 50
      }),
      PharmacyBill.findAll({
        include: [
          { model: Visit, include: [Patient] },
          { model: BillItem }
        ],
        order: [['updatedAt', 'DESC']],
        limit: 30
      })
    ]);

    const paymentRows = payments.map((payment) => {
      const bill = payment.bill || {};
      const visit = bill.Visit || {};
      return {
        id: payment.id,
        receiptNo: payment.receiptNo,
        patientName: patientName(visit.Patient),
        invoiceNo: bill.invoiceNo || '-',
        amount: toNumber(payment.amount),
        method: payment.paymentMethod,
        paidAt: payment.paidAt,
        receivedBy: patientName(payment.receiver)
      };
    });

    const medicineUsage = prescriptionItems.map((item) => {
      const prescription = item.Prescription || {};
      const visit = prescription.Visit || {};
      return {
        id: item.id,
        medicineName: item.Medicine?.name || 'Unknown medicine',
        patientName: patientName(visit.Patient),
        prescribedQuantity: toNumber(item.quantity),
        dispensedQuantity: toNumber(item.quantityDispensed),
        dosage: item.dosage,
        frequency: item.frequency,
        status: item.isDispensed ? 'DISPENSED' : 'PENDING'
      };
    });

    const billRows = bills.map((bill) => ({
      id: bill.id,
      invoiceNo: bill.invoiceNo,
      patientName: patientName(bill.Visit?.Patient),
      totalAmount: toNumber(bill.totalAmount),
      paidAmount: toNumber(bill.paidAmount),
      balance: toNumber(bill.balance),
      status: bill.status,
      items: (bill.BillItems || []).map((item) => ({
        description: item.description,
        quantity: toNumber(item.quantity),
        total: toNumber(item.total)
      }))
    }));

    const totalPaid = paymentRows.reduce((total, payment) => total + payment.amount, 0);
    const medicineUsed = medicineUsage.reduce((total, item) => total + item.dispensedQuantity, 0);
    const lowStockCount = medicines.filter((medicine) => toNumber(medicine.currentStock) <= toNumber(medicine.reorderLevel)).length;

    res.json({
      success: true,
      data: {
        summary: {
          totalPatients: patientsCount,
          treatedPatients: treatedVisits.length,
          activeStaff: users.filter((staff) => staff.isActive).length,
          blockedStaff: users.filter((staff) => !staff.isActive).length,
          totalPaid,
          medicineUsed,
          medicinesInStore: medicines.length,
          lowStockCount
        },
        users,
        treatedPatients: treatedVisits.map((visit) => ({
          id: visit.id,
          patientNo: visit.Patient?.patientNo || '-',
          patientName: patientName(visit.Patient),
          status: visit.status,
          visitReason: visit.visitReason,
          visitDate: visit.visitDate,
          updatedAt: visit.updatedAt
        })),
        payments: paymentRows,
        bills: billRows,
        medicineUsage,
        medicines: medicines.map((medicine) => ({
          id: medicine.id,
          name: medicine.name,
          genericName: medicine.genericName,
          category: medicine.category,
          manufacturer: medicine.manufacturer,
          unitPrice: toNumber(medicine.unitPrice),
          currentStock: toNumber(medicine.currentStock),
          reorderLevel: toNumber(medicine.reorderLevel),
          expiryDate: medicine.expiryDate,
          isActive: medicine.isActive
        }))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
