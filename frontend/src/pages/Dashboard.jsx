import { useState, useEffect } from 'react';
import { analyticsService, restaurantService } from '../services/dataService';
import {
  BarChart3, TrendingUp, Users, CalendarDays, XCircle,
  Percent, Clock, LayoutGrid, ArrowUpRight, ArrowDownRight,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell,
  AreaChart, Area,
} from 'recharts';

const CHART_COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#3b82f6'];

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyRestaurants();
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [selectedRestaurant]);

  const fetchMyRestaurants = async () => {
    try {
      const res = await restaurantService.getMyRestaurants();
      setRestaurants(res.data.data);
      if (res.data.data.length > 0) {
        setSelectedRestaurant(res.data.data[0]._id);
      }
    } catch (error) {
      console.error('Error:', error);
      // For admin users, try fetching analytics directly
      fetchAnalytics();
    }
  };

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedRestaurant) params.restaurantId = selectedRestaurant;
      const res = await analyticsService.getDashboard(params);
      setData(res.data.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, label, value, suffix = '', color, trend }) => (
    <div className="card group">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {trend && (
          <span className={`flex items-center gap-0.5 text-xs font-medium ${
            trend > 0 ? 'text-emerald-400' : 'text-red-400'
          }`}>
            {trend > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="text-2xl font-display font-bold text-white">{value}{suffix}</p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
    </div>
  );

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="glass rounded-lg p-3 !bg-dark-300/95 border border-white/10 shadow-xl">
        <p className="text-xs text-gray-400 mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-sm font-medium" style={{ color: p.color }}>
            {p.name}: {p.value}
          </p>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="skeleton h-10 w-1/3 mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card">
              <div className="skeleton h-10 w-10 rounded-xl mb-3" />
              <div className="skeleton h-8 w-20 mb-2" />
              <div className="skeleton h-4 w-24" />
            </div>
          ))}
        </div>
        <div className="skeleton h-72 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-radial-glow">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 animate-fade-in-up">
          <div>
            <h1 className="text-3xl font-display font-bold mb-1">
              Analytics <span className="gradient-text">Dashboard</span>
            </h1>
            <p className="text-gray-500">Last 30 days overview</p>
          </div>
          {restaurants.length > 0 && (
            <select
              value={selectedRestaurant}
              onChange={(e) => setSelectedRestaurant(e.target.value)}
              className="input-field text-sm w-auto min-w-[200px]"
            >
              {restaurants.map((r) => (
                <option key={r._id} value={r._id}>{r.name}</option>
              ))}
            </select>
          )}
        </div>

        {!data ? (
          <div className="text-center py-20 card">
            <BarChart3 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400">No analytics data available</h3>
            <p className="text-gray-600 mt-2">Data will appear once reservations start coming in.</p>
          </div>
        ) : (
          <>
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                icon={CalendarDays}
                label="Total Bookings"
                value={data.overview?.totalBookings || 0}
                color="from-primary-500 to-primary-600"
              />
              <StatCard
                icon={LayoutGrid}
                label="Total Tables"
                value={data.overview?.totalTables || 0}
                color="from-emerald-500 to-teal-600"
              />
              <StatCard
                icon={Percent}
                label="Occupancy Rate"
                value={data.overview?.occupancyRate || 0}
                suffix="%"
                color="from-amber-500 to-orange-600"
              />
              <StatCard
                icon={XCircle}
                label="Cancellation Rate"
                value={data.overview?.cancellationRate || 0}
                suffix="%"
                color="from-red-500 to-rose-600"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Daily Bookings Trend */}
              <div className="card">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary-400" />
                  Daily Bookings
                </h3>
                <div className="h-64">
                  {data.dailyBookings?.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={data.dailyBookings}>
                        <defs>
                          <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
                        <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="count" name="Bookings" stroke="#6366f1" fill="url(#colorBookings)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-600">No data</div>
                  )}
                </div>
              </div>

              {/* Peak Hours */}
              <div className="card">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-400" />
                  Peak Booking Hours
                </h3>
                <div className="h-64">
                  {data.peakHours?.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.peakHours}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="hour" tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={(v) => `${v}:00`} />
                        <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="count" name="Bookings" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-600">No data</div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Status Breakdown */}
              <div className="card">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary-400" />
                  Reservation Status
                </h3>
                <div className="h-64 flex items-center justify-center">
                  {data.statusBreakdown?.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data.statusBreakdown}
                          dataKey="count"
                          nameKey="_id"
                          cx="50%"
                          cy="50%"
                          outerRadius={90}
                          innerRadius={50}
                          strokeWidth={0}
                          label={({ _id, count }) => `${_id}: ${count}`}
                        >
                          {data.statusBreakdown.map((entry, index) => (
                            <Cell key={entry._id} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-gray-600">No data</div>
                  )}
                </div>
              </div>

              {/* Top Customers */}
              <div className="card">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-emerald-400" />
                  Top Customers
                </h3>
                {data.topCustomers?.length > 0 ? (
                  <div className="space-y-3">
                    {data.topCustomers.slice(0, 5).map((customer, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                            <span className="text-xs font-bold text-white">{i + 1}</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-300">{customer.name}</p>
                            <p className="text-xs text-gray-500">{customer.email}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-primary-400">{customer.bookingCount} bookings</p>
                          <p className="text-xs text-gray-500">{customer.totalPartySize} total guests</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-48 flex items-center justify-center text-gray-600">No data</div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
