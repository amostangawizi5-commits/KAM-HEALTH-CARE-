const { ConsultantAssessment, Patient, User, Visit } = require('../models');
const { Op } = require('sequelize');

exports.getQueue = async (req, res) => {
  try {
    const visits = await Visit.findAll({
      where: {
        status: { [Op.in]: ['WAITING_CONSULTANT', 'UNDER_CONSULTATION'] }
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
    const visit = await Visit.findByPk(req.params.visitId, { include: [Patient] });

    if (!visit) {
      return res.status(404).json({ success: false, message: 'Visit not found' });
    }

    if (!['WAITING_CONSULTANT', 'UNDER_CONSULTATION'].includes(visit.status)) {
      return res.status(400).json({
        success: false,
        message: `Visit cannot be accepted from status ${visit.status}`
      });
    }

    await visit.update({ status: 'UNDER_CONSULTATION' });
    res.json({ success: true, data: visit });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createAssessment = async (req, res) => {
  try {
    const {
      visitId,
      consultantId,
      weight,
      height,
      temperature,
      bloodPressureSystolic,
      bloodPressureDiastolic,
      pulseRate,
      oxygenSaturation,
      chiefComplaint,
      medicalHistory,
      notes
    } = req.body;

    if (!visitId) {
      return res.status(400).json({ success: false, message: 'visitId is required' });
    }

    if (!consultantId) {
      return res.status(400).json({ success: false, message: 'consultantId is required' });
    }

    if (!chiefComplaint?.trim()) {
      return res.status(400).json({ success: false, message: 'Chief complaint is required' });
    }

    const visit = await Visit.findByPk(visitId, { include: [Patient] });

    if (!visit) {
      return res.status(404).json({ success: false, message: 'Visit not found' });
    }

    const assessmentPayload = {
      visitId,
      consultantId,
      weight: weight || null,
      height: height || null,
      temperature: temperature || null,
      bloodPressureSystolic: bloodPressureSystolic || null,
      bloodPressureDiastolic: bloodPressureDiastolic || null,
      pulseRate: pulseRate || null,
      oxygenSaturation: oxygenSaturation || null,
      chiefComplaint: chiefComplaint.trim(),
      medicalHistory: medicalHistory || null,
      notes: notes || null
    };

    const existingAssessment = await ConsultantAssessment.findOne({ where: { visitId } });
    const assessment = existingAssessment
      ? await existingAssessment.update(assessmentPayload)
      : await ConsultantAssessment.create(assessmentPayload);

    await visit.update({ status: 'WAITING_DOCTOR' });

    const readyForDoctor = await Visit.findByPk(visitId, {
      include: [Patient, ConsultantAssessment]
    });

    const io = req.app.get('io');
    if (io) {
      io.to('queue-doctor').emit('patient-sent-to-doctor', readyForDoctor);
    }

    res.status(existingAssessment ? 200 : 201).json({
      success: true,
      data: {
        visit: readyForDoctor,
        assessment
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
