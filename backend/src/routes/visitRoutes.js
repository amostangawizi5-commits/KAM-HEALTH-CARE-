const express = require('express');
const router = express.Router();
const visitController = require('../controllers/visitController');

router.get('/', visitController.getAllVisits);
router.post('/', visitController.createVisit);
router.put('/:id/send-to-consultant', visitController.sendToConsultant);

module.exports = router;
