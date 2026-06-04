const Reservation = require('../models/Reservation');
const BookingLog = require('../models/BookingLog');
const { allocateTable } = require('../services/allocationService');
const { promoteFromWaitlist } = require('../services/waitlistService');

// @desc    Create reservation (triggers smart allocation)
// @route   POST /api/reservations
// @access  Private
const createReservation = async (req, res, next) => {
  try {
    const { branchId, restaurantId, date, startTime, endTime, partySize, specialRequests } = req.body;

    if (!branchId || !restaurantId || !date || !startTime || !endTime || !partySize) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    // Validate date is in the future
    const reservationDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (reservationDate < today) {
      return res.status(400).json({
        success: false,
        message: 'Cannot make reservations for past dates',
      });
    }

    const result = await allocateTable(
      {
        branchId,
        restaurantId,
        date: reservationDate,
        timeSlot: { start: startTime, end: endTime },
        partySize: parseInt(partySize),
        specialRequests,
      },
      req.user.id
    );

    // Emit real-time update via Socket.io
    const io = req.app.get('io');
    if (io && result.success) {
      io.to(`branch_${branchId}`).emit('table_updated', {
        branchId,
        message: 'Table availability changed',
      });
    }

    if (result.waitlisted) {
      return res.status(200).json({
        success: true,
        waitlisted: true,
        message: result.message,
        data: result.waitlistEntry,
      });
    }


    res.status(201).json({
      success: true,
      waitlisted: false,
      message: result.message,
      data: result.reservation,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's reservations
// @route   GET /api/reservations
// @access  Private
const getMyReservations = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = { user: req.user.id };

    if (status) {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [reservations, total] = await Promise.all([
      Reservation.find(query)
        .populate('restaurant', 'name images cuisine')
        .populate('branch', 'name address')
        .populate('table', 'tableNumber capacity location')
        .sort({ date: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Reservation.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: reservations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single reservation
// @route   GET /api/reservations/:id
// @access  Private
const getReservation = async (req, res, next) => {
  try {
    const reservation = await Reservation.findById(req.params.id)
      .populate('restaurant', 'name images cuisine address phone')
      .populate('branch', 'name address phone')
      .populate('table', 'tableNumber capacity location')
      .populate('user', 'name email phone');

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found',
      });
    }

    // Check access (own reservation, restaurant owner, or admin)
    if (
      reservation.user._id.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this reservation',
      });
    }

    // Get booking logs
    const logs = await BookingLog.find({ reservation: reservation._id })
      .populate('performedBy', 'name')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        ...reservation.toObject(),
        logs,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel reservation
// @route   PUT /api/reservations/:id/cancel
// @access  Private
const cancelReservation = async (req, res, next) => {
  try {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found',
      });
    }

    if (reservation.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this reservation',
      });
    }

    if (['cancelled', 'completed', 'expired'].includes(reservation.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel a reservation with status: ${reservation.status}`,
      });
    }

    const previousStatus = reservation.status;
    reservation.status = 'cancelled';
    reservation.cancellationReason = req.body.reason || 'Cancelled by user';
    reservation.cancelledAt = new Date();
    await reservation.save();

    // Log the cancellation
    await BookingLog.create({
      reservation: reservation._id,
      action: 'cancelled',
      performedBy: req.user.id,
      details: reservation.cancellationReason,
      previousStatus,
      newStatus: 'cancelled',
    });

    // Try to promote someone from waitlist
    const io = req.app.get('io');
    await promoteFromWaitlist(reservation, io);

    // Emit real-time update
    if (io) {
      io.to(`branch_${reservation.branch.toString()}`).emit('table_updated', {
        branchId: reservation.branch,
        message: 'Table availability changed',
      });
    }


    res.json({
      success: true,
      message: 'Reservation cancelled successfully',
      data: reservation,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check in
// @route   PUT /api/reservations/:id/check-in
// @access  Private (owner, admin)
const checkIn = async (req, res, next) => {
  try {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found',
      });
    }

    if (reservation.status !== 'confirmed') {
      return res.status(400).json({
        success: false,
        message: 'Only confirmed reservations can be checked in',
      });
    }

    const previousStatus = reservation.status;
    reservation.status = 'checked_in';
    reservation.checkedInAt = new Date();
    await reservation.save();

    await BookingLog.create({
      reservation: reservation._id,
      action: 'checked_in',
      performedBy: req.user.id,
      details: 'Customer checked in',
      previousStatus,
      newStatus: 'checked_in',
    });

    res.json({
      success: true,
      message: 'Checked in successfully',
      data: reservation,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark as completed
// @route   PUT /api/reservations/:id/complete
// @access  Private (owner, admin)
const completeReservation = async (req, res, next) => {
  try {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found',
      });
    }

    if (reservation.status !== 'checked_in') {
      return res.status(400).json({
        success: false,
        message: 'Only checked-in reservations can be completed',
      });
    }

    const previousStatus = reservation.status;
    reservation.status = 'completed';
    reservation.completedAt = new Date();
    await reservation.save();

    await BookingLog.create({
      reservation: reservation._id,
      action: 'completed',
      performedBy: req.user.id,
      details: 'Reservation completed',
      previousStatus,
      newStatus: 'completed',
    });

    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
      io.to(`branch_${reservation.branch.toString()}`).emit('table_updated', {
        branchId: reservation.branch,
        message: 'Table availability changed',
      });
    }

    res.json({
      success: true,
      message: 'Reservation completed',
      data: reservation,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all reservations for a branch (owner view)
// @route   GET /api/reservations/branch/:branchId
// @access  Private (owner, admin)
const getBranchReservations = async (req, res, next) => {
  try {
    const { date, status, page = 1, limit = 20 } = req.query;
    const query = { branch: req.params.branchId };

    if (date) query.date = new Date(date);
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [reservations, total] = await Promise.all([
      Reservation.find(query)
        .populate('user', 'name email phone')
        .populate('table', 'tableNumber capacity location')
        .sort({ date: -1, 'timeSlot.start': 1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Reservation.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: reservations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReservation,
  getMyReservations,
  getReservation,
  cancelReservation,
  checkIn,
  completeReservation,
  getBranchReservations,
};
