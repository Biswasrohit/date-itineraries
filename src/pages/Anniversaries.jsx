import { useState, useEffect } from 'react';
import { Star, Plus, Calendar, Heart, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { formatDate, getRelativeDate } from '../utils/dateUtils';
import { useCountdown } from '../hooks/useCountdown';

function AnniversaryCard({ anniversary, onDelete }) {
  const { days, hours, isPast } = useCountdown(anniversary.date);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="card p-6"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-xl ${isPast ? 'bg-gold/20' : 'bg-rose-100'}`}>
            <Heart className={`w-6 h-6 ${isPast ? 'text-gold' : 'text-rose-500'}`} />
          </div>
          <div>
            <h3 className="font-display text-lg font-semibold text-ink">{anniversary.title}</h3>
            <p className="text-sm text-ink-lighter mt-1">{formatDate(anniversary.date)}</p>
            {anniversary.description && (
              <p className="text-sm text-ink-light mt-2">{anniversary.description}</p>
            )}
          </div>
        </div>
        <button
          onClick={() => onDelete(anniversary.id)}
          className="p-2 text-ink-lighter hover:text-rose-500 hover:bg-rose-50 rounded-lg"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {!isPast && (
        <div className="mt-4 pt-4 border-t border-blush">
          <p className="text-sm text-ink-lighter">
            {days > 0 ? (
              <>
                <span className="font-display text-2xl font-bold text-rose-500">{days}</span>
                <span className="ml-1">days away</span>
              </>
            ) : (
              <>
                <span className="font-display text-2xl font-bold text-rose-500">{hours}</span>
                <span className="ml-1">hours away</span>
              </>
            )}
          </p>
        </div>
      )}

      {isPast && (
        <div className="mt-4 pt-4 border-t border-blush">
          <p className="text-sm text-gold font-medium flex items-center gap-1">
            <Star className="w-4 h-4 fill-gold" />
            {getRelativeDate(anniversary.date)}
          </p>
        </div>
      )}
    </motion.div>
  );
}

export default function Anniversaries() {
  const [anniversaries, setAnniversaries] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    description: '',
    recurring: true,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'anniversaries'), orderBy('date', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate?.() || new Date(doc.data().date)
      }));
      setAnniversaries(data);
    }, (error) => {
      console.error('Error fetching anniversaries:', error);
    });

    return unsubscribe;
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await addDoc(collection(db, 'anniversaries'), {
        ...formData,
        date: new Date(formData.date),
        createdAt: serverTimestamp(),
      });
      setFormData({ title: '', date: '', description: '', recurring: true });
      setShowForm(false);
    } catch (error) {
      console.error('Failed to add anniversary:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'anniversaries', id));
    } catch (error) {
      console.error('Failed to delete anniversary:', error);
    }
  };

  const upcomingAnniversaries = anniversaries.filter(a => new Date(a.date) >= new Date());
  const pastAnniversaries = anniversaries.filter(a => new Date(a.date) < new Date());

  return (
    <div className="min-h-screen bg-gradient-romantic">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start justify-between mb-8"
        >
          <div>
            <h1 className="font-display text-4xl font-bold text-ink mb-2">Milestones</h1>
            <p className="text-ink-lighter">Track your special dates and anniversaries</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="btn btn-primary"
          >
            <Plus className="w-4 h-4" />
            Add Milestone
          </button>
        </motion.div>

        {/* Add Form Modal */}
        <AnimatePresence>
          {showForm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="card p-6 max-w-md w-full"
              >
                <h2 className="font-display text-xl font-semibold text-ink mb-4">Add Milestone</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-ink mb-2">Title</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g., First Date Anniversary"
                      required
                      className="input pl-4"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-ink mb-2">Date</label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                      required
                      className="input pl-4"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-ink mb-2">Description (optional)</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Why is this date special?"
                      rows={2}
                      className="input pl-4"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="recurring"
                      checked={formData.recurring}
                      onChange={(e) => setFormData(prev => ({ ...prev, recurring: e.target.checked }))}
                      className="w-4 h-4 text-rose-500 rounded border-blush focus:ring-rose-500"
                    />
                    <label htmlFor="recurring" className="text-sm text-ink-light">
                      Recurring yearly
                    </label>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="btn btn-secondary flex-1"
                    >
                      Cancel
                    </button>
                    <button type="submit" disabled={loading} className="btn btn-primary flex-1">
                      {loading ? 'Adding...' : 'Add Milestone'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Upcoming Anniversaries */}
        {upcomingAnniversaries.length > 0 && (
          <section className="mb-12">
            <h2 className="font-display text-lg font-semibold text-ink mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-rose-400" />
              Upcoming
            </h2>
            <div className="space-y-4">
              <AnimatePresence>
                {upcomingAnniversaries.map((anniversary) => (
                  <AnniversaryCard
                    key={anniversary.id}
                    anniversary={anniversary}
                    onDelete={handleDelete}
                  />
                ))}
              </AnimatePresence>
            </div>
          </section>
        )}

        {/* Past Anniversaries */}
        {pastAnniversaries.length > 0 && (
          <section>
            <h2 className="font-display text-lg font-semibold text-ink mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-gold" />
              Past Milestones
            </h2>
            <div className="space-y-4">
              <AnimatePresence>
                {pastAnniversaries.map((anniversary) => (
                  <AnniversaryCard
                    key={anniversary.id}
                    anniversary={anniversary}
                    onDelete={handleDelete}
                  />
                ))}
              </AnimatePresence>
            </div>
          </section>
        )}

        {/* Empty State */}
        {anniversaries.length === 0 && (
          <div className="card p-12 text-center">
            <Star className="w-16 h-16 text-rose-200 mx-auto mb-4" />
            <h3 className="font-display text-xl font-semibold text-ink mb-2">No milestones yet</h3>
            <p className="text-ink-lighter mb-6">
              Add your special dates like anniversaries, first date, and more!
            </p>
            <button onClick={() => setShowForm(true)} className="btn btn-primary">
              <Plus className="w-4 h-4" />
              Add Your First Milestone
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
