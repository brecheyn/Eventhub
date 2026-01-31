const { Ticket, Event, User } = require('../models');
const { generateTicketNumber } = require('../utils/tokenGenerator');
const { generateQRCode } = require('../utils/qrGenerator');

const createTicket = async (req, res) => {
  try {
    const { eventId } = req.body;
    const participantId = req.user.id;

    // Check if event exists
    const event = await Event.findByPk(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check capacity
    if (event.currentCapacity >= event.maxCapacity) {
      return res.status(400).json({ message: 'Event is full' });
    }

    // Check if user already has a ticket
    const existingTicket = await Ticket.findOne({
      where: { eventId, participantId }
    });

    if (existingTicket) {
      return res.status(400).json({ message: 'You already have a ticket for this event' });
    }

    // Generate ticket number
    const ticketNumber = generateTicketNumber();

    // Create ticket
    const ticket = await Ticket.create({
      ticketNumber,
      eventId,
      participantId,
      status: 'confirmed'
    });

    // Generate QR code
    const qrData = JSON.stringify({
      ticketId: ticket.id,
      ticketNumber: ticket.ticketNumber,
      eventId: event.id
    });

    const qrCode = await generateQRCode(qrData, `${ticketNumber}.png`);

    // Update ticket with QR code
    await ticket.update({ qrCode: qrCode.base64 });

    // Update event capacity
    await event.increment('currentCapacity');

    // Load relationships
    await ticket.reload({
      include: [
        { model: Event, as: 'event' },
        { model: User, as: 'participant', attributes: ['id', 'name', 'email'] }
      ]
    });

    res.status(201).json({
      message: 'Ticket created successfully',
      ticket
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getMyTickets = async (req, res) => {
  try {
    const tickets = await Ticket.findAll({
      where: { participantId: req.user.id },
      include: [
        {
          model: Event,
          as: 'event',
          include: [
            {
              model: User,
              as: 'organizer',
              attributes: ['id', 'name', 'organization']
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({ tickets, count: tickets.length });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findByPk(req.params.id, {
      include: [
        {
          model: Event,
          as: 'event'
        },
        {
          model: User,
          as: 'participant',
          attributes: ['id', 'name', 'email', 'phone']
        }
      ]
    });

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Check authorization
    if (req.user.role === 'participant' && ticket.participantId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view this ticket' });
    }

    res.json({ ticket });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const cancelTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findByPk(req.params.id);

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Check authorization
    if (ticket.participantId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to cancel this ticket' });
    }

    if (ticket.checkedIn) {
      return res.status(400).json({ message: 'Cannot cancel a checked-in ticket' });
    }

    await ticket.update({ status: 'cancelled' });

    // Decrease event capacity
    const event = await Event.findByPk(ticket.eventId);
    await event.decrement('currentCapacity');

    res.json({ message: 'Ticket cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createTicket,
  getMyTickets,
  getTicketById,
  cancelTicket
};
