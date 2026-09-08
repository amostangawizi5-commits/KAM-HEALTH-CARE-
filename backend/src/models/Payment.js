const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  billId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  paymentMethod: {
    type: DataTypes.ENUM('CASH', 'CARD', 'M_PESA', 'INSURANCE', 'CREDIT'),
    allowNull: false
  },
  receiptNo: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  referenceNo: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  receivedBy: {
    type: DataTypes.UUID,
    allowNull: false
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  paidAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  timestamps: true,
  underscored: true,
  freezeTableName: true
});

module.exports = Payment;
