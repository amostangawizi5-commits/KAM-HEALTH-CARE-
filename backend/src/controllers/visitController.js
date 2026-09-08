const { Patient, Visit } = require('../models');
const { Op } = require('sequelize');

const activeStatuses = [
  'REGISTERED',
  'WAITING_CONSULTANT',
  'UNDER_CONSULTATION',
  'WAITING_DOCTOR',
  'UNDER_DOCTOR',
  'WAITING_LABORATORY',
  'IN_LABORATORY',
  'LAB_COMPLETED',
  'WAITING_DOCTOR_REVIEW',
  'PRESCRIBED',
  'WAITING_PHARMACY',
  'PAYMENT_PENDING',
  'DISPENSED'
];

exports.getAllVisits = async (req, res) => {
  try {
    const where = {};

    if (req.query.active === 'true') {
      where.status = { [Op.in]: activeStatuses };
    } else if (req.query.status) {
      where.status = req.query.status;
    }

    const visits = await Visit.findAll({
      where,
      include: [
        {
          model: Patient,
          attributes: [
            'id',
            'patientNo',
            'firstName',
            'lastName',
            'dateOfBirth',
            'gender',
            'phone',
            'email',
            'address',
            'allergies'
          ]
        }
      ],
      order: [
        ['isEmergency', 'DESC'],
        ['visitDate', 'ASC']
      ]
    });

    res.json({ success: true, data: visits });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createVisit = async (req, res) => {
  try {
    const lastVisit = await Visit.findOne({
      where: {
        visitDate: {
          [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0))
        }
      },
      order: [['queueNumber', 'DESC']]
    });

    const visit = await Visit.create({
      ...req.body,
      status: req.body.status || 'REGISTERED',
      queueNumber: req.body.queueNumber || ((lastVisit?.queueNumber || 0) + 1)
    });

    const createdVisit = await Visit.findByPk(visit.id, { include: [Patient] });
    res.status(201).json({ success: true, data: createdVisit });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.sendToConsultant = async (req, res) => {
  try {
    const visit = await Visit.findByPk(req.params.id, { include: [Patient] });

    if (!visit) {
      return res.status(404).json({ success: false, message: 'Visit not found' });
    }

    if (!['REGISTERED', 'WAITING_CONSULTANT'].includes(visit.status)) {
      return res.status(400).json({
        success: false,
        message: `Visit cannot be sent to consultant from status ${visit.status}`
      });
    }

    await visit.update({ status: 'WAITING_CONSULTANT' });

    const io = req.app.get('io');
    if (io) {
      io.to('queue-consultant').emit('patient-sent-to-consultant', visit);
    }

    res.json({ success: true, data: visit });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
