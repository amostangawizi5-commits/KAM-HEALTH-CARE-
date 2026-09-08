const { ConsultantAssessment, DoctorConsultation, Patient, Prescription, User, Visit } = require('../models');
const { Op } = require('sequelize');

exports.getQueue = async (req, res) => {
  try {
    const visits = await Visit.findAll({
      where: {
        status: { [Op.in]: ['WAITING_DOCTOR', 'UNDER_DOCTOR', 'WAITING_DOCTOR_REVIEW'] }
      },
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
            'allergies'
          ]
        },
        {
          model: ConsultantAssessment,
          include: [
            {
              model: User,
              as: 'consultant',
              attributes: ['id', 'firstName', 'lastName', 'specialization']
            }
          ]
        },
        {
          model: DoctorConsultation,
          include: [
            {
              model: User,
              as: 'doctor',
              attributes: ['id', 'firstName', 'lastName', 'specialization']
            }
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

exports.startConsultation = async (req, res) => {
  try {
    const visit = await Visit.findByPk(req.params.visitId, { include: [Patient, ConsultantAssessment] });

    if (!visit) {
      return res.status(404).json({ success: false, message: 'Visit not found' });
    }

    if (!['WAITING_DOCTOR', 'UNDER_DOCTOR', 'WAITING_DOCTOR_REVIEW'].includes(visit.status)) {
      return res.status(400).json({
        success: false,
        message: `Visit cannot be opened by doctor from status ${visit.status}`
      });
    }

    await visit.update({ status: 'UNDER_DOCTOR' });
    res.json({ success: true, data: visit });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createConsultation = async (req, res) => {
  try {
    const {
      visitId,
      doctorId,
      diagnosis,
      observations,
      treatmentPlan,
      notes,
      decision = 'OTHER'
    } = req.body;

    if (!visitId) {
      return res.status(400).json({ success: false, message: 'visitId is required' });
    }

    if (!doctorId) {
      return res.status(400).json({ success: false, message: 'doctorId is required' });
    }

    const visit = await Visit.findByPk(visitId);

    if (!visit) {
      return res.status(404).json({ success: false, message: 'Visit not found' });
    }

    const consultationPayload = {
      visitId,
      doctorId,
      diagnosis: diagnosis || null,
      observations: observations || null,
      treatmentPlan: treatmentPlan || null,
      notes: notes || null,
      decision
    };

    const existingConsultation = await DoctorConsultation.findOne({ where: { visitId } });
    const consultation = existingConsultation
      ? await existingConsultation.update(consultationPayload)
      : await DoctorConsultation.create(consultationPayload);

    const nextStatus = {
      SEND_LAB: 'WAITING_LABORATORY',
      SEND_PHARMACY: 'WAITING_PHARMACY',
      DISCHARGE: 'COMPLETED',
      ADMIT: 'COMPLETED',
      REFER: 'COMPLETED',
      OTHER: 'UNDER_DOCTOR'
    }[decision] || 'UNDER_DOCTOR';

    await visit.update({ status: nextStatus });

    res.status(existingConsultation ? 200 : 201).json({
      success: true,
      data: {
        visit,
        consultation
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createPrescription = async (req, res) => {
  try {
    res.json({ success: true, message: 'Prescription created - To be implemented' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
