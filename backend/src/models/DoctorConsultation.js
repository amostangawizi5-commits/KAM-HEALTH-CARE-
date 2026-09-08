const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DoctorConsultation = sequelize.define('DoctorConsultation', {
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
  diagnosis: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  observations: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  treatmentPlan: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  decision: {
    type: DataTypes.ENUM('SEND_LAB', 'SEND_PHARMACY', 'ADMIT', 'REFER', 'DISCHARGE', 'OTHER'),
    allowNull: true
  },
  consultedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  timestamps: true,
  underscored: true,
  freezeTableName: true
});

module.exports = DoctorConsultation;
