const { Certificate, User, Event, Ticket } = require("../models");
const { generateCertificateNumber } = require("../utils/tokenGenerator");
const { generateCertificate } = require("../utils/pdfGenerator");

const createCertificate = async (req, res) => {
  try {
    const { eventId } = req.body;
    const participantId = req.user.id;

    // Charger l'événement AVEC l'organisateur
    const event = await Event.findByPk(eventId, {
      include: [
        {
          model: User,
          as: "organizer",
          attributes: ["id", "name", "email", "organization"],
        },
      ],
    });

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Vérifier le ticket
    const ticket = await Ticket.findOne({
      where: { eventId, participantId },
    });

    if (!ticket) {
      return res
        .status(400)
        .json({ message: "You do not have a ticket for this event" });
    }

    // Vérifier le check-in
    if (!ticket.checkedIn) {
      return res.status(400).json({
        message: "You must attend the event to receive a certificate",
      });
    }

    // Vérifier si certificat existe déjà
    const existingCert = await Certificate.findOne({
      where: { eventId, participantId },
    });

    if (existingCert) {
      return res.status(400).json({ message: "Certificate already issued" });
    }

    // Générer le numéro
    const certificateNumber = generateCertificateNumber();

    // Charger le participant
    const participant = await User.findByPk(participantId, {
      attributes: ["id", "name", "email"],
    });

    //  CORRECTION: Envoyer les objets complets (pas juste des strings)
    console.log("📄 Génération du certificat...");
    console.log("Participant:", participant.name);
    console.log("Event:", event.title);
    console.log("Organizer:", event.organizer?.name);

    const pdf = await generateCertificate(
      participant, //  Objet complet
      event, //  Objet complet avec organizer
      certificateNumber,
    );

    console.log(" PDF généré:", pdf.url);

    // Créer le certificat
    const certificate = await Certificate.create({
      certificateNumber,
      pdfUrl: pdf.url,
      issuedDate: new Date(), //  Ajouter issuedDate
      participantId,
      eventId,
    });

    // Charger avec relations
    await certificate.reload({
      include: [
        {
          model: Event,
          as: "event",
          include: [
            {
              model: User,
              as: "organizer",
              attributes: ["id", "name", "organization"],
            },
          ],
        },
        {
          model: User,
          as: "participant",
          attributes: ["id", "name", "email"],
        },
      ],
    });

    res.status(201).json({
      message: "Certificate generated successfully",
      certificate,
    });
  } catch (error) {
    console.error(" Erreur génération certificat:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getMyCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.findAll({
      where: { participantId: req.user.id },
      include: [
        {
          model: Event,
          as: "event",
          include: [
            {
              model: User,
              as: "organizer",
              attributes: ["id", "name", "organization"],
            },
          ],
        },
      ],
      order: [["issuedDate", "DESC"]],
    });

    res.json({ certificates, count: certificates.length });
  } catch (error) {
    console.error(" Erreur chargement certificats:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getCertificateById = async (req, res) => {
  try {
    const certificate = await Certificate.findByPk(req.params.id, {
      include: [
        {
          model: Event,
          as: "event",
          include: [
            {
              model: User,
              as: "organizer",
              attributes: ["id", "name", "organization"],
            },
          ],
        },
        {
          model: User,
          as: "participant",
          attributes: ["id", "name", "email"],
        },
      ],
    });

    if (!certificate) {
      return res.status(404).json({ message: "Certificate not found" });
    }

    // Vérifier autorisation
    if (
      req.user.role === "participant" &&
      certificate.participantId !== req.user.id
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json({ certificate });
  } catch (error) {
    console.error(" Erreur:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  createCertificate,
  getMyCertificates,
  getCertificateById,
};
