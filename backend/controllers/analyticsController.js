const mongoose = require('mongoose');
const Reservation = require('../models/Reservation');
const Restaurant = require('../models/Restaurant');
const Table = require('../models/Table');

// @desc    Get dashboard analytics
// @route   GET /api/analytics/dashboard
// @access  Private (restaurant_owner, admin)
const getDashboard = async (req, res, next) => {
  try {
    const { restaurantId, branchId, startDate, endDate } = req.query;

    // Date range defaults to last 30 days
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate
      ? new Date(startDate)
      : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Build match stage
    const matchStage = {
      date: { $gte: start, $lte: end },
    };

    if (restaurantId) {
      matchStage.restaurant = new mongoose.Types.ObjectId(restaurantId);
    }
    if (branchId) {
      matchStage.branch = new mongoose.Types.ObjectId(branchId);
    }

    // If restaurant owner, only show their restaurants
    if (req.user.role === 'restaurant_owner') {
      const myRestaurants = await Restaurant.find({ owner: req.user.id }).select('_id');
      const restaurantIds = myRestaurants.map((r) => r._id);
      matchStage.restaurant = { $in: restaurantIds };
    }

    // Run all aggregation queries in parallel
    const [
      totalBookings,
      statusBreakdown,
      peakHours,
      dailyBookings,
      topCustomers,
      occupancyData,
    ] = await Promise.all([
      // Total bookings count
      Reservation.countDocuments(matchStage),

      // Status breakdown (confirmed, cancelled, completed, etc.)
      Reservation.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
      ]),

      // Peak booking hours
      Reservation.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: { $substr: ['$timeSlot.start', 0, 2] },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
        {
          $project: {
            hour: '$_id',
            count: 1,
            _id: 0,
          },
        },
      ]),

      // Daily bookings trend
      Reservation.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$date' },
            },
            count: { $sum: 1 },
            confirmed: {
              $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] },
            },
            cancelled: {
              $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] },
            },
          },
        },
        { $sort: { _id: 1 } },
        {
          $project: {
            date: '$_id',
            count: 1,
            confirmed: 1,
            cancelled: 1,
            _id: 0,
          },
        },
      ]),

      // Most active customers
      Reservation.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: '$user',
            bookingCount: { $sum: 1 },
            totalPartySize: { $sum: '$partySize' },
          },
        },
        { $sort: { bookingCount: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user',
          },
        },
        { $unwind: '$user' },
        {
          $project: {
            name: '$user.name',
            email: '$user.email',
            bookingCount: 1,
            totalPartySize: 1,
            _id: 0,
          },
        },
      ]),

      // Occupancy rate calculation
      (async () => {
        const branchQuery = {};
        if (branchId) branchQuery._id = new mongoose.Types.ObjectId(branchId);
        if (restaurantId) branchQuery.restaurant = new mongoose.Types.ObjectId(restaurantId);

        const totalTables = await Table.countDocuments({
          ...branchQuery,
          isActive: true,
          ...(branchId ? { branch: new mongoose.Types.ObjectId(branchId) } : {}),
        });

        const daysInRange = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) || 1;
        const totalSlots = totalTables * daysInRange;

        const bookedSlots = await Reservation.countDocuments({
          ...matchStage,
          status: { $in: ['confirmed', 'checked_in', 'completed'] },
        });

        return {
          totalTables,
          totalSlots,
          bookedSlots,
          occupancyRate: totalSlots > 0 ? Math.round((bookedSlots / totalSlots) * 100) : 0,
        };
      })(),
    ]);

    // Calculate cancellation percentage
    const cancelledCount = statusBreakdown.find((s) => s._id === 'cancelled')?.count || 0;
    const cancellationRate =
      totalBookings > 0 ? Math.round((cancelledCount / totalBookings) * 100) : 0;

    res.json({
      success: true,
      data: {
        overview: {
          totalBookings,
          cancellationRate,
          occupancyRate: occupancyData.occupancyRate,
          totalTables: occupancyData.totalTables,
        },
        statusBreakdown,
        peakHours,
        dailyBookings,
        topCustomers,
        dateRange: { start, end },
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboard };
