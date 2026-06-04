const mongoose = require('mongoose');

const bookingLogSchema = new mongoose.Schema(
  {
    reservation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Reservation',
      required: true,
    },
    action: {
      type: String,
      enum: [
        'created',
        'confirmed',
        'checked_in',
        'completed',
        'cancelled',
        'expired',
        'table_changed',
        'waitlist_promoted',
      ],
      required: true,
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    details: {
      type: String,
    },
    previousStatus: {
      type: String,
    },
    newStatus: {
      type: String,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Immutable - cannot update booking logs
bookingLogSchema.pre('updateOne', function () {
  throw new Error('BookingLogs are immutable and cannot be updated');
});

bookingLogSchema.index({ reservation: 1 });
bookingLogSchema.index({ performedBy: 1 });
bookingLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('BookingLog', bookingLogSchema);
