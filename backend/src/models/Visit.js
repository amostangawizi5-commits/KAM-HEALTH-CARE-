const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Visit = sequelize.define('Visit', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  patientId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  visitDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  status: {
    type: DataTypes.ENUM(
      'REGISTERED', 'WAITING_CONSULTANT', 'UNDER_CONSULTATION',
      'WAITING_DOCTOR', 'UNDER_DOCTOR', 'WAITING_LABORATORY',
      'IN_LABORATORY', 'LAB_COMPLETED', 'WAITING_DOCTOR_REVIEW',
      'PRESCRIBED', 'WAITING_PHARMACY', 'PAYMENT_PENDING',
      'DISPENSED', 'COMPLETED', 'CANCELLED'
    ),
    defaultValue: 'REGISTERED'
  },
  visitReason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  queueNumber: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  isEmergency: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  registeredBy: {
    type: DataTypes.UUID,
    allowNull: false
  },
  assignedConsultantId: {
    type: DataTypes.UUID,
    allowNull: true
  }
});

module.exports = Visit;
