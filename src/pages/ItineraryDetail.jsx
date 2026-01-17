import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Calendar, MapPin, DollarSign, Clock, Edit, Trash2, Check, Share, Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useItinerary } from '../context/ItineraryContext';
import ActivityCard from '../components/itinerary/ActivityCard';
import ActivityForm from '../components/itinerary/ActivityForm';
import Countdown from '../components/features/Countdown';
import { formatDate, isUpcoming } from '../utils/dateUtils';
import { useState } from 'react';

export default function ItineraryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getItineraryById, updateActivity, addActivity, markAsCompleted, deleteItinerary } = useItinerary();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [showCopied, setShowCopied] = useState(false);

  const itinerary = getItineraryById(id);

  if (!itinerary) {
    return (
      <div className="min-h-screen bg-gradient-romantic flex items-center justify-center">
        <div className="text-center">
          <p className="text-ink-lighter mb-4">Itinerary not found</p>
          <Link to="/itineraries" className="btn btn-secondary">
            Back to Dates
          </Link>
        </div>
      </div>
    );
  }

  const handleToggleActivity = async (activityId, completed) => {
    await updateActivity(id, activityId, { completed });
  };

  const handleMarkCompleted = async () => {
    await markAsCompleted(id);
  };

  const handleDelete = async () => {
    await deleteItinerary(id);
    navigate('/itineraries');
  };

  const handleAddActivity = () => {
    setEditingActivity(null);
    setShowActivityForm(true);
  };

  const handleEditActivity = (activity) => {
    setEditingActivity(activity);
    setShowActivityForm(true);
  };

  const handleSaveActivity = async (activityData) => {
    if (editingActivity) {
      // Update existing activity
      await updateActivity(id, activityData.id, activityData);
    } else {
      // Add new activity
      await addActivity(id, activityData);
    }
    setShowActivityForm(false);
    setEditingActivity(null);
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareData = {
      title: itinerary.title,
      text: `Check out our date: ${itinerary.title}`,
      url: shareUrl,
    };

    try {
      // Try using Web Share API (works on mobile, opens native share including iMessage)
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(shareUrl);
        setShowCopied(true);
        setTimeout(() => setShowCopied(false), 2000);
      }
    } catch (error) {
      // User cancelled or error occurred
      if (error.name !== 'AbortError') {
        console.error('Error sharing:', error);
        // Try copying to clipboard as final fallback
        try {
          await navigator.clipboard.writeText(shareUrl);
          setShowCopied(true);
          setTimeout(() => setShowCopied(false), 2000);
        } catch (clipboardError) {
          console.error('Failed to copy to clipboard:', clipboardError);
        }
      }
    }
  };

  const sortedActivities = [...(itinerary.activities || [])].sort((a, b) => a.order - b.order);
  const isDateUpcoming = isUpcoming(itinerary.date);
  const allActivitiesCompleted = sortedActivities.every(a => a.completed);

  return (
    <div className="min-h-screen bg-gradient-romantic">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Link
          to="/itineraries"
          className="inline-flex items-center gap-2 text-ink-light hover:text-rose-500 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dates
        </Link>

        {/* Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6 md:p-8 mb-6"
        >
          {/* Status & Actions */}
          <div className="flex items-start justify-between mb-4">
            <span className={`badge ${itinerary.status === 'upcoming' ? 'status-upcoming' : 'status-completed'} px-3 py-1`}>
              {itinerary.status === 'upcoming' ? 'Upcoming' : 'Completed'}
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="p-2 rounded-lg text-ink-lighter hover:bg-blush hover:text-rose-500"
              >
                <Share className="w-5 h-5" />
              </button>
              <Link
                to={`/itineraries/${id}/edit`}
                className="p-2 rounded-lg text-ink-lighter hover:bg-blush hover:text-rose-500"
              >
                <Edit className="w-5 h-5" />
              </Link>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-2 rounded-lg text-ink-lighter hover:bg-rose-50 hover:text-rose-500"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Title & Date */}
          <h1 className="font-display text-3xl md:text-4xl font-bold text-ink mb-2">
            {itinerary.title}
          </h1>

          <div className="flex items-center gap-2 text-ink-light mb-6">
            <Calendar className="w-5 h-5 text-rose-400" />
            <span>{formatDate(itinerary.date)}</span>
          </div>

          {/* Countdown for upcoming dates */}
          {isDateUpcoming && (
            <div className="bg-rose-50 rounded-xl p-6 mb-6">
              <Countdown targetDate={itinerary.date} />
            </div>
          )}

          {/* Key Locations */}
          {itinerary.keyLocations && itinerary.keyLocations.length > 0 && (
            <div className="bg-blush rounded-xl p-4">
              <h3 className="text-sm uppercase tracking-wider text-ink-lighter font-medium mb-3">
                Key Locations
              </h3>
              <div className="grid md:grid-cols-2 gap-2">
                {itinerary.keyLocations.map((loc, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-rose-400" />
                    <span className="font-medium text-ink">{loc.name}</span>
                    <span className="text-ink-lighter">· {loc.address}</span>
                    {loc.shortNote && (
                      <span className="text-ink-lighter text-xs">({loc.shortNote})</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Timeline Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6 md:p-8 mb-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-xl font-semibold text-ink">Timeline</h2>
            <button onClick={handleAddActivity} className="btn btn-secondary text-sm">
              <Plus className="w-4 h-4" />
              Add Activity
            </button>
          </div>

          {/* Timeline */}
          <div className="relative">
            {/* Timeline Line */}
            <div className="timeline-line" />

            {/* Activities */}
            <div className="space-y-6">
              {sortedActivities.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <ActivityCard
                    activity={activity}
                    onToggleComplete={handleToggleActivity}
                    onEdit={handleEditActivity}
                  />
                </motion.div>
              ))}
            </div>
          </div>

          {sortedActivities.length === 0 && (
            <div className="text-center py-12">
              <Clock className="w-12 h-12 text-rose-200 mx-auto mb-4" />
              <p className="text-ink-lighter">No activities planned yet</p>
            </div>
          )}
        </motion.div>

        {/* Budget Section */}
        {itinerary.budget && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card p-6 md:p-8 mb-6"
          >
            <h2 className="font-display text-xl font-semibold text-ink mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-rose-400" />
              Budget
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-blush rounded-xl p-4">
                <p className="text-sm text-ink-lighter uppercase tracking-wider mb-1">Estimated</p>
                <p className="font-display text-2xl font-bold text-ink">
                  ${itinerary.budget.estimated?.total || 0}
                </p>
                {itinerary.budget.estimated?.breakdown && (
                  <p className="text-sm text-ink-lighter mt-1">
                    {itinerary.budget.estimated.breakdown}
                  </p>
                )}
              </div>

              {itinerary.status === 'completed' && (
                <div className="bg-gold/10 rounded-xl p-4">
                  <p className="text-sm text-ink-lighter uppercase tracking-wider mb-1">Actual</p>
                  <p className="font-display text-2xl font-bold text-ink">
                    ${itinerary.budget.actual?.total || '—'}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Mark as Completed */}
        {itinerary.status === 'upcoming' && allActivitiesCompleted && sortedActivities.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card p-6 text-center"
          >
            <p className="text-ink-light mb-4">All activities completed! Ready to mark this date as done?</p>
            <button onClick={handleMarkCompleted} className="btn btn-gold">
              <Check className="w-4 h-4" />
              Mark Date as Completed
            </button>
          </motion.div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="card p-6 max-w-md w-full"
            >
              <h3 className="font-display text-xl font-semibold text-ink mb-2">Delete this date?</h3>
              <p className="text-ink-lighter mb-6">
                This action cannot be undone. All activities and memories will be lost.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="btn bg-rose-500 text-white hover:bg-rose-600 flex-1"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Activity Form Modal */}
        {showActivityForm && (
          <ActivityForm
            activity={editingActivity}
            onSave={handleSaveActivity}
            onClose={() => {
              setShowActivityForm(false);
              setEditingActivity(null);
            }}
          />
        )}

        {/* Link Copied Toast */}
        <AnimatePresence>
          {showCopied && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50"
            >
              <div className="bg-ink text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2">
                <Check className="w-4 h-4 text-gold" />
                <span className="font-medium">Link copied to clipboard!</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
