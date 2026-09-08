const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { randomInt } = require('crypto');

const generatePatientNumber = () => {
  const digits = String(randomInt(0, 1000)).padStart(3, '0');
  const letter = String.fromCharCode(65 + randomInt(0, 26));
  return `${digits}${letter}`;
};

const Patient = sequelize.define('Patient', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  patientNo: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    validate: {
      is: /^[0-9]{3}[A-Z]$/
    }
  },
  firstName: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  lastName: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  dateOfBirth: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  gender: {
    type: DataTypes.ENUM('MALE', 'FEMALE', 'OTHER'),
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  emergencyContact: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  bloodGroup: {
    type: DataTypes.ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'),
    allowNull: true
  },
  allergies: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  hooks: {
    beforeValidate: async (patient) => {
      if (!patient.isNewRecord) return;

      let patientNo;
      do {
        patientNo = generatePatientNumber();
      } while (await Patient.findOne({ where: { patientNo }, attributes: ['id'] }));

      patient.patientNo = patientNo;
    }
  }
});

Patient.prototype.getFullName = function() {
  return `${this.firstName} ${this.lastName}`;
};

module.exports = Patient;
