const mongoose = require('mongoose');
const Waitlist = require('../models/Waitlist');
const Reservation = require('../models/Reservation');
const Table = require('../models/Table');
const BookingLog = require('../models/BookingLog');
const { generateReservationId } = require('../utils/generateId');

/**
 * Add a customer to the waitlist
 */
const addToWaitlist = async ({ userId, restaurantId, branchId, date, timeSlot, partySize, specialRequests }) => {
  // Calculate position: count existing waiting entries for same branch/date/timeslot
  const existingCount = await Waitlist.countDocuments({
    branch: branchId,
    date,
    'timeSlot.start': timeSlot.start,
    status: 'waiting',
  });

  const position = existingCount + 1;

  const waitlistEntry = await Waitlist.create({
    user: userId,
    restaurant: restaurantId,
    branch: branchId,
    date,
    timeSlot,
    partySize,
    position,
    status: 'waiting',
    specialRequests,
  });

  return waitlistEntry;
};

/**
 * Promote the first eligible customer from the waitlist
 * Called when a reservation is cancelled
 */
const promoteFromWaitlist = async (cancelledReservation, io) => {
  const { branch, date, timeSlot, table } = cancelledReservation;
  const tableDoc = await Table.findById(table);

  if (!tableDoc) return null;

  // Find the first waiting customer whose party fits the freed table
  const eligibleEntry = await Waitlist.findOne({
    branch,
    date,
    'timeSlot.start': timeSlot.start,
    status: 'waiting',
    partySize: { $lte: tableDoc.capacity },
  }).sort({ position: 1 });

  if (!eligibleEntry) return null;

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // Verify table is still free (within transaction)
    const conflict = await Reservation.findOne({
      table: table,
      date,
      status: { $in: ['pending', 'confirmed', 'checked_in'] },
      $or: [
        {
          'timeSlot.start': { $lt: eligibleEntry.timeSlot.end },
          'timeSlot.end': { $gt: eligibleEntry.timeSlot.start },
        },
      ],
    }).session(session);

    if (conflict) {
      await session.abortTransaction();
      return null;
    }

    // Create new reservation for waitlisted customer
    const reservationId = generateReservationId();
    const newReservation = await Reservation.create(
      [
        {
          reservationId,
          user: eligibleEntry.user,
          restaurant: eligibleEntry.restaurant,
          branch: eligibleEntry.branch,
          table: table,
          date: eligibleEntry.date,
          timeSlot: eligibleEntry.timeSlot,
          partySize: eligibleEntry.partySize,
          status: 'confirmed',
          specialRequests: eligibleEntry.specialRequests,
        },
      ],
      { session }
    );

    // Update waitlist entry
    await Waitlist.findByIdAndUpdate(
      eligibleEntry._id,
      {
        status: 'promoted',
        promotedReservation: newReservation[0]._id,
        promotedAt: new Date(),
      },
      { session }
    );

    // Create booking log
    await BookingLog.create(
      [
        {
          reservation: newReservation[0]._id,
          action: 'waitlist_promoted',
          performedBy: eligibleEntry.user,
          details: `Promoted from waitlist position ${eligibleEntry.position}`,
          previousStatus: null,
          newStatus: 'confirmed',
        },
      ],
      { session }
    );

    await session.commitTransaction();


    // Emit real-time notification via Socket.io
    if (io) {
      io.to(`user_${eligibleEntry.user.toString()}`).emit('waitlist_promoted', {
        message: 'Great news! A table has become available and your reservation has been confirmed!',
        reservation: newReservation[0],
      });
    }

    return newReservation[0];
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Reorder waitlist positions after a cancellation
 */
const reorderPositions = async (branchId, date, timeSlotStart) => {
  const waitingEntries = await Waitlist.find({
    branch: branchId,
    date,
    'timeSlot.start': timeSlotStart,
    status: 'waiting',
  }).sort({ position: 1 });

  for (let i = 0; i < waitingEntries.length; i++) {
    if (waitingEntries[i].position !== i + 1) {
      await Waitlist.findByIdAndUpdate(waitingEntries[i]._id, { position: i + 1 });
    }
  }
};

module.exports = { addToWaitlist, promoteFromWaitlist, reorderPositions };
