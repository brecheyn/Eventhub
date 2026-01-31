const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Ticket = sequelize.define('Ticket', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  ticketNumber: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  qrCode: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'cancelled'),
    defaultValue: 'confirmed'
  },
  checkedIn: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  checkedInAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  participantId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  eventId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Events',
      key: 'id'
    }
  }
}, {
  timestamps: true
});

module.exports = Ticket;
