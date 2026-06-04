const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema(
  {
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: true,
    },
    tableNumber: {
      type: String,
      required: [true, 'Table number is required'],
      trim: true,
    },
    capacity: {
      type: Number,
      required: [true, 'Table capacity is required'],
      min: [1, 'Capacity must be at least 1'],
      max: [20, 'Capacity cannot exceed 20'],
    },
    location: {
      type: String,
      enum: ['indoor', 'outdoor', 'terrace', 'private_room', 'bar'],
      default: 'indoor',
    },
    status: {
      type: String,
      enum: ['available', 'occupied', 'reserved', 'maintenance'],
      default: 'available',
    },
    description: {
      type: String,
      maxlength: [200, 'Description cannot exceed 200 characters'],
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

// Compound index for efficient availability queries
tableSchema.index({ branch: 1, status: 1, capacity: 1 });
tableSchema.index({ branch: 1, tableNumber: 1 }, { unique: true });

module.exports = mongoose.model('Table', tableSchema);
