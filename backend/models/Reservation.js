const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema(
  {
    reservationId: {
      type: String,
      unique: true,
      required: true,
    },
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
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: true,
    },
    table: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Table',
      required: true,
    },
    date: {
      type: Date,
      required: [true, 'Reservation date is required'],
    },
    timeSlot: {
      start: {
        type: String,
        required: [true, 'Start time is required'],
      },
      end: {
        type: String,
        required: [true, 'End time is required'],
      },
    },
    partySize: {
      type: Number,
      required: [true, 'Party size is required'],
      min: [1, 'Party size must be at least 1'],
      max: [20, 'Party size cannot exceed 20'],
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'checked_in', 'completed', 'cancelled', 'expired'],
      default: 'pending',
    },
    specialRequests: {
      type: String,
      maxlength: [500, 'Special requests cannot exceed 500 characters'],
    },
    cancellationReason: {
      type: String,
    },
    cancelledAt: {
      type: Date,
    },
    checkedInAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
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

// Indexes for efficient querying
reservationSchema.index({ table: 1, date: 1, 'timeSlot.start': 1, 'timeSlot.end': 1 });
reservationSchema.index({ user: 1, status: 1 });
reservationSchema.index({ branch: 1, date: 1, status: 1 });
reservationSchema.index({ restaurant: 1, date: 1 });
reservationSchema.index({ reservationId: 1 });
reservationSchema.index({ status: 1 });

// Soft delete - exclude deleted records by default
reservationSchema.pre(/^find/, function () {
  if (!this.getQuery().includeDeleted) {
    this.where({ deletedAt: null });
  }
});

module.exports = mongoose.model('Reservation', reservationSchema);
