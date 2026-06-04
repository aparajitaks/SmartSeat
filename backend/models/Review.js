const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
    },
    reservation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Reservation',
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    title: {
      type: String,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    comment: {
      type: String,
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// One review per user per restaurant
reviewSchema.index({ user: 1, restaurant: 1 }, { unique: true });
reviewSchema.index({ restaurant: 1, isActive: 1 });

// Static method to calculate average rating
reviewSchema.statics.calcAverageRating = async function (restaurantId) {
  const stats = await this.aggregate([
    { $match: { restaurant: restaurantId, isActive: true } },
    {
      $group: {
        _id: '$restaurant',
        avgRating: { $avg: '$rating' },
        numReviews: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await mongoose.model('Restaurant').findByIdAndUpdate(restaurantId, {
      'rating.average': Math.round(stats[0].avgRating * 10) / 10,
      'rating.count': stats[0].numReviews,
    });
  } else {
    await mongoose.model('Restaurant').findByIdAndUpdate(restaurantId, {
      'rating.average': 0,
      'rating.count': 0,
    });
  }
};

// Recalculate rating after save
reviewSchema.post('save', function () {
  this.constructor.calcAverageRating(this.restaurant);
});

module.exports = mongoose.model('Review', reviewSchema);
