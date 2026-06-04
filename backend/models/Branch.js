const mongoose = require('mongoose');

const branchSchema = new mongoose.Schema(
  {
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Branch name is required'],
      trim: true,
      maxlength: [100, 'Branch name cannot exceed 100 characters'],
    },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String },
      country: { type: String, default: 'India' },
    },
    phone: {
      type: String,
    },
    operatingHours: {
      open: { type: String, default: '09:00' },
      close: { type: String, default: '23:00' },
    },
    totalTables: {
      type: Number,
      default: 0,
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

branchSchema.index({ restaurant: 1 });
branchSchema.index({ 'address.city': 1 });

module.exports = mongoose.model('Branch', branchSchema);
