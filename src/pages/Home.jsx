import { Link } from 'react-router-dom';
import { Heart, Plus, Calendar, Image, Star, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useItinerary } from '../context/ItineraryContext';
import Countdown from '../components/features/Countdown';
import ItineraryCard from '../components/itinerary/ItineraryCard';
import { formatDate } from '../utils/dateUtils';

export default function Home() {
  const { itineraries, getNextDate, getUpcoming, getCompleted, loading } = useItinerary();

  const nextDate = getNextDate();
  const upcomingDates = getUpcoming();
  const completedDates = getCompleted();

  const stats = [
    { label: 'Total Dates', value: itineraries.length, icon: Calendar },
    { label: 'Memories Made', value: completedDates.length, icon: Image },
    { label: 'Upcoming', value: upcomingDates.length, icon: Star },
  ];

  return (
    <div className="min-h-screen bg-gradient-romantic">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="font-display text-4xl md:text-5xl font-bold text-ink mb-4">
            Rani's Journal
          </h1>
          <p className="font-script text-xl md:text-2xl text-rose-400">
            Our adventures, one date at a time
          </p>
        </motion.div>

        {/* Countdown Section */}
        {nextDate ? (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-12"
          >
            <div className="card p-8 md:p-12 bg-white/80 backdrop-blur-sm">
              <div className="text-center mb-6">
                <p className="text-ink-lighter uppercase tracking-wider text-sm mb-2">Next Date</p>
                <h2 className="font-display text-2xl md:text-3xl font-semibold text-ink">
                  {nextDate.title}
                </h2>
                <p className="text-ink-light mt-1">{formatDate(nextDate.date)}</p>
              </div>

              <Countdown
                targetDate={nextDate.date}
                title="Counting down to our next adventure..."
              />

              <div className="text-center mt-8">
                <Link
                  to={`/itineraries/${nextDate.id}`}
                  className="btn btn-primary inline-flex items-center gap-2"
                >
                  View Itinerary
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </motion.section>
        ) : (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-12"
          >
            <div className="card p-8 md:p-12 bg-white/80 backdrop-blur-sm text-center">
              <Heart className="w-16 h-16 text-rose-300 mx-auto mb-4" />
              <h2 className="font-display text-2xl font-semibold text-ink mb-2">
                No upcoming dates yet
              </h2>
              <p className="text-ink-lighter mb-6">
                Start planning your next adventure together!
              </p>
              <Link
                to="/itineraries/new"
                className="btn btn-primary inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Plan a Date
              </Link>
            </div>
          </motion.section>
        )}

        {/* Stats Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-3 gap-4 mb-12"
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="card p-6 text-center"
              >
                <Icon className="w-8 h-8 text-rose-400 mx-auto mb-2" />
                <p className="font-display text-3xl font-bold text-ink">{stat.value}</p>
                <p className="text-sm text-ink-lighter">{stat.label}</p>
              </div>
            );
          })}
        </motion.section>

        {/* Quick Actions */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid md:grid-cols-2 gap-6 mb-12"
        >
          {/* Upcoming Dates */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg font-semibold text-ink">Upcoming Dates</h3>
              <Link to="/itineraries?filter=upcoming" className="text-sm text-rose-500 hover:underline">
                View all
              </Link>
            </div>

            {upcomingDates.length > 0 ? (
              <div className="space-y-3">
                {upcomingDates.slice(0, 3).map((itinerary) => (
                  <ItineraryCard key={itinerary.id} itinerary={itinerary} compact />
                ))}
              </div>
            ) : (
              <p className="text-ink-lighter text-center py-8">
                No upcoming dates planned
              </p>
            )}
          </div>

          {/* Recent Memories */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg font-semibold text-ink">Recent Memories</h3>
              <Link to="/memories" className="text-sm text-rose-500 hover:underline">
                View all
              </Link>
            </div>

            {completedDates.length > 0 ? (
              <div className="space-y-3">
                {completedDates.slice(0, 3).map((itinerary) => (
                  <ItineraryCard key={itinerary.id} itinerary={itinerary} compact />
                ))}
              </div>
            ) : (
              <p className="text-ink-lighter text-center py-8">
                No memories yet - go on some dates!
              </p>
            )}
          </div>
        </motion.section>

        {/* Create New Button (Floating) */}
        <Link
          to="/itineraries/new"
          className="fixed bottom-8 right-8 btn btn-primary shadow-lg rounded-full p-4 md:px-6"
        >
          <Plus className="w-6 h-6" />
          <span className="hidden md:inline">Plan a Date</span>
        </Link>
      </div>
    </div>
  );
}
