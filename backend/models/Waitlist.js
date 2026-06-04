const mongoose = require('mongoose');

const waitlistSchema = new mongoose.Schema(
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
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: true,
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    timeSlot: {
      start: {
        type: String,
        required: true,
      },
      end: {
        type: String,
        required: true,
      },
    },
    partySize: {
      type: Number,
      required: [true, 'Party size is required'],
      min: 1,
      max: 20,
    },
    position: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['waiting', 'promoted', 'expired', 'cancelled'],
      default: 'waiting',
    },
    promotedReservation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Reservation',
      default: null,
    },
    promotedAt: {
      type: Date,
      default: null,
    },
    specialRequests: {
      type: String,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  }
);

waitlistSchema.index({ branch: 1, date: 1, status: 1 });
waitlistSchema.index({ user: 1, status: 1 });
waitlistSchema.index({ position: 1 });

module.exports = mongoose.model('Waitlist', waitlistSchema);
