const User = require('./User');
const Event = require('./Event');
const Ticket = require('./Ticket');
const Session = require('./Session');
const Certificate = require('./Certificate');

// Relations User - Event
User.hasMany(Event, { foreignKey: 'organizerId', as: 'organizedEvents' });
Event.belongsTo(User, { foreignKey: 'organizerId', as: 'organizer' });

// Relations Event - Ticket
Event.hasMany(Ticket, { foreignKey: 'eventId', as: 'tickets' });
Ticket.belongsTo(Event, { foreignKey: 'eventId', as: 'event' });

// Relations User - Ticket
User.hasMany(Ticket, { foreignKey: 'participantId', as: 'tickets' });
Ticket.belongsTo(User, { foreignKey: 'participantId', as: 'participant' });

// Relations Event - Session
Event.hasMany(Session, { foreignKey: 'eventId', as: 'sessions' });
Session.belongsTo(Event, { foreignKey: 'eventId', as: 'event' });

// Relations Certificate
User.hasMany(Certificate, { foreignKey: 'participantId', as: 'certificates' });
Certificate.belongsTo(User, { foreignKey: 'participantId', as: 'participant' });

Event.hasMany(Certificate, { foreignKey: 'eventId', as: 'certificates' });
Certificate.belongsTo(Event, { foreignKey: 'eventId', as: 'event' });

module.exports = {
  User,
  Event,
  Ticket,
  Session,
  Certificate
};
