const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Event = sequelize.define('Event', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false
  },
  venue: {
    type: DataTypes.STRING,
    allowNull: true
  },
  maxCapacity: {
    type: DataTypes.INTEGER,
    defaultValue: 100
  },
  currentCapacity: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  ticketPrice: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  isFree: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  status: {
    type: DataTypes.ENUM('draft', 'published', 'ongoing', 'completed', 'cancelled'),
    defaultValue: 'draft'
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  organizerId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  }
}, {
  timestamps: true
});

module.exports = Event;
