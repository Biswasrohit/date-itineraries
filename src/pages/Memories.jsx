import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Image, Calendar, Heart, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useItinerary } from '../context/ItineraryContext';
import { formatDateShort } from '../utils/dateUtils';
import MemoryLaneTeaser from '../components/valentine/MemoryLaneTeaser';
import ValentineAskPage from '../components/valentine/ValentineAskPage';

export default function Memories() {
  const { getCompleted } = useItinerary();
  const completedDates = getCompleted();
  const [showValentine, setShowValentine] = useState(false);
  const [hasAccepted, setHasAccepted] = useState(
    () => localStorage.getItem('valentines-2026-accepted') === 'true'
  );

  // Collect memories with reflections or favorite moments
  const allMemories = completedDates
    .filter(date => date.memories?.reflection || date.memories?.favoriteMemory)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="min-h-screen bg-gradient-romantic">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="font-display text-4xl font-bold text-ink mb-4">Our Memories</h1>
          <p className="font-script text-xl text-rose-400">Moments we've shared together</p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 gap-4 mb-12"
        >
          <div className="card p-6 text-center">
            <Calendar className="w-8 h-8 text-rose-400 mx-auto mb-2" />
            <p className="font-display text-3xl font-bold text-ink">{completedDates.length}</p>
            <p className="text-sm text-ink-lighter">Dates Completed</p>
          </div>
          <div className="card p-6 text-center">
            <Heart className="w-8 h-8 text-rose-400 mx-auto mb-2" />
            <p className="font-display text-3xl font-bold text-ink">
              {completedDates.filter(d => d.memories?.rating).length}
            </p>
            <p className="text-sm text-ink-lighter">Favorites</p>
          </div>
        </motion.div>

        {/* Memories Grid */}
        {allMemories.length > 0 || completedDates.length > 0 ? (
          <div className="space-y-8">
            {/* Valentine's Day Card */}
            {completedDates.length > 0 && (
              <MemoryLaneTeaser onOpen={() => setShowValentine(true)} />
            )}
            {allMemories.map((date, index) => (
              <motion.div
                key={date.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-display text-xl font-semibold text-ink">{date.title}</h3>
                    <p className="text-sm text-ink-lighter">{formatDateShort(date.date)}</p>
                  </div>
                  <Link
                    to={`/itineraries/${date.id}`}
                    className="text-sm text-rose-500 hover:underline"
                  >
                    View Date
                  </Link>
                </div>

                {/* Rating */}
                {date.memories?.rating && (
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Heart
                        key={i}
                        className={`w-5 h-5 ${
                          i < date.memories.rating
                            ? 'text-rose-500 fill-rose-500'
                            : 'text-rose-200'
                        }`}
                      />
                    ))}
                  </div>
                )}

                {/* Reflection */}
                {date.memories?.reflection && (
                  <div className="bg-blush rounded-lg p-4">
                    <p className="text-ink-light italic">{date.memories.reflection}</p>
                  </div>
                )}

                {/* Favorite Memory */}
                {date.memories?.favoriteMemory && (
                  <div className="mt-4 flex items-start gap-2">
                    <Heart className="w-4 h-4 text-rose-400 mt-1 flex-shrink-0" />
                    <p className="text-sm text-ink-light">
                      <span className="font-medium">Favorite moment:</span> {date.memories.favoriteMemory}
                    </p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="card p-12 text-center">
            <Image className="w-16 h-16 text-rose-200 mx-auto mb-4" />
            <h3 className="font-display text-xl font-semibold text-ink mb-2">No memories yet</h3>
            <p className="text-ink-lighter mb-6">
              Complete some dates to start building your memory collection!
            </p>
            <Link to="/itineraries?filter=completed" className="btn btn-secondary">
              View Completed Dates
            </Link>
          </div>
        )}
      </div>

      {/* Valentine's Ask Overlay */}
      <AnimatePresence>
        {showValentine && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col"
          >
            <div className="absolute inset-0 bg-cream" />
            <div className="relative z-10 flex items-center justify-end p-4">
              <button
                onClick={() => setShowValentine(false)}
                className="p-2 rounded-full bg-white/80 hover:bg-white shadow-sm"
              >
                <X className="w-5 h-5 text-ink-lighter" />
              </button>
            </div>
            <div className="relative z-10 flex-1 overflow-y-auto">
              <ValentineAskPage
                hasAccepted={hasAccepted}
                onAccept={() => setHasAccepted(true)}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
