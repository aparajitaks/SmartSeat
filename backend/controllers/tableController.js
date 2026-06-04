const Table = require('../models/Table');
const Branch = require('../models/Branch');
const Reservation = require('../models/Reservation');

// @desc    Get tables for a branch
// @route   GET /api/tables/branch/:branchId
// @access  Public
const getTables = async (req, res, next) => {
  try {
    const tables = await Table.find({
      branch: req.params.branchId,
      isActive: true,
    }).sort({ tableNumber: 1 });

    res.json({
      success: true,
      data: tables,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get available tables for a specific date/time
// @route   GET /api/tables/available
// @access  Public
const getAvailableTables = async (req, res, next) => {
  try {
    const { branchId, date, startTime, endTime, partySize } = req.query;

    if (!branchId || !date || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'Please provide branchId, date, startTime, and endTime',
      });
    }

    // Find all active tables at the branch
    const tableQuery = {
      branch: branchId,
      isActive: true,
    };

    if (partySize) {
      tableQuery.capacity = { $gte: parseInt(partySize) };
    }

    const allTables = await Table.find(tableQuery).sort({ capacity: 1 });

    // Find tables with conflicting reservations
    const conflictingReservations = await Reservation.find({
      branch: branchId,
      date: new Date(date),
      status: { $in: ['pending', 'confirmed', 'checked_in'] },
      $or: [
        {
          'timeSlot.start': { $lt: endTime },
          'timeSlot.end': { $gt: startTime },
        },
      ],
    }).select('table');

    const bookedTableIds = conflictingReservations.map((r) => r.table.toString());

    // Separate tables into available and booked
    const availableTables = allTables.filter((t) => !bookedTableIds.includes(t._id.toString()));
    const bookedTables = allTables.filter((t) => bookedTableIds.includes(t._id.toString()));

    res.json({
      success: true,
      data: {
        available: availableTables,
        booked: bookedTables,
        total: allTables.length,
        availableCount: availableTables.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create table
// @route   POST /api/tables
// @access  Private (restaurant_owner, admin)
const createTable = async (req, res, next) => {
  try {
    const branch = await Branch.findById(req.body.branch).populate('restaurant', 'owner');

    if (!branch) {
      return res.status(404).json({
        success: false,
        message: 'Branch not found',
      });
    }

    if (branch.restaurant.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    const table = await Table.create(req.body);

    // Update total tables count on branch
    const tableCount = await Table.countDocuments({ branch: req.body.branch, isActive: true });
    await Branch.findByIdAndUpdate(req.body.branch, { totalTables: tableCount });

    res.status(201).json({
      success: true,
      message: 'Table created successfully',
      data: table,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update table
// @route   PUT /api/tables/:id
// @access  Private (owner, admin)
const updateTable = async (req, res, next) => {
  try {
    let table = await Table.findById(req.params.id);

    if (!table) {
      return res.status(404).json({
        success: false,
        message: 'Table not found',
      });
    }

    table = await Table.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      message: 'Table updated successfully',
      data: table,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete table (soft)
// @route   DELETE /api/tables/:id
// @access  Private (owner, admin)
const deleteTable = async (req, res, next) => {
  try {
    const table = await Table.findById(req.params.id);

    if (!table) {
      return res.status(404).json({
        success: false,
        message: 'Table not found',
      });
    }

    table.isActive = false;
    await table.save();

    // Update total tables count
    const tableCount = await Table.countDocuments({ branch: table.branch, isActive: true });
    await Branch.findByIdAndUpdate(table.branch, { totalTables: tableCount });

    res.json({
      success: true,
      message: 'Table deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getTables, getAvailableTables, createTable, updateTable, deleteTable };
