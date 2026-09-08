const PharmacyBill = require('../models/PharmacyBill');
const Payment = require('../models/Payment');

exports.getBills = async (req, res) => {
  try {
    res.json({ success: true, message: 'Bills list - To be implemented' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.processPayment = async (req, res) => {
  try {
    res.json({ success: true, message: 'Payment processed - To be implemented' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
