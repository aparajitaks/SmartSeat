import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { reservationService } from '../services/dataService';
import {
  CalendarDays, Clock, Users, MapPin, Utensils,
  XCircle, CheckCircle, AlertCircle, ChevronDown,
} from 'lucide-react';
import toast from 'react-hot-toast';

const statusConfig = {
  pending: { badge: 'badge-pending', label: 'Pending' },
  confirmed: { badge: 'badge-confirmed', label: 'Confirmed' },
  checked_in: { badge: 'badge-checked_in', label: 'Checked In' },
  completed: { badge: 'badge-completed', label: 'Completed' },
  cancelled: { badge: 'badge-cancelled', label: 'Cancelled' },
  expired: { badge: 'badge-expired', label: 'Expired' },
};

const MyReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    fetchReservations();
  }, [filter]);

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filter) params.status = filter;
      const res = await reservationService.getMyReservations(params);
      setReservations(res.data.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!confirm('Are you sure you want to cancel this reservation?')) return;
    setCancellingId(id);
    try {
      await reservationService.cancel(id, 'Cancelled by customer');
      toast.success('Reservation cancelled');
      fetchReservations();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel');
    } finally {
      setCancellingId(null);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
    });
  };

  const filters = [
    { value: '', label: 'All' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <div className="min-h-screen bg-radial-glow">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-3xl font-display font-bold mb-2">
            My <span className="gradient-text">Reservations</span>
          </h1>
          <p className="text-gray-500">Track and manage your bookings</p>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-8 flex-wrap animate-fade-in-up delay-100">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === f.value
                  ? 'bg-primary-500/20 text-primary-300 border border-primary-500/30'
                  : 'text-gray-400 border border-white/10 hover:border-white/20 hover:bg-white/5'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Reservations list */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card">
                <div className="flex gap-4">
                  <div className="skeleton w-20 h-20 rounded-xl shrink-0" />
                  <div className="flex-1">
                    <div className="skeleton h-5 w-1/3 mb-2" />
                    <div className="skeleton h-4 w-2/3 mb-2" />
                    <div className="skeleton h-4 w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : reservations.length === 0 ? (
          <div className="text-center py-20 card">
            <CalendarDays className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No reservations found</h3>
            <p className="text-gray-600 mb-6">Start by booking a table at your favorite restaurant</p>
            <Link to="/restaurants" className="btn-primary inline-block">
              Browse Restaurants
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {reservations.map((res, i) => (
              <div
                key={res._id}
                className="card animate-fade-in-up group"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Restaurant icon */}
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary-600/40 to-accent-500/30 flex items-center justify-center shrink-0">
                    <Utensils className="w-8 h-8 text-white/40" />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <h3 className="font-semibold text-white">
                          {res.restaurant?.name}
                        </h3>
                        <p className="text-sm text-gray-500">{res.branch?.name}</p>
                      </div>
                      <span className={statusConfig[res.status]?.badge}>
                        {statusConfig[res.status]?.label}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                      <div className="flex items-center gap-1.5 text-sm text-gray-400">
                        <CalendarDays className="w-4 h-4 text-primary-400 shrink-0" />
                        {formatDate(res.date)}
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-gray-400">
                        <Clock className="w-4 h-4 text-primary-400 shrink-0" />
                        {res.timeSlot?.start} - {res.timeSlot?.end}
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-gray-400">
                        <Users className="w-4 h-4 text-primary-400 shrink-0" />
                        {res.partySize} guests
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-gray-400">
                        <MapPin className="w-4 h-4 text-primary-400 shrink-0" />
                        Table {res.table?.tableNumber}
                      </div>
                    </div>

                    {res.specialRequests && (
                      <p className="mt-2 text-xs text-gray-500 italic">
                        "{res.specialRequests}"
                      </p>
                    )}

                    <div className="text-xs text-gray-600 mt-2">
                      ID: {res.reservationId}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {['pending', 'confirmed'].includes(res.status) && (
                  <div className="mt-4 pt-4 border-t border-white/5 flex justify-end">
                    <button
                      onClick={() => handleCancel(res._id)}
                      disabled={cancellingId === res._id}
                      className="text-sm text-red-400 hover:text-red-300 flex items-center gap-1.5 transition-colors disabled:opacity-50"
                    >
                      {cancellingId === res._id ? (
                        <div className="w-4 h-4 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
                      ) : (
                        <XCircle className="w-4 h-4" />
                      )}
                      Cancel Reservation
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyReservations;
