const Waitlist = require('../models/Waitlist');

// @desc    Get user's waitlist entries
// @route   GET /api/waitlist
// @access  Private
const getMyWaitlist = async (req, res, next) => {
  try {
    const entries = await Waitlist.find({ user: req.user.id })
      .populate('restaurant', 'name images')
      .populate('branch', 'name address')
      .populate('promotedReservation')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: entries,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel waitlist entry
// @route   DELETE /api/waitlist/:id
// @access  Private
const cancelWaitlist = async (req, res, next) => {
  try {
    const entry = await Waitlist.findById(req.params.id);

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Waitlist entry not found',
      });
    }

    if (entry.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    if (entry.status !== 'waiting') {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel a waitlist entry with status: ${entry.status}`,
      });
    }

    entry.status = 'cancelled';
    await entry.save();

    res.json({
      success: true,
      message: 'Removed from waitlist',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get waitlist for a branch (owner view)
// @route   GET /api/waitlist/branch/:branchId
// @access  Private (owner, admin)
const getBranchWaitlist = async (req, res, next) => {
  try {
    const { date, status = 'waiting' } = req.query;
    const query = { branch: req.params.branchId, status };

    if (date) query.date = new Date(date);

    const entries = await Waitlist.find(query)
      .populate('user', 'name email phone')
      .sort({ position: 1 });

    res.json({
      success: true,
      data: entries,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getMyWaitlist, cancelWaitlist, getBranchWaitlist };
