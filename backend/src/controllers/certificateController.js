const { Certificate, User, Event, Ticket } = require('../models');
const { generateCertificateNumber } = require('../utils/tokenGenerator');
const { generateCertificate } = require('../utils/pdfGenerator');

const createCertificate = async (req, res) => {
  try {
    const { eventId } = req.body;
    const participantId = req.user.id;

    // Check if event exists
    const event = await Event.findByPk(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if participant has a ticket
    const ticket = await Ticket.findOne({
      where: { eventId, participantId }
    });

    if (!ticket) {
      return res.status(400).json({ message: 'You do not have a ticket for this event' });
    }

    // Check if participant was checked in
    if (!ticket.checkedIn) {
      return res.status(400).json({ message: 'You must attend the event to receive a certificate' });
    }

    // Check if certificate already exists
    const existingCert = await Certificate.findOne({
      where: { eventId, participantId }
    });

    if (existingCert) {
      return res.status(400).json({ message: 'Certificate already issued' });
    }

    // Generate certificate number
    const certificateNumber = generateCertificateNumber();

    // Get participant details
    const participant = await User.findByPk(participantId);

    // Generate PDF
    const pdfData = {
      participantName: participant.name,
      eventTitle: event.title,
      eventDate: event.startDate.toLocaleDateString(),
      eventLocation: event.location,
      certificateNumber,
      issueDate: new Date().toLocaleDateString()
    };

    const pdf = await generateCertificate(pdfData, `${certificateNumber}.pdf`);

    // Create certificate record
    const certificate = await Certificate.create({
      certificateNumber,
      pdfUrl: pdf.url,
      participantId,
      eventId
    });

    // Load relationships
    await certificate.reload({
      include: [
        { model: Event, as: 'event' },
        { model: User, as: 'participant', attributes: ['id', 'name', 'email'] }
      ]
    });

    res.status(201).json({
      message: 'Certificate generated successfully',
      certificate
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getMyCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.findAll({
      where: { participantId: req.user.id },
      include: [
        {
          model: Event,
          as: 'event'
        }
      ],
      order: [['issuedDate', 'DESC']]
    });

    res.json({ certificates, count: certificates.length });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getCertificateById = async (req, res) => {
  try {
    const certificate = await Certificate.findByPk(req.params.id, {
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

    if (!certificate) {
      return res.status(404).json({ message: 'Certificate not found' });
    }

    // Check authorization
    if (req.user.role === 'participant' && certificate.participantId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json({ certificate });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createCertificate,
  getMyCertificates,
  getCertificateById
};
