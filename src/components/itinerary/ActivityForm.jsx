import { useState } from 'react';
import { X, Clock, MapPin, DollarSign, Save } from 'lucide-react';
import { motion } from 'framer-motion';

const activityTypes = [
  { value: 'arrival', label: 'Arrival' },
  { value: 'shopping', label: 'Shopping' },
  { value: 'activity', label: 'Activity' },
  { value: 'dining', label: 'Dining' },
  { value: 'cafe', label: 'Cafe' },
  { value: 'travel', label: 'Travel' },
  { value: 'surprise', label: 'Surprise' },
];

export default function ActivityForm({ activity, onSave, onClose }) {
  const [formData, setFormData] = useState(activity || {
    id: crypto.randomUUID(),
    startTime: '',
    endTime: '',
    title: '',
    type: 'activity',
    location: { name: '', address: '', crossStreet: '', neighborhood: '', mapsUrl: '', stops: null },
    notes: '',
    tips: '',
    budget: { estimated: null, actual: null, note: '' },
    completed: false,
    order: 0,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Failed to save activity:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="card p-6 max-w-2xl w-full my-8"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl font-semibold text-ink">
            {activity ? 'Edit Activity' : 'Add Activity'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-ink-lighter hover:bg-blush hover:text-rose-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Time & Type Row */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-ink mb-2">Start Time</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-lighter" />
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => updateField('startTime', e.target.value)}
                  className="input pl-10"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-2">End Time</label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => updateField('endTime', e.target.value)}
                className="input pl-4"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-2">Type</label>
              <select
                value={formData.type}
                onChange={(e) => updateField('type', e.target.value)}
                className="input pl-4"
              >
                {activityTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-ink mb-2">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="e.g., Shopping on 5th Avenue"
              className="input pl-4"
              required
            />
          </div>

          {/* Location */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-ink-light">
              <MapPin className="w-4 h-4" />
              <span className="text-sm font-medium">Location</span>
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              <input
                type="text"
                value={formData.location.name}
                onChange={(e) => updateField('location.name', e.target.value)}
                placeholder="Location Name"
                className="input pl-4"
              />
              <input
                type="text"
                value={formData.location.address}
                onChange={(e) => updateField('location.address', e.target.value)}
                placeholder="Address"
                className="input pl-4"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              <input
                type="text"
                value={formData.location.crossStreet}
                onChange={(e) => updateField('location.crossStreet', e.target.value)}
                placeholder="Cross Street (optional)"
                className="input pl-4"
              />
              <input
                type="text"
                value={formData.location.neighborhood}
                onChange={(e) => updateField('location.neighborhood', e.target.value)}
                placeholder="Neighborhood (optional)"
                className="input pl-4"
              />
            </div>

            <input
              type="url"
              value={formData.location.mapsUrl}
              onChange={(e) => updateField('location.mapsUrl', e.target.value)}
              placeholder="Google Maps URL (optional)"
              className="input pl-4"
            />
          </div>

          {/* Notes & Tips */}
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-ink mb-2">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => updateField('notes', e.target.value)}
                placeholder="Any details or notes..."
                rows={3}
                className="input pl-4"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-2">Tips</label>
              <textarea
                value={formData.tips}
                onChange={(e) => updateField('tips', e.target.value)}
                placeholder="Helpful tips or reminders..."
                rows={3}
                className="input pl-4"
              />
            </div>
          </div>

          {/* Budget */}
          <div>
            <div className="flex items-center gap-2 text-ink-light mb-2">
              <DollarSign className="w-4 h-4" />
              <span className="text-sm font-medium">Budget Note</span>
            </div>
            <input
              type="text"
              value={formData.budget.note}
              onChange={(e) => updateField('budget.note', e.target.value)}
              placeholder="e.g., ~$40-50 or Variable"
              className="input pl-4"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary flex-1"
            >
              {loading ? (
                <span className="animate-pulse">Saving...</span>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {activity ? 'Update' : 'Add'} Activity
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
