const mongoose = require('mongoose');
const Table = require('../models/Table');
const Reservation = require('../models/Reservation');
const BookingLog = require('../models/BookingLog');
const { generateReservationId } = require('../utils/generateId');
const waitlistService = require('./waitlistService');

/**
 * Smart Table Allocation Algorithm
 * 1. Finds all tables at the branch with capacity >= partySize
 * 2. Sorts by capacity ASC (smallest fitting table first to minimize waste)
 * 3. Checks for conflicting reservations within a MongoDB transaction
 * 4. If no table available, adds to waitlist
 */
const allocateTable = async (bookingData, userId) => {
  const { branchId, restaurantId, date, timeSlot, partySize, specialRequests } = bookingData;
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // Find all active tables at the branch with sufficient capacity, sorted smallest first
    const tables = await Table.find({
      branch: branchId,
      isActive: true,
      capacity: { $gte: partySize },
    })
      .sort({ capacity: 1 })
      .session(session);

    if (tables.length === 0) {
      await session.abortTransaction();
      // No tables with sufficient capacity exist at all — add to waitlist
      const waitlistEntry = await waitlistService.addToWaitlist({
        userId,
        restaurantId,
        branchId,
        date,
        timeSlot,
        partySize,
        specialRequests,
      });
      return {
        success: false,
        waitlisted: true,
        waitlistEntry,
        message: 'No tables available. You have been added to the waitlist.',
      };
    }

    // Check each table for conflicting reservations
    let allocatedTable = null;

    for (const table of tables) {
      const conflict = await Reservation.findOne({
        table: table._id,
        date: date,
        status: { $in: ['pending', 'confirmed', 'checked_in'] },
        $or: [
          {
            'timeSlot.start': { $lt: timeSlot.end },
            'timeSlot.end': { $gt: timeSlot.start },
          },
        ],
      }).session(session);

      if (!conflict) {
        allocatedTable = table;
        break;
      }
    }

    if (!allocatedTable) {
      await session.abortTransaction();
      // All suitable tables are booked — add to waitlist
      const waitlistEntry = await waitlistService.addToWaitlist({
        userId,
        restaurantId,
        branchId,
        date,
        timeSlot,
        partySize,
        specialRequests,
      });
      return {
        success: false,
        waitlisted: true,
        waitlistEntry,
        message: 'All tables are booked for this time slot. You have been added to the waitlist.',
      };
    }

    // Create reservation
    const reservationId = generateReservationId();
    const reservation = await Reservation.create(
      [
        {
          reservationId,
          user: userId,
          restaurant: restaurantId,
          branch: branchId,
          table: allocatedTable._id,
          date,
          timeSlot,
          partySize,
          status: 'confirmed',
          specialRequests,
        },
      ],
      { session }
    );

    // Create booking log
    await BookingLog.create(
      [
        {
          reservation: reservation[0]._id,
          action: 'created',
          performedBy: userId,
          details: `Table ${allocatedTable.tableNumber} allocated for party of ${partySize}`,
          previousStatus: null,
          newStatus: 'confirmed',
          metadata: {
            tableNumber: allocatedTable.tableNumber,
            tableCapacity: allocatedTable.capacity,
            partySize,
          },
        },
      ],
      { session }
    );

    await session.commitTransaction();

    // Populate the reservation before returning
    const populatedReservation = await Reservation.findById(reservation[0]._id)
      .populate('restaurant', 'name')
      .populate('branch', 'name address')
      .populate('table', 'tableNumber capacity location')
      .populate('user', 'name email');

    return {
      success: true,
      waitlisted: false,
      reservation: populatedReservation,
      message: `Table ${allocatedTable.tableNumber} reserved successfully!`,
    };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

module.exports = { allocateTable };
