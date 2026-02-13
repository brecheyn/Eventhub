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
const upload = require('../middlewares/upload');

router.get('/', getAllEvents);
router.get('/:id', getEventById);
router.post('/', auth, checkRole('admin', 'organizer'), upload.single('image'), createEventValidator, createEvent);
router.put('/:id', auth, checkRole('admin', 'organizer'), upload.single('image'), updateEvent);
router.delete('/:id', auth, checkRole('admin', 'organizer'), deleteEvent);
router.get('/:id/participants', auth, getEventParticipants);

module.exports = router;