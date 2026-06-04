const Branch = require('../models/Branch');
const Restaurant = require('../models/Restaurant');

// @desc    Get branches for a restaurant
// @route   GET /api/branches/restaurant/:restaurantId
// @access  Public
const getBranches = async (req, res, next) => {
  try {
    const branches = await Branch.find({
      restaurant: req.params.restaurantId,
      isActive: true,
    }).populate('restaurant', 'name');

    res.json({
      success: true,
      data: branches,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single branch
// @route   GET /api/branches/:id
// @access  Public
const getBranch = async (req, res, next) => {
  try {
    const branch = await Branch.findById(req.params.id).populate('restaurant', 'name owner');

    if (!branch) {
      return res.status(404).json({
        success: false,
        message: 'Branch not found',
      });
    }

    res.json({
      success: true,
      data: branch,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create branch
// @route   POST /api/branches
// @access  Private (restaurant_owner, admin)
const createBranch = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.body.restaurant);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found',
      });
    }

    // Check ownership
    if (restaurant.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add branches to this restaurant',
      });
    }

    const branch = await Branch.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Branch created successfully',
      data: branch,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update branch
// @route   PUT /api/branches/:id
// @access  Private (owner, admin)
const updateBranch = async (req, res, next) => {
  try {
    let branch = await Branch.findById(req.params.id).populate('restaurant', 'owner');

    if (!branch) {
      return res.status(404).json({
        success: false,
        message: 'Branch not found',
      });
    }

    if (branch.restaurant.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this branch',
      });
    }

    branch = await Branch.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      message: 'Branch updated successfully',
      data: branch,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete branch
// @route   DELETE /api/branches/:id
// @access  Private (owner, admin)
const deleteBranch = async (req, res, next) => {
  try {
    const branch = await Branch.findById(req.params.id).populate('restaurant', 'owner');

    if (!branch) {
      return res.status(404).json({
        success: false,
        message: 'Branch not found',
      });
    }

    if (branch.restaurant.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this branch',
      });
    }

    branch.isActive = false;
    await branch.save();

    res.json({
      success: true,
      message: 'Branch deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getBranches, getBranch, createBranch, updateBranch, deleteBranch };
