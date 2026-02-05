const express = require('express');
const router = express.Router();
const { register, login, getProfile, updateProfile, changePassword, deleteAccount } = require('../controllers/authController');
const { registerValidator, loginValidator } = require('../validators/authValidator');
const auth = require('../middlewares/auth');

router.post('/register', registerValidator, register);
router.post('/login', loginValidator, login);
router.get('/profile', auth, getProfile);
router.put('/change-password', auth, changePassword);  // ← Route séparée AVANT
router.put('/profile', auth, updateProfile);           // ← Route générique APRÈS
router.delete('/account', auth, deleteAccount);        // ← Suppression compte

module.exports = router;
