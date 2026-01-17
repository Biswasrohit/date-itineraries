import { Link } from 'react-router-dom';
import { Calendar, MapPin, Clock, DollarSign, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDate, formatDateShort, getRelativeDate } from '../../utils/dateUtils';

export default function ItineraryCard({ itinerary, compact = false }) {
  const { id, title, date, status, activities, keyLocations, budget } = itinerary;

  const activityCount = activities?.length || 0;
  const locationCount = keyLocations?.length || 0;
  const estimatedBudget = budget?.estimated?.total;

  if (compact) {
    return (
      <Link to={`/itineraries/${id}`}>
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="card p-4 cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="font-display text-lg font-semibold text-ink">{title}</h3>
              <p className="text-sm text-ink-lighter mt-1">
                {formatDateShort(date)} • {getRelativeDate(date)}
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-ink-lighter" />
          </div>
        </motion.div>
      </Link>
    );
  }

  return (
    <Link to={`/itineraries/${id}`}>
      <motion.div
        whileHover={{ y: -4 }}
        className="card p-6 cursor-pointer group"
      >
        {/* Status Badge */}
        <div className="flex items-start justify-between mb-4">
          <span className={`badge ${status === 'upcoming' ? 'status-upcoming' : 'status-completed'} px-3 py-1`}>
            {status === 'upcoming' ? 'Upcoming' : 'Completed'}
          </span>
          <ChevronRight className="w-5 h-5 text-ink-lighter group-hover:text-rose-500 transition-colors" />
        </div>

        {/* Title */}
        <h3 className="font-display text-xl font-semibold text-ink mb-2">
          {title}
        </h3>

        {/* Date */}
        <div className="flex items-center gap-2 text-ink-light mb-4">
          <Calendar className="w-4 h-4 text-rose-400" />
          <span className="text-sm">{formatDate(date)}</span>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap gap-4 text-sm text-ink-lighter">
          {locationCount > 0 && (
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4 text-rose-300" />
              <span>{locationCount} locations</span>
            </div>
          )}

          {activityCount > 0 && (
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-rose-300" />
              <span>{activityCount} activities</span>
            </div>
          )}

          {estimatedBudget && (
            <div className="flex items-center gap-1">
              <DollarSign className="w-4 h-4 text-rose-300" />
              <span>~${estimatedBudget}</span>
            </div>
          )}
        </div>

        {/* Key Locations Preview */}
        {keyLocations && keyLocations.length > 0 && (
          <div className="mt-4 pt-4 border-t border-blush">
            <p className="text-xs text-ink-lighter uppercase tracking-wider mb-2">Key Stops</p>
            <div className="flex flex-wrap gap-2">
              {keyLocations.slice(0, 3).map((loc, index) => (
                <span
                  key={index}
                  className="text-xs bg-blush text-ink-light px-2 py-1 rounded-full"
                >
                  {loc.name}
                </span>
              ))}
              {keyLocations.length > 3 && (
                <span className="text-xs text-ink-lighter">
                  +{keyLocations.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </Link>
  );
}
