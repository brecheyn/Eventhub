const { Event, User, Ticket, Session } = require('../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

const createEvent = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const eventData = {
      ...req.body,
      organizerId: req.user.id
    };

    const event = await Event.create(eventData);

    res.status(201).json({
      message: 'Event created successfully',
      event
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getAllEvents = async (req, res) => {
  try {
    const { status, search, startDate, endDate } = req.query;
    
    let where = {};
    
    if (status) {
      where.status = status;
    }
    
    if (search) {
      where.title = { [Op.iLike]: `%${search}%` };
    }
    
    if (startDate && endDate) {
      where.startDate = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    const events = await Event.findAll({
      where,
      include: [
        {
          model: User,
          as: 'organizer',
          attributes: ['id', 'name', 'email', 'organization']
        }
      ],
      order: [['startDate', 'ASC']]
    });

    res.json({ events, count: events.length });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getEventById = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'organizer',
          attributes: ['id', 'name', 'email', 'organization']
        },
        {
          model: Session,
          as: 'sessions'
        }
      ]
    });

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json({ event });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateEvent = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check authorization
    if (req.user.role !== 'admin' && event.organizerId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this event' });
    }

    await event.update(req.body);

    res.json({
      message: 'Event updated successfully',
      event
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check authorization
    if (req.user.role !== 'admin' && event.organizerId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this event' });
    }

    await event.destroy();

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getEventParticipants = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const tickets = await Ticket.findAll({
      where: { eventId: req.params.id },
      include: [
        {
          model: User,
          as: 'participant',
          attributes: ['id', 'name', 'email', 'phone']
        }
      ]
    });

    const stats = {
      total: tickets.length,
      checkedIn: tickets.filter(t => t.checkedIn).length,
      pending: tickets.filter(t => !t.checkedIn).length
    };

    res.json({ tickets, stats });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  getEventParticipants
};
