const Restaurant = require('../models/Restaurant');
const Branch = require('../models/Branch');

// @desc    Get all restaurants (with filters, pagination, search)
// @route   GET /api/restaurants
// @access  Public
const getRestaurants = async (req, res, next) => {
  try {
    const { page = 1, limit = 12, search, cuisine, city, priceRange, sort } = req.query;

    const query = { isActive: true };

    // Search by name
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    // Filter by cuisine
    if (cuisine) {
      query.cuisine = { $in: cuisine.split(',') };
    }

    // Filter by city
    if (city) {
      query['address.city'] = { $regex: city, $options: 'i' };
    }

    // Filter by price range
    if (priceRange) {
      query.priceRange = priceRange;
    }

    // Sort options
    let sortOption = { createdAt: -1 };
    if (sort === 'rating') sortOption = { 'rating.average': -1 };
    if (sort === 'name') sortOption = { name: 1 };
    if (sort === 'price_low') sortOption = { priceRange: 1 };
    if (sort === 'price_high') sortOption = { priceRange: -1 };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [restaurants, total] = await Promise.all([
      Restaurant.find(query)
        .populate('owner', 'name')
        .sort(sortOption)
        .skip(skip)
        .limit(parseInt(limit)),
      Restaurant.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: restaurants,
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

// @desc    Get single restaurant with branches
// @route   GET /api/restaurants/:id
// @access  Public
const getRestaurant = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id).populate('owner', 'name email');

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found',
      });
    }

    // Get branches for this restaurant
    const branches = await Branch.find({
      restaurant: restaurant._id,
      isActive: true,
    });

    res.json({
      success: true,
      data: {
        ...restaurant.toObject(),
        branches,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create restaurant
// @route   POST /api/restaurants
// @access  Private (restaurant_owner, admin)
const createRestaurant = async (req, res, next) => {
  try {
    req.body.owner = req.user.id;

    const restaurant = await Restaurant.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Restaurant created successfully',
      data: restaurant,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update restaurant
// @route   PUT /api/restaurants/:id
// @access  Private (owner, admin)
const updateRestaurant = async (req, res, next) => {
  try {
    let restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found',
      });
    }

    // Check ownership (unless admin)
    if (restaurant.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this restaurant',
      });
    }

    restaurant = await Restaurant.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      message: 'Restaurant updated successfully',
      data: restaurant,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete restaurant (soft delete)
// @route   DELETE /api/restaurants/:id
// @access  Private (admin)
const deleteRestaurant = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found',
      });
    }

    restaurant.deletedAt = new Date();
    restaurant.isActive = false;
    await restaurant.save();

    res.json({
      success: true,
      message: 'Restaurant deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get owner's restaurants
// @route   GET /api/restaurants/owner/me
// @access  Private (restaurant_owner)
const getMyRestaurants = async (req, res, next) => {
  try {
    const restaurants = await Restaurant.find({ owner: req.user.id });

    res.json({
      success: true,
      data: restaurants,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRestaurants,
  getRestaurant,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  getMyRestaurants,
};
