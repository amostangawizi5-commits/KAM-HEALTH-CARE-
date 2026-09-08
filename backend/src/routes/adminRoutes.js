const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { auth, adminOnly } = require('../middleware/auth');

router.use(auth, adminOnly);

router.get('/overview', adminController.getOverview);
router.get('/users', adminController.getUsers);
router.post('/users', adminController.createUser);

module.exports = router;
