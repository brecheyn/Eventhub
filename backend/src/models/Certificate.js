const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Certificate = sequelize.define('Certificate', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  certificateNumber: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  pdfUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  issuedDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
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

module.exports = Certificate;
