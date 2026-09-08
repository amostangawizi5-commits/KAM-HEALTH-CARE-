const express = require('express');
const router = express.Router();
const cashierController = require('../controllers/cashierController');

router.get('/bills', cashierController.getBills);
router.post('/payment', cashierController.processPayment);

module.exports = router;
