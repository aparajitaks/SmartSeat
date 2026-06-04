import { useState, useEffect } from 'react';
import { waitlistService } from '../services/dataService';
import { Clock, Users, MapPin, CalendarDays, XCircle, PartyPopper, Utensils } from 'lucide-react';
import toast from 'react-hot-toast';

const Waitlist = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWaitlist();
  }, []);

  const fetchWaitlist = async () => {
    try {
      const res = await waitlistService.getMyWaitlist();
      setEntries(res.data.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!confirm('Remove yourself from the waitlist?')) return;
    try {
      await waitlistService.cancel(id);
      toast.success('Removed from waitlist');
      fetchWaitlist();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed');
    }
  };

  const statusBadge = {
    waiting: 'badge-waiting',
    promoted: 'badge-promoted',
    expired: 'badge-expired',
    cancelled: 'badge-cancelled',
  };

  return (
    <div className="min-h-screen bg-radial-glow">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-3xl font-display font-bold mb-2">
            My <span className="gradient-text">Waitlist</span>
          </h1>
          <p className="text-gray-500">Your queue positions for upcoming reservations</p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="card">
                <div className="skeleton h-6 w-1/3 mb-3" />
                <div className="skeleton h-4 w-2/3" />
              </div>
            ))}
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-20 card">
            <Clock className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No waitlist entries</h3>
            <p className="text-gray-600">
              You'll appear here when all tables are booked and you join a waitlist.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {entries.map((entry, i) => (
              <div
                key={entry._id}
                className="card animate-fade-in-up"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/30 to-orange-500/30 flex items-center justify-center">
                      {entry.status === 'promoted' ? (
                        <PartyPopper className="w-6 h-6 text-emerald-400" />
                      ) : (
                        <span className="text-lg font-bold text-amber-400">#{entry.position}</span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{entry.restaurant?.name}</h3>
                      <p className="text-sm text-gray-500">{entry.branch?.name}</p>
                    </div>
                  </div>
                  <span className={statusBadge[entry.status]}>
                    {entry.status === 'promoted' ? '🎉 Promoted!' : entry.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="flex items-center gap-1.5 text-sm text-gray-400">
                    <CalendarDays className="w-4 h-4 text-primary-400" />
                    {new Date(entry.date).toLocaleDateString('en-IN', {
                      weekday: 'short', month: 'short', day: 'numeric',
                    })}
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-gray-400">
                    <Clock className="w-4 h-4 text-primary-400" />
                    {entry.timeSlot?.start} - {entry.timeSlot?.end}
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-gray-400">
                    <Users className="w-4 h-4 text-primary-400" />
                    {entry.partySize} guests
                  </div>
                </div>

                {entry.status === 'promoted' && (
                  <div className="mt-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <p className="text-sm text-emerald-400">
                      🎉 Great news! A table became available and your reservation has been confirmed!
                    </p>
                  </div>
                )}

                {entry.status === 'waiting' && (
                  <div className="mt-3 flex justify-end">
                    <button
                      onClick={() => handleCancel(entry._id)}
                      className="text-sm text-red-400 hover:text-red-300 flex items-center gap-1.5 transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                      Leave Waitlist
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

export default Waitlist;
