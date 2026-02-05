const express = require('express');
const router = express.Router();
const {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  getEventParticipants
} = require('../controllers/eventController');
const { createEventValidator } = require('../validators/eventValidator');
const auth = require('../middlewares/auth');
const checkRole = require('../middlewares/roleCheck');

router.get('/', getAllEvents);
router.get('/:id', getEventById);
router.post('/', auth, checkRole('admin', 'organizer'), createEventValidator, createEvent);
router.put('/:id', auth, checkRole('admin', 'organizer'), updateEvent);
router.delete('/:id', auth, checkRole('admin', 'organizer'), deleteEvent);
router.get('/:id/participants', auth, getEventParticipants);

module.exports = router;
