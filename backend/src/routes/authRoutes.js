const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { auth, adminOnly, roleCheck } = require('../middleware/auth');

// Public routes
router.post('/login', authController.loginUser);
router.get('/bootstrap-admin/status', authController.getBootstrapAdminStatus);
router.post('/bootstrap-admin', authController.bootstrapAdmin);

// Protected routes (require authentication)
router.get('/me', auth, authController.getCurrentUser);
router.put('/me', auth, authController.updateCurrentUser);
router.post('/change-password', auth, authController.changePassword);

// Admin only routes
router.post('/register', auth, adminOnly, authController.registerUser);
router.get('/users', auth, adminOnly, authController.getAllUsers);
router.get('/users/role/:role', auth, adminOnly, authController.getUsersByRole);
router.get('/users/:id', auth, adminOnly, authController.getUserById);
router.put('/users/:id', auth, adminOnly, authController.updateUser);
router.delete('/users/:id', auth, adminOnly, authController.deleteUser);

module.exports = router;
