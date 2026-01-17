import { useState } from 'react';
import {
  ShoppingBag, UtensilsCrossed, Coffee, Gamepad2, Train, MapPin, Gift,
  Clock, DollarSign, Lightbulb, ExternalLink, ChevronDown, ChevronUp, Check, GripVertical, Edit
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatTime, formatTimeRange, calculateDuration } from '../../utils/dateUtils';

const activityIcons = {
  shopping: ShoppingBag,
  dining: UtensilsCrossed,
  cafe: Coffee,
  activity: Gamepad2,
  travel: Train,
  arrival: MapPin,
  surprise: Gift,
};

const activityColors = {
  shopping: 'badge-shopping',
  dining: 'badge-dining',
  cafe: 'badge-cafe',
  activity: 'badge-activity',
  travel: 'badge-travel',
  arrival: 'badge-arrival',
  surprise: 'badge-surprise',
};

export default function ActivityCard({ activity, onToggleComplete, onEdit, onUpdate, isDragging }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const Icon = activityIcons[activity.type] || MapPin;

  const duration = calculateDuration(activity.startTime, activity.endTime);
  const hasStops = activity.location?.stops && activity.location.stops.length > 0;

  return (
    <motion.div
      layout
      className={`relative pl-24 ${isDragging ? 'opacity-50' : ''}`}
    >
      {/* Timeline Dot */}
      <div className={`absolute left-14 top-2 timeline-dot ${activity.completed ? 'timeline-dot-completed' : ''}`} />

      {/* Time Label */}
      <div className="absolute left-0 top-2 text-xs text-ink-lighter font-medium whitespace-nowrap">
        {formatTime(activity.startTime)}
      </div>

      {/* Card */}
      <div className={`card p-4 ${activity.completed ? 'bg-cream border border-gold-light' : 'bg-white'}`}>
        {/* Header */}
        <div className="flex items-start gap-3">
          {/* Drag Handle */}
          <div className="cursor-grab active:cursor-grabbing text-ink-lighter hover:text-ink mt-1">
            <GripVertical className="w-4 h-4" />
          </div>

          {/* Type Badge & Title */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`badge ${activityColors[activity.type]}`}>
                <Icon className="w-3 h-3" />
                {activity.type}
              </span>
              {duration && (
                <span className="text-xs text-ink-lighter flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {duration}
                </span>
              )}
            </div>

            <h4 className={`font-display text-lg font-semibold ${activity.completed ? 'text-ink-light line-through' : 'text-ink'}`}>
              {activity.title}
            </h4>

            {/* Location */}
            {activity.location?.name && (
              <div className="flex items-start gap-2 mt-2 text-sm text-ink-light">
                <MapPin className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span>{activity.location.name}</span>
                  {activity.location.address && (
                    <span className="text-ink-lighter"> · {activity.location.address}</span>
                  )}
                  {activity.location.crossStreet && (
                    <span className="text-ink-lighter"> ({activity.location.crossStreet})</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Edit Button */}
            {onEdit && (
              <button
                onClick={() => onEdit(activity)}
                className="p-2 rounded-full bg-blush text-ink-lighter hover:bg-rose-100 hover:text-rose-500 transition-all"
              >
                <Edit className="w-4 h-4" />
              </button>
            )}

            {/* Complete Toggle */}
            <button
              onClick={() => onToggleComplete?.(activity.id, !activity.completed)}
              className={`p-2 rounded-full transition-all ${
                activity.completed
                  ? 'bg-gold text-white'
                  : 'bg-blush text-ink-lighter hover:bg-rose-100 hover:text-rose-500'
              }`}
            >
              <Check className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Expandable Content */}
        <AnimatePresence>
          {(isExpanded || hasStops || activity.notes || activity.tips || activity.budget?.note) && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-4 pt-4 border-t border-blush space-y-3">
                {/* Multi-stop locations */}
                {hasStops && (
                  <div className="bg-rose-50 rounded-lg p-3">
                    <p className="text-xs text-rose-600 uppercase tracking-wider font-medium mb-2">Route</p>
                    <div className="space-y-2">
                      {activity.location.stops.map((stop, index) => (
                        <div key={index} className="flex items-start gap-2 text-sm">
                          <span className="text-rose-400 font-semibold">{index + 1}.</span>
                          <div>
                            <span className="font-medium text-ink">{stop.name}</span>
                            {stop.address && <span className="text-ink-lighter"> ({stop.address})</span>}
                            {stop.note && (
                              <p className="text-ink-lighter text-xs mt-0.5">{stop.note}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {activity.notes && (
                  <div className="text-sm text-ink-light">
                    <p>{activity.notes}</p>
                  </div>
                )}

                {/* Tips */}
                {activity.tips && (
                  <div className="flex items-start gap-2 text-sm bg-gold/10 rounded-lg p-3">
                    <Lightbulb className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
                    <p className="text-ink-light">{activity.tips}</p>
                  </div>
                )}

                {/* Budget */}
                {activity.budget?.note && (
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="w-4 h-4 text-rose-400" />
                    <span className="text-ink-light">{activity.budget.note}</span>
                  </div>
                )}

                {/* Maps Link */}
                {activity.location?.mapsUrl && (
                  <a
                    href={activity.location.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-rose-500 hover:underline"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Open in Maps
                  </a>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Expand Toggle */}
        {(hasStops || activity.notes || activity.tips || activity.budget?.note) && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full mt-3 pt-3 border-t border-blush text-sm text-ink-lighter hover:text-rose-500 flex items-center justify-center gap-1"
          >
            {isExpanded ? (
              <>
                Show less <ChevronUp className="w-4 h-4" />
              </>
            ) : (
              <>
                Show details <ChevronDown className="w-4 h-4" />
              </>
            )}
          </button>
        )}
      </div>
    </motion.div>
  );
}
