const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PharmacyBill = sequelize.define('PharmacyBill', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  visitId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  invoiceNo: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  discount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  insuranceAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  paidAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  balance: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'PAID', 'PARTIAL', 'INSURANCE', 'CREDIT', 'VOID'),
    defaultValue: 'PENDING'
  },
  paymentMethod: {
    type: DataTypes.ENUM('CASH', 'CARD', 'M_PESA', 'INSURANCE', 'CREDIT'),
    allowNull: true
  },
  insuranceProvider: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  paidAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  timestamps: true,
  underscored: true,
  freezeTableName: true
});

module.exports = PharmacyBill;
