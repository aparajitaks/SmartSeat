import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { restaurantService } from '../services/dataService';
import {
  Search,
  MapPin,
  Star,
  ArrowRight,
  Utensils,
  Clock,
  Users,
  Shield,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

const Home = () => {
  const [featured, setFeatured] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await restaurantService.getAll({ limit: 4, sort: 'rating' });
        setFeatured(res.data.data);
      } catch (error) {
        console.error('Failed to fetch restaurants:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const features = [
    {
      icon: Sparkles,
      title: 'Smart Allocation',
      desc: 'AI picks the best table for your party size automatically.',
      color: 'from-violet-500 to-purple-500',
    },
    {
      icon: Clock,
      title: 'Zero Wait Time',
      desc: 'Book ahead and skip the queue. Real-time availability.',
      color: 'from-amber-500 to-orange-500',
    },
    {
      icon: Users,
      title: 'Waitlist Auto-Promote',
      desc: 'Get bumped up automatically when a table frees up.',
      color: 'from-emerald-500 to-teal-500',
    },
    {
      icon: Shield,
      title: 'Guaranteed Booking',
      desc: 'Transaction-safe reservations prevent double booking.',
      color: 'from-blue-500 to-cyan-500',
    },
  ];

  const steps = [
    { num: '01', title: 'Browse', desc: 'Explore partnered restaurants and cafes' },
    { num: '02', title: 'Select', desc: 'Choose your date, time and party size' },
    { num: '03', title: 'Book', desc: 'Smart allocation finds the perfect table' },
    { num: '04', title: 'Enjoy', desc: 'Walk in, check in, and enjoy your meal' },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-radial-glow" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />

        <div className="relative z-10 max-w-6xl mx-auto px-4 text-center">
          <div className="animate-fade-in-up">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-primary-300 mb-6">
              <Sparkles className="w-4 h-4" />
              Intelligent Restaurant Reservations
            </span>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-bold leading-tight mb-6">
              Book Your
              <span className="gradient-text block">Perfect Table</span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              SmartSeat intelligently allocates the best table for your group,
              eliminates wait times, and gives restaurants powerful analytics.
            </p>

            {/* Search bar */}
            <div className="max-w-xl mx-auto">
              <div className="flex items-center gap-2 p-2 rounded-2xl glass">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    id="hero-search"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search restaurants, cuisines, or locations..."
                    className="w-full pl-12 pr-4 py-3.5 bg-transparent text-white placeholder-gray-500 focus:outline-none"
                  />
                </div>
                <Link
                  to={`/restaurants${searchQuery ? `?search=${searchQuery}` : ''}`}
                  className="btn-primary flex items-center gap-2 shrink-0"
                >
                  Explore <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-center gap-8 sm:gap-16 mt-12">
              {[
                { value: '4+', label: 'Restaurants' },
                { value: '32+', label: 'Tables' },
                { value: '24/7', label: 'Booking' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl sm:text-3xl font-display font-bold gradient-text">
                    {stat.value}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-display font-bold mb-4">
              Why <span className="gradient-text">SmartSeat</span>?
            </h2>
            <p className="text-gray-500 max-w-lg mx-auto">
              More than a booking app — an intelligent reservation platform
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <div
                key={feature.title}
                className="card group cursor-default animate-fade-in-up"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                >
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Restaurants */}
      <section className="py-24 px-4 bg-dark-500/30">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl sm:text-4xl font-display font-bold mb-2">
                Featured <span className="gradient-text">Restaurants</span>
              </h2>
              <p className="text-gray-500">Top-rated dining experiences near you</p>
            </div>
            <Link
              to="/restaurants"
              className="hidden sm:flex items-center gap-2 text-primary-400 hover:text-primary-300 font-medium transition-colors"
            >
              View All <ChevronRight className="w-5 h-5" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="card">
                  <div className="skeleton h-40 mb-4" />
                  <div className="skeleton h-6 w-3/4 mb-2" />
                  <div className="skeleton h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featured.map((restaurant, i) => (
                <Link
                  key={restaurant._id}
                  to={`/restaurants/${restaurant._id}`}
                  className="card group animate-fade-in-up overflow-hidden !p-0"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  {/* Image placeholder with gradient */}
                  <div className="h-40 bg-gradient-to-br from-primary-600/40 to-accent-500/40 flex items-center justify-center relative overflow-hidden">
                    <Utensils className="w-12 h-12 text-white/30" />
                    <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-lg bg-black/40 backdrop-blur-sm">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span className="text-xs text-white font-medium">
                        {restaurant.rating?.average || '0'}
                      </span>
                    </div>
                    <div className="absolute bottom-3 left-3">
                      <span className="px-2 py-1 rounded-md bg-black/40 backdrop-blur-sm text-xs text-white">
                        {restaurant.priceRange}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-white group-hover:text-primary-300 transition-colors mb-1">
                      {restaurant.name}
                    </h3>
                    <div className="flex items-center gap-1 text-gray-500 text-sm mb-2">
                      <MapPin className="w-3.5 h-3.5" />
                      {restaurant.address?.city}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {restaurant.cuisine?.slice(0, 2).map((c) => (
                        <span
                          key={c}
                          className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-gray-400 border border-white/5"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="sm:hidden text-center mt-8">
            <Link to="/restaurants" className="btn-secondary inline-flex items-center gap-2">
              View All Restaurants <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-display font-bold mb-4">
              How It <span className="gradient-text">Works</span>
            </h2>
            <p className="text-gray-500 max-w-lg mx-auto">
              Four simple steps to your perfect dining experience
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <div
                key={step.num}
                className="text-center animate-fade-in-up"
                style={{ animationDelay: `${i * 150}ms` }}
              >
                <div className="relative inline-block mb-4">
                  <span className="text-6xl font-display font-bold text-white/5">
                    {step.num}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500">{step.desc}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center mt-16">
            <Link to="/restaurants" className="btn-accent inline-flex items-center gap-2 text-lg">
              Start Booking Now <ArrowRight className="w-6 h-6" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
