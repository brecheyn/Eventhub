const express = require('express');
const router = express.Router();
const {
  createCertificate,
  getMyCertificates,
  getCertificateById
} = require('../controllers/certificateController');
const auth = require('../middlewares/auth');

router.post('/', auth, createCertificate);
router.get('/my-certificates', auth, getMyCertificates);
router.get('/:id', auth, getCertificateById);

module.exports = router;
