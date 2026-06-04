const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Restaurant name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    cuisine: [
      {
        type: String,
        trim: true,
      },
    ],
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String },
      country: { type: String, default: 'India' },
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    operatingHours: {
      open: { type: String, default: '09:00' },
      close: { type: String, default: '23:00' },
    },
    images: [
      {
        type: String,
      },
    ],
    rating: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0 },
    },
    priceRange: {
      type: String,
      enum: ['$', '$$', '$$$', '$$$$'],
      default: '$$',
    },
    features: [
      {
        type: String,
        enum: [
          'wifi',
          'parking',
          'outdoor_seating',
          'live_music',
          'pet_friendly',
          'wheelchair_accessible',
          'valet_parking',
          'private_dining',
        ],
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Text index for search
restaurantSchema.index({ name: 'text', 'address.city': 'text' });
restaurantSchema.index({ owner: 1 });
restaurantSchema.index({ 'address.city': 1 });
restaurantSchema.index({ isActive: 1 });

// Soft delete - exclude deleted records by default
restaurantSchema.pre(/^find/, function () {
  if (!this.getQuery().includeDeleted) {
    this.where({ deletedAt: null });
  }
});

module.exports = mongoose.model('Restaurant', restaurantSchema);
