import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { restaurantService } from '../services/dataService';
import { Search, MapPin, Star, Utensils, Filter, X } from 'lucide-react';

const Restaurants = () => {
  const [searchParams] = useSearchParams();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    cuisine: '',
    city: '',
    sort: 'rating',
    page: 1,
  });
  const [showFilters, setShowFilters] = useState(false);

  const cuisines = ['North Indian', 'Seafood', 'Japanese', 'Café', 'Mughlai', 'Continental', 'Asian'];

  useEffect(() => {
    fetchRestaurants();
  }, [filters.page, filters.sort]);

  const fetchRestaurants = async () => {
    setLoading(true);
    try {
      const params = {
        page: filters.page,
        limit: 12,
        sort: filters.sort,
      };
      if (filters.search) params.search = filters.search;
      if (filters.cuisine) params.cuisine = filters.cuisine;
      if (filters.city) params.city = filters.city;

      const res = await restaurantService.getAll(params);
      setRestaurants(res.data.data);
      setPagination(res.data.pagination);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters({ ...filters, page: 1 });
    fetchRestaurants();
  };

  const clearFilters = () => {
    setFilters({ search: '', cuisine: '', city: '', sort: 'rating', page: 1 });
    setTimeout(fetchRestaurants, 0);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-radial-glow py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-display font-bold mb-4 animate-fade-in-up">
            Discover <span className="gradient-text">Restaurants</span>
          </h1>
          <p className="text-gray-500 mb-8 animate-fade-in-up delay-100">
            Find and book the best restaurants & cafes near you
          </p>

          {/* Search & Filters */}
          <form onSubmit={handleSearch} className="animate-fade-in-up delay-200">
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  id="restaurant-search"
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  placeholder="Search by name or cuisine..."
                  className="input-field pl-12"
                />
              </div>
              <button type="submit" className="btn-primary">
                Search
              </button>
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className={`p-3 rounded-xl border transition-all ${
                  showFilters
                    ? 'border-primary-500 bg-primary-500/20 text-primary-300'
                    : 'border-white/10 text-gray-400 hover:border-white/20'
                }`}
              >
                <Filter className="w-5 h-5" />
              </button>
            </div>

            {/* Expandable filters */}
            {showFilters && (
              <div className="mt-4 p-4 rounded-xl glass animate-fade-in grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Cuisine</label>
                  <select
                    value={filters.cuisine}
                    onChange={(e) => setFilters({ ...filters, cuisine: e.target.value })}
                    className="input-field text-sm"
                  >
                    <option value="">All Cuisines</option>
                    {cuisines.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">City</label>
                  <input
                    type="text"
                    value={filters.city}
                    onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                    placeholder="Enter city..."
                    className="input-field text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Sort By</label>
                  <select
                    value={filters.sort}
                    onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
                    className="input-field text-sm"
                  >
                    <option value="rating">Top Rated</option>
                    <option value="name">Name A-Z</option>
                    <option value="price_low">Price: Low to High</option>
                    <option value="price_high">Price: High to Low</option>
                  </select>
                </div>
                <div className="sm:col-span-3 flex justify-end">
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="text-sm text-gray-400 hover:text-white flex items-center gap-1"
                  >
                    <X className="w-4 h-4" /> Clear Filters
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="card">
                <div className="skeleton h-48 mb-4" />
                <div className="skeleton h-6 w-3/4 mb-2" />
                <div className="skeleton h-4 w-1/2 mb-4" />
                <div className="skeleton h-4 w-full" />
              </div>
            ))}
          </div>
        ) : restaurants.length === 0 ? (
          <div className="text-center py-20">
            <Utensils className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No restaurants found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your search or filters</p>
            <button onClick={clearFilters} className="btn-secondary">
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-6">
              Showing {restaurants.length} of {pagination.total} restaurants
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {restaurants.map((restaurant, i) => (
                <Link
                  key={restaurant._id}
                  to={`/restaurants/${restaurant._id}`}
                  className="card group !p-0 overflow-hidden animate-fade-in-up"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <div className="h-48 bg-gradient-to-br from-primary-600/30 to-accent-500/30 flex items-center justify-center relative">
                    <Utensils className="w-16 h-16 text-white/20" />
                    <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/50 backdrop-blur-sm">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <span className="text-sm text-white font-medium">
                        {restaurant.rating?.average?.toFixed(1) || '0.0'}
                      </span>
                      <span className="text-xs text-gray-400">
                        ({restaurant.rating?.count || 0})
                      </span>
                    </div>
                    <div className="absolute bottom-3 left-3 flex gap-2">
                      <span className="px-2.5 py-1 rounded-md bg-black/50 backdrop-blur-sm text-xs text-white font-medium">
                        {restaurant.priceRange}
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-white group-hover:text-primary-300 transition-colors mb-2">
                      {restaurant.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-gray-500 text-sm mb-3">
                      <MapPin className="w-4 h-4 shrink-0" />
                      <span className="truncate">
                        {restaurant.address?.street}, {restaurant.address?.city}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                      {restaurant.description}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {restaurant.cuisine?.slice(0, 3).map((c) => (
                        <span
                          key={c}
                          className="text-xs px-2.5 py-1 rounded-full bg-primary-500/10 text-primary-300 border border-primary-500/20"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                {Array.from({ length: pagination.pages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setFilters({ ...filters, page: i + 1 })}
                    className={`w-10 h-10 rounded-lg font-medium transition-all ${
                      pagination.page === i + 1
                        ? 'bg-primary-500 text-white'
                        : 'text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Restaurants;
