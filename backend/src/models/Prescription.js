const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Prescription = sequelize.define('Prescription', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  visitId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  doctorId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  pharmacistId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  prescribedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  dispensedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'DISPENSED', 'PARTIAL', 'CANCELLED', 'HOLD'),
    defaultValue: 'PENDING'
  },
  priority: {
    type: DataTypes.ENUM('STAT', 'HIGH', 'NORMAL', 'LOW'),
    defaultValue: 'NORMAL'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  timestamps: true,
  underscored: true,
  freezeTableName: true
});

module.exports = Prescription;
