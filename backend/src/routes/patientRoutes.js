const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');

router.get('/', patientController.getAllPatients);
router.get('/:id', patientController.getPatient);
router.post('/', patientController.createPatient);

module.exports = router;
