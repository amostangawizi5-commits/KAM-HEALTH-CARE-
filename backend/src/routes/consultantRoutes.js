const express = require('express');
const router = express.Router();
const consultantController = require('../controllers/consultantController');

router.get('/queue', consultantController.getQueue);
router.patch('/queue/:visitId/start', consultantController.startConsultation);
router.post('/assessment', consultantController.createAssessment);

module.exports = router;
