const express = require('express');
const router = express.Router();
const {
  createTicket,
  getMyTickets,
  getTicketById,
  cancelTicket
} = require('../controllers/ticketController');
const auth = require('../middlewares/auth');

// Si auth.js exporte directement la fonction
router.post('/', auth, createTicket);
router.get('/my-tickets', auth, getMyTickets);
router.get('/:id', auth, getTicketById);
router.delete('/:id', auth, cancelTicket);

module.exports = router;
