import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Plus, Trash2, Save, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useItinerary } from '../context/ItineraryContext';
import { createLocalDate } from '../utils/dateUtils';

const activityTypes = [
  { value: 'arrival', label: 'Arrival' },
  { value: 'shopping', label: 'Shopping' },
  { value: 'activity', label: 'Activity' },
  { value: 'dining', label: 'Dining' },
  { value: 'cafe', label: 'Cafe' },
  { value: 'travel', label: 'Travel' },
  { value: 'surprise', label: 'Surprise' },
];

export default function EditItinerary() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getItineraryById, updateItinerary } = useItinerary();
  const [loading, setLoading] = useState(false);

  const itinerary = getItineraryById(id);

  const [formData, setFormData] = useState({
    title: '',
    date: '',
    description: '',
    keyLocations: [{ name: '', address: '', shortNote: '' }],
    activities: [],
    budget: { estimated: { total: 0, breakdown: '' }, actual: { total: null, breakdown: null } },
  });

  useEffect(() => {
    if (itinerary) {
      // Convert date to YYYY-MM-DD format for input
      const dateStr = itinerary.date instanceof Date
        ? itinerary.date.toISOString().split('T')[0]
        : new Date(itinerary.date).toISOString().split('T')[0];

      setFormData({
        title: itinerary.title || '',
        date: dateStr,
        description: itinerary.description || '',
        keyLocations: itinerary.keyLocations?.length > 0
          ? itinerary.keyLocations
          : [{ name: '', address: '', shortNote: '' }],
        activities: itinerary.activities || [],
        budget: itinerary.budget || {
          estimated: { total: 0, breakdown: '' },
          actual: { total: null, breakdown: null }
        },
      });
    }
  }, [itinerary]);

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

  const addKeyLocation = () => {
    setFormData(prev => ({
      ...prev,
      keyLocations: [...prev.keyLocations, { name: '', address: '', shortNote: '' }]
    }));
  };

  const removeKeyLocation = (index) => {
    setFormData(prev => ({
      ...prev,
      keyLocations: prev.keyLocations.filter((_, i) => i !== index)
    }));
  };

  const updateKeyLocation = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      keyLocations: prev.keyLocations.map((loc, i) =>
        i === index ? { ...loc, [field]: value } : loc
      )
    }));
  };

  const addActivity = () => {
    setFormData(prev => ({
      ...prev,
      activities: [...prev.activities, {
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
        order: prev.activities.length,
      }]
    }));
  };

  const removeActivity = (index) => {
    setFormData(prev => ({
      ...prev,
      activities: prev.activities.filter((_, i) => i !== index).map((act, i) => ({ ...act, order: i }))
    }));
  };

  const updateActivity = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      activities: prev.activities.map((act, i) => {
        if (i !== index) return act;

        if (field.includes('.')) {
          const [parent, child] = field.split('.');
          return { ...act, [parent]: { ...act[parent], [child]: value } };
        }
        return { ...act, [field]: value };
      })
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Clean up empty key locations
      const keyLocations = formData.keyLocations.filter(loc => loc.name.trim());

      // Clean up and order activities
      const activities = formData.activities
        .filter(act => act.title.trim())
        .map((act, index) => ({
          ...act,
          order: index,
        }));

      await updateItinerary(id, {
        ...formData,
        date: createLocalDate(formData.date),
        keyLocations,
        activities,
      });

      navigate(`/itineraries/${id}`);
    } catch (error) {
      console.error('Failed to update itinerary:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-romantic">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Link
          to={`/itineraries/${id}`}
          className="inline-flex items-center gap-2 text-ink-light hover:text-rose-500 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Itinerary
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="font-display text-3xl font-bold text-ink mb-2">Edit Date</h1>
          <p className="text-ink-lighter mb-8">Update your itinerary details</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="card p-6">
              <h2 className="font-display text-lg font-semibold text-ink mb-4">Basic Info</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-ink mb-2">Date Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., NYC Shopping & Games Day"
                    required
                    className="input pl-4"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink mb-2">Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-lighter" />
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                      required
                      className="input pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink mb-2">Description (optional)</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="A brief description of the date..."
                    rows={2}
                    className="input pl-4"
                  />
                </div>
              </div>
            </div>

            {/* Key Locations */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-lg font-semibold text-ink">Key Locations</h2>
                <button
                  type="button"
                  onClick={addKeyLocation}
                  className="btn btn-secondary text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add Location
                </button>
              </div>

              <div className="space-y-4">
                {formData.keyLocations.map((loc, index) => (
                  <div key={index} className="flex gap-3 items-start">
                    <MapPin className="w-5 h-5 text-rose-400 mt-3" />
                    <div className="flex-1 grid md:grid-cols-3 gap-3">
                      <input
                        type="text"
                        value={loc.name}
                        onChange={(e) => updateKeyLocation(index, 'name', e.target.value)}
                        placeholder="Name"
                        className="input pl-4"
                      />
                      <input
                        type="text"
                        value={loc.address}
                        onChange={(e) => updateKeyLocation(index, 'address', e.target.value)}
                        placeholder="Address"
                        className="input pl-4"
                      />
                      <input
                        type="text"
                        value={loc.shortNote}
                        onChange={(e) => updateKeyLocation(index, 'shortNote', e.target.value)}
                        placeholder="Note (e.g., at 48th St)"
                        className="input pl-4"
                      />
                    </div>
                    {formData.keyLocations.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeKeyLocation(index)}
                        className="p-2 text-ink-lighter hover:text-rose-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Activities */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-lg font-semibold text-ink">Activities</h2>
                <button
                  type="button"
                  onClick={addActivity}
                  className="btn btn-secondary text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add Activity
                </button>
              </div>

              <div className="space-y-6">
                {formData.activities.map((activity, index) => (
                  <div key={activity.id} className="bg-blush rounded-xl p-4">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-medium text-ink">Activity {index + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeActivity(index)}
                        className="p-1 text-ink-lighter hover:text-rose-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-3">
                      {/* Time & Type Row */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div>
                          <label className="block text-xs text-ink-lighter mb-1">Start Time</label>
                          <div className="relative">
                            <Clock className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-lighter" />
                            <input
                              type="time"
                              value={activity.startTime}
                              onChange={(e) => updateActivity(index, 'startTime', e.target.value)}
                              className="input pl-8 text-sm"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs text-ink-lighter mb-1">End Time</label>
                          <input
                            type="time"
                            value={activity.endTime}
                            onChange={(e) => updateActivity(index, 'endTime', e.target.value)}
                            className="input pl-4 text-sm"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-xs text-ink-lighter mb-1">Type</label>
                          <select
                            value={activity.type}
                            onChange={(e) => updateActivity(index, 'type', e.target.value)}
                            className="input pl-4 text-sm"
                          >
                            {activityTypes.map(type => (
                              <option key={type.value} value={type.value}>{type.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Title */}
                      <div>
                        <label className="block text-xs text-ink-lighter mb-1">Title</label>
                        <input
                          type="text"
                          value={activity.title}
                          onChange={(e) => updateActivity(index, 'title', e.target.value)}
                          placeholder="e.g., Shopping on 5th Avenue"
                          className="input pl-4"
                        />
                      </div>

                      {/* Location */}
                      <div className="grid md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-ink-lighter mb-1">Location Name</label>
                          <input
                            type="text"
                            value={activity.location.name}
                            onChange={(e) => updateActivity(index, 'location.name', e.target.value)}
                            placeholder="e.g., H&M, Uniqlo"
                            className="input pl-4"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-ink-lighter mb-1">Address</label>
                          <input
                            type="text"
                            value={activity.location.address}
                            onChange={(e) => updateActivity(index, 'location.address', e.target.value)}
                            placeholder="e.g., 589 5th Ave"
                            className="input pl-4"
                          />
                        </div>
                      </div>

                      {/* Notes & Budget */}
                      <div className="grid md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-ink-lighter mb-1">Notes</label>
                          <textarea
                            value={activity.notes}
                            onChange={(e) => updateActivity(index, 'notes', e.target.value)}
                            placeholder="Any details..."
                            rows={2}
                            className="input pl-4 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-ink-lighter mb-1">Budget Note</label>
                          <input
                            type="text"
                            value={activity.budget.note}
                            onChange={(e) => updateActivity(index, 'budget.note', e.target.value)}
                            placeholder="e.g., ~$40-50"
                            className="input pl-4"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total Budget */}
            <div className="card p-6">
              <h2 className="font-display text-lg font-semibold text-ink mb-4">Total Budget</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-ink mb-2">Estimated Total ($)</label>
                  <input
                    type="number"
                    value={formData.budget.estimated.total || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      budget: {
                        ...prev.budget,
                        estimated: { ...prev.budget.estimated, total: parseFloat(e.target.value) || 0 }
                      }
                    }))}
                    placeholder="0"
                    className="input pl-4"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink mb-2">Budget Notes</label>
                  <input
                    type="text"
                    value={formData.budget.estimated.breakdown}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      budget: {
                        ...prev.budget,
                        estimated: { ...prev.budget.estimated, breakdown: e.target.value }
                      }
                    }))}
                    placeholder="e.g., Excludes shopping"
                    className="input pl-4"
                  />
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-4">
              <Link to={`/itineraries/${id}`} className="btn btn-secondary flex-1">
                Cancel
              </Link>
              <button type="submit" disabled={loading} className="btn btn-primary flex-1">
                {loading ? (
                  <span className="animate-pulse">Saving...</span>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
