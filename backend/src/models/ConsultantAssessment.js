const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ConsultantAssessment = sequelize.define('ConsultantAssessment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  visitId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  consultantId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  weight: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true
  },
  height: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true
  },
  temperature: {
    type: DataTypes.DECIMAL(4, 1),
    allowNull: true
  },
  bloodPressureSystolic: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  bloodPressureDiastolic: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  pulseRate: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  oxygenSaturation: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  chiefComplaint: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  medicalHistory: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  assessedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  timestamps: true,
  underscored: true,
  freezeTableName: true
});

module.exports = ConsultantAssessment;
