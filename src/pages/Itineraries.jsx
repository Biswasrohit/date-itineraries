import { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus, Calendar, Search, Filter, Grid, List } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useItinerary } from '../context/ItineraryContext';
import ItineraryCard from '../components/itinerary/ItineraryCard';

export default function Itineraries() {
  const { itineraries, loading } = useItinerary();
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');

  const activeFilter = searchParams.get('filter') || 'all';

  const setFilter = (filter) => {
    setSearchParams(filter === 'all' ? {} : { filter });
  };

  const filteredItineraries = useMemo(() => {
    let filtered = [...itineraries];

    // Filter by status
    if (activeFilter === 'upcoming') {
      filtered = filtered.filter(i => i.status === 'upcoming');
    } else if (activeFilter === 'completed') {
      filtered = filtered.filter(i => i.status === 'completed');
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(i =>
        i.title.toLowerCase().includes(query) ||
        i.keyLocations?.some(loc => loc.name.toLowerCase().includes(query))
      );
    }

    // Sort by date
    filtered.sort((a, b) => {
      if (activeFilter === 'completed') {
        return new Date(b.date) - new Date(a.date); // Most recent first
      }
      return new Date(a.date) - new Date(b.date); // Soonest first
    });

    return filtered;
  }, [itineraries, activeFilter, searchQuery]);

  const filterTabs = [
    { id: 'all', label: 'All Dates', count: itineraries.length },
    { id: 'upcoming', label: 'Upcoming', count: itineraries.filter(i => i.status === 'upcoming').length },
    { id: 'completed', label: 'Completed', count: itineraries.filter(i => i.status === 'completed').length },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-romantic flex items-center justify-center">
        <div className="animate-pulse text-rose-400">Loading your dates...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-romantic">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-ink">Our Dates</h1>
            <p className="text-ink-lighter mt-1">All the adventures we've planned together</p>
          </div>

          <Link to="/itineraries/new" className="btn btn-primary">
            <Plus className="w-4 h-4" />
            Plan New Date
          </Link>
        </div>

        {/* Filters & Search */}
        <div className="card p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Filter Tabs */}
            <div className="flex bg-blush rounded-lg p-1 flex-shrink-0">
              {filterTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                    activeFilter === tab.id
                      ? 'bg-white text-rose-600 shadow-sm'
                      : 'text-ink-lighter hover:text-ink'
                  }`}
                >
                  {tab.label}
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    activeFilter === tab.id ? 'bg-rose-100' : 'bg-sand'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-lighter" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title or location..."
                className="input pl-10"
              />
            </div>

            {/* View Toggle */}
            <div className="flex bg-blush rounded-lg p-1 flex-shrink-0">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-all ${
                  viewMode === 'grid' ? 'bg-white shadow-sm' : ''
                }`}
              >
                <Grid className={`w-5 h-5 ${viewMode === 'grid' ? 'text-rose-600' : 'text-ink-lighter'}`} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-all ${
                  viewMode === 'list' ? 'bg-white shadow-sm' : ''
                }`}
              >
                <List className={`w-5 h-5 ${viewMode === 'list' ? 'text-rose-600' : 'text-ink-lighter'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Itineraries Grid/List */}
        {filteredItineraries.length > 0 ? (
          <motion.div
            layout
            className={viewMode === 'grid'
              ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-4'
            }
          >
            <AnimatePresence>
              {filteredItineraries.map((itinerary, index) => (
                <motion.div
                  key={itinerary.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <ItineraryCard
                    itinerary={itinerary}
                    compact={viewMode === 'list'}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="card p-12 text-center">
            <Calendar className="w-16 h-16 text-rose-200 mx-auto mb-4" />
            <h3 className="font-display text-xl font-semibold text-ink mb-2">
              {searchQuery ? 'No dates found' : 'No dates yet'}
            </h3>
            <p className="text-ink-lighter mb-6">
              {searchQuery
                ? 'Try adjusting your search or filters'
                : "Start planning your first adventure together!"
              }
            </p>
            {!searchQuery && (
              <Link to="/itineraries/new" className="btn btn-primary">
                <Plus className="w-4 h-4" />
                Plan Your First Date
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
