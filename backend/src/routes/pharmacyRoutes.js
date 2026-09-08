const express = require('express');
const router = express.Router();
const pharmacyController = require('../controllers/pharmacyController');

router.get('/prescriptions', pharmacyController.getPrescriptions);
router.post('/dispense', pharmacyController.dispenseMedicine);

module.exports = router;
