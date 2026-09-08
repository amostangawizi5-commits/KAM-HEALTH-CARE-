const Prescription = require('../models/Prescription');
const PharmacyBill = require('../models/PharmacyBill');

exports.getPrescriptions = async (req, res) => {
  try {
    res.json({ success: true, message: 'Prescriptions list - To be implemented' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.dispenseMedicine = async (req, res) => {
  try {
    res.json({ success: true, message: 'Medicine dispensed - To be implemented' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
