const { Session, Event } = require('../models');

const createSession = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findByPk(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check authorization
    if (req.user.role !== 'admin' && event.organizerId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const session = await Session.create({
      ...req.body,
      eventId
    });

    res.status(201).json({
      message: 'Session created successfully',
      session
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getEventSessions = async (req, res) => {
  try {
    const { eventId } = req.params;

    const sessions = await Session.findAll({
      where: { eventId },
      order: [['startTime', 'ASC']]
    });

    res.json({ sessions, count: sessions.length });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateSession = async (req, res) => {
  try {
    const session = await Session.findByPk(req.params.id, {
      include: [{ model: Event, as: 'event' }]
    });

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Check authorization
    if (req.user.role !== 'admin' && session.event.organizerId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await session.update(req.body);

    res.json({
      message: 'Session updated successfully',
      session
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteSession = async (req, res) => {
  try {
    const session = await Session.findByPk(req.params.id, {
      include: [{ model: Event, as: 'event' }]
    });

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Check authorization
    if (req.user.role !== 'admin' && session.event.organizerId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await session.destroy();

    res.json({ message: 'Session deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createSession,
  getEventSessions,
  updateSession,
  deleteSession
};
