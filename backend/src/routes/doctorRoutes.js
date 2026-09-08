const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');

router.get('/queue', doctorController.getQueue);
router.patch('/queue/:visitId/start', doctorController.startConsultation);
router.post('/consultation', doctorController.createConsultation);
router.post('/prescribe', doctorController.createPrescription);

module.exports = router;
