const express = require('express');
const router = express.Router();
const {
  createSession,
  getEventSessions,
  updateSession,
  deleteSession
} = require('../controllers/sessionController');
const auth = require('../middlewares/auth');
const checkRole = require('../middlewares/roleCheck');

router.post('/events/:eventId/sessions', auth, checkRole('admin', 'organizer'), createSession);
router.get('/events/:eventId/sessions', getEventSessions);
router.put('/:id', auth, checkRole('admin', 'organizer'), updateSession);
router.delete('/:id', auth, checkRole('admin', 'organizer'), deleteSession);

module.exports = router;
