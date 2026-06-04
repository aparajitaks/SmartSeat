const Review = require('../models/Review');
const Reservation = require('../models/Reservation');

// @desc    Create review
// @route   POST /api/reviews
// @access  Private
const createReview = async (req, res, next) => {
  try {
    const { restaurantId, reservationId, rating, title, comment } = req.body;

    // Check if user has a completed reservation at this restaurant
    if (reservationId) {
      const reservation = await Reservation.findOne({
        _id: reservationId,
        user: req.user.id,
        restaurant: restaurantId,
        status: 'completed',
      });

      if (!reservation) {
        return res.status(400).json({
          success: false,
          message: 'You can only review restaurants where you have completed a reservation',
        });
      }
    }

    // Check if user already reviewed this restaurant
    const existingReview = await Review.findOne({
      user: req.user.id,
      restaurant: restaurantId,
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this restaurant',
      });
    }

    const review = await Review.create({
      user: req.user.id,
      restaurant: restaurantId,
      reservation: reservationId,
      rating,
      title,
      comment,
    });

    const populatedReview = await Review.findById(review._id).populate('user', 'name avatar');

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: populatedReview,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reviews for a restaurant
// @route   GET /api/reviews/restaurant/:restaurantId
// @access  Public
const getRestaurantReviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [reviews, total] = await Promise.all([
      Review.find({ restaurant: req.params.restaurantId, isActive: true })
        .populate('user', 'name avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Review.countDocuments({ restaurant: req.params.restaurantId, isActive: true }),
    ]);

    res.json({
      success: true,
      data: reviews,
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

module.exports = { createReview, getRestaurantReviews };
