const express = require('express');
const router = express.Router();
const { register, login, getProfile } = require('../controllers/authController');
const { registerValidator, loginValidator } = require('../validators/authValidator');
const auth = require('../middlewares/auth');

router.post('/register', registerValidator, register);
router.post('/login', loginValidator, login);
router.get('/profile', auth, getProfile);

module.exports = router;
