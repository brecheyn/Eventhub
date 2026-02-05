const { Ticket, Event, User } = require('../models');

const scanQRCode = async (req, res) => {
  try {
    const { ticketNumber, ticketId } = req.body;

    let ticket;

    if (ticketId) {
      ticket = await Ticket.findByPk(ticketId);
    } else if (ticketNumber) {
      ticket = await Ticket.findOne({ where: { ticketNumber } });
    } else {
      return res.status(400).json({ message: 'Ticket ID or number required' });
    }

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    if (ticket.status === 'cancelled') {
      return res.status(400).json({ message: 'This ticket has been cancelled' });
    }

    if (ticket.checkedIn) {
      return res.status(400).json({
        message: 'Ticket already checked in',
        checkedInAt: ticket.checkedInAt
      });
    }

    // Check in the ticket
    await ticket.update({
      checkedIn: true,
      checkedInAt: new Date()
    });

    // Load relationships
    await ticket.reload({
      include: [
        {
          model: Event,
          as: 'event'
        },
        {
          model: User,
          as: 'participant',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    res.json({
      message: 'Check-in successful',
      ticket
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getCheckinStats = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findByPk(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const totalTickets = await Ticket.count({ where: { eventId } });
    const checkedInTickets = await Ticket.count({ 
      where: { eventId, checkedIn: true } 
    });

    const stats = {
      totalTickets,
      checkedIn: checkedInTickets,
      notCheckedIn: totalTickets - checkedInTickets,
      checkinRate: totalTickets > 0 ? ((checkedInTickets / totalTickets) * 100).toFixed(2) : 0
    };

    res.json({ stats });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  scanQRCode,
  getCheckinStats
};
