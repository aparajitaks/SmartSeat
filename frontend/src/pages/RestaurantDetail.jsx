import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { restaurantService, tableService, reservationService, reviewService } from '../services/dataService';
import {
  MapPin, Star, Clock, Phone, Mail, Users, Wifi, Car,
  TreePine, Music, Dog, Accessibility, ParkingCircle, DoorOpen,
  ChevronDown, Calendar, ArrowRight, Check, Utensils, MessageSquare,
} from 'lucide-react';
import toast from 'react-hot-toast';

const featureIcons = {
  wifi: Wifi, parking: Car, outdoor_seating: TreePine, live_music: Music,
  pet_friendly: Dog, wheelchair_accessible: Accessibility,
  valet_parking: ParkingCircle, private_dining: DoorOpen,
};

const RestaurantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [restaurant, setRestaurant] = useState(null);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [tables, setTables] = useState({ available: [], booked: [] });
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [tablesLoading, setTablesLoading] = useState(false);

  const [booking, setBooking] = useState({
    date: new Date().toISOString().split('T')[0],
    startTime: '19:00',
    endTime: '21:00',
    partySize: 2,
    specialRequests: '',
  });

  const timeSlots = [];
  for (let h = 8; h <= 22; h++) {
    timeSlots.push(`${String(h).padStart(2, '0')}:00`);
    timeSlots.push(`${String(h).padStart(2, '0')}:30`);
  }

  useEffect(() => {
    fetchRestaurant();
  }, [id]);

  useEffect(() => {
    if (selectedBranch) fetchAvailability();
  }, [selectedBranch, booking.date, booking.startTime, booking.endTime, booking.partySize]);

  const fetchRestaurant = async () => {
    try {
      const [restRes, revRes] = await Promise.all([
        restaurantService.getById(id),
        reviewService.getByRestaurant(id, { limit: 5 }),
      ]);
      setRestaurant(restRes.data.data);
      setBranches(restRes.data.data.branches || []);
      setReviews(revRes.data.data);
      if (restRes.data.data.branches?.length > 0) {
        setSelectedBranch(restRes.data.data.branches[0]);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load restaurant');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailability = async () => {
    if (!selectedBranch) return;
    setTablesLoading(true);
    try {
      const res = await tableService.getAvailable({
        branchId: selectedBranch._id,
        date: booking.date,
        startTime: booking.startTime,
        endTime: booking.endTime,
        partySize: booking.partySize,
      });
      setTables(res.data.data);
    } catch (error) {
      console.error('Error fetching tables:', error);
    } finally {
      setTablesLoading(false);
    }
  };

  const handleBook = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to make a reservation');
      navigate('/login');
      return;
    }

    setBookingLoading(true);
    try {
      const res = await reservationService.create({
        branchId: selectedBranch._id,
        restaurantId: restaurant._id,
        date: booking.date,
        startTime: booking.startTime,
        endTime: booking.endTime,
        partySize: booking.partySize,
        specialRequests: booking.specialRequests,
      });

      if (res.data.waitlisted) {
        toast.success('Added to waitlist! We\'ll notify you when a table is available.', { duration: 5000 });
        navigate('/waitlist');
      } else {
        toast.success('Reservation confirmed!', { duration: 4000 });
        navigate('/my-reservations');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Booking failed');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="skeleton h-64 mb-8 rounded-2xl" />
        <div className="skeleton h-8 w-1/3 mb-4" />
        <div className="skeleton h-4 w-2/3 mb-2" />
        <div className="skeleton h-4 w-1/2" />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="text-center py-32">
        <h2 className="text-2xl font-bold text-gray-400">Restaurant not found</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      <div className="h-64 sm:h-80 bg-gradient-to-br from-primary-600/40 via-primary-800/30 to-accent-500/30 flex items-center justify-center relative overflow-hidden">
        <Utensils className="w-24 h-24 text-white/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-600 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 max-w-6xl mx-auto">
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-3xl sm:text-4xl font-display font-bold text-white mb-2">
                {restaurant.name}
              </h1>
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                  <span className="text-white font-medium">{restaurant.rating?.average?.toFixed(1)}</span>
                  <span className="text-gray-400 text-sm">({restaurant.rating?.count} reviews)</span>
                </div>
                <div className="flex items-center gap-1 text-gray-400 text-sm">
                  <MapPin className="w-4 h-4" />
                  {restaurant.address?.city}, {restaurant.address?.state}
                </div>
                <span className="px-2 py-0.5 rounded-md bg-white/10 text-white text-sm font-medium">
                  {restaurant.priceRange}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">About</h2>
              <p className="text-gray-400 leading-relaxed">{restaurant.description}</p>

              <div className="flex flex-wrap gap-2 mt-4">
                {restaurant.cuisine?.map((c) => (
                  <span key={c} className="text-xs px-3 py-1.5 rounded-full bg-primary-500/10 text-primary-300 border border-primary-500/20">
                    {c}
                  </span>
                ))}
              </div>
            </div>

            {/* Info */}
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-primary-400" />
                  <div>
                    <p className="text-xs text-gray-500">Operating Hours</p>
                    <p className="text-sm text-gray-300">{restaurant.operatingHours?.open} - {restaurant.operatingHours?.close}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-primary-400" />
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="text-sm text-gray-300">{restaurant.phone}</p>
                  </div>
                </div>
                {restaurant.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-primary-400" />
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="text-sm text-gray-300">{restaurant.email}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-primary-400" />
                  <div>
                    <p className="text-xs text-gray-500">Address</p>
                    <p className="text-sm text-gray-300">{restaurant.address?.street}</p>
                  </div>
                </div>
              </div>

              {/* Features */}
              {restaurant.features?.length > 0 && (
                <div className="mt-6 pt-4 border-t border-white/5">
                  <p className="text-sm text-gray-500 mb-3">Amenities</p>
                  <div className="flex flex-wrap gap-2">
                    {restaurant.features.map((f) => {
                      const Icon = featureIcons[f] || Check;
                      return (
                        <span key={f} className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-white/5 text-gray-400 border border-white/5">
                          <Icon className="w-3.5 h-3.5" />
                          {f.replace(/_/g, ' ')}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Reviews */}
            <div className="card">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary-400" />
                Reviews
              </h2>
              {reviews.length === 0 ? (
                <p className="text-gray-500 text-sm">No reviews yet.</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review._id} className="p-4 rounded-xl bg-white/5 border border-white/5">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                            <span className="text-xs font-bold text-white">
                              {review.user?.name?.charAt(0)}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-gray-300">{review.user?.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} className={`w-3.5 h-3.5 ${s <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-600'}`} />
                          ))}
                        </div>
                      </div>
                      {review.title && <p className="text-sm font-medium text-gray-300 mb-1">{review.title}</p>}
                      <p className="text-sm text-gray-500">{review.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right column - Booking */}
          <div className="lg:col-span-1">
            <div className="card sticky top-24 space-y-5">
              <h2 className="text-xl font-semibold gradient-text">Reserve a Table</h2>

              {/* Branch selector */}
              {branches.length > 1 && (
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">Branch</label>
                  <select
                    value={selectedBranch?._id || ''}
                    onChange={(e) => setSelectedBranch(branches.find((b) => b._id === e.target.value))}
                    className="input-field text-sm"
                  >
                    {branches.map((b) => (
                      <option key={b._id} value={b._id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Date */}
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Date</label>
                <input
                  id="booking-date"
                  type="date"
                  value={booking.date}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setBooking({ ...booking, date: e.target.value })}
                  className="input-field text-sm"
                />
              </div>

              {/* Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">From</label>
                  <select
                    value={booking.startTime}
                    onChange={(e) => setBooking({ ...booking, startTime: e.target.value })}
                    className="input-field text-sm"
                  >
                    {timeSlots.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">To</label>
                  <select
                    value={booking.endTime}
                    onChange={(e) => setBooking({ ...booking, endTime: e.target.value })}
                    className="input-field text-sm"
                  >
                    {timeSlots.filter((t) => t > booking.startTime).map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Party size */}
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Party Size</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5, 6].map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setBooking({ ...booking, partySize: size })}
                      className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                        booking.partySize === size
                          ? 'bg-primary-500 text-white'
                          : 'bg-white/5 text-gray-400 border border-white/10 hover:border-white/20'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                  <input
                    type="number"
                    min="7"
                    max="20"
                    value={booking.partySize > 6 ? booking.partySize : ''}
                    placeholder="7+"
                    onChange={(e) => setBooking({ ...booking, partySize: parseInt(e.target.value) || 7 })}
                    className="w-16 input-field text-sm text-center !px-2"
                  />
                </div>
              </div>

              {/* Special requests */}
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Special Requests</label>
                <textarea
                  value={booking.specialRequests}
                  onChange={(e) => setBooking({ ...booking, specialRequests: e.target.value })}
                  placeholder="Birthday, window seat, allergies..."
                  className="input-field text-sm h-20 resize-none"
                />
              </div>

              {/* Availability */}
              <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Available tables</span>
                  {tablesLoading ? (
                    <div className="w-5 h-5 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
                  ) : (
                    <span className={`font-semibold ${tables.available?.length > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {tables.available?.length || 0} of {(tables.available?.length || 0) + (tables.booked?.length || 0)}
                    </span>
                  )}
                </div>
              </div>

              {/* Book button */}
              <button
                id="book-now-btn"
                onClick={handleBook}
                disabled={bookingLoading || tablesLoading}
                className="btn-accent w-full flex items-center justify-center gap-2 text-lg disabled:opacity-50"
              >
                {bookingLoading ? (
                  <div className="w-5 h-5 border-2 border-gray-900/30 border-t-gray-900 rounded-full animate-spin" />
                ) : (
                  <>
                    <Calendar className="w-5 h-5" />
                    Book Now
                  </>
                )}
              </button>

              <p className="text-[11px] text-gray-600 text-center">
                Smart allocation will find the best table for your group
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantDetail;
