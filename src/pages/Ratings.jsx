import { useState, useMemo, useEffect } from 'react';
import { Film, Tv, Sparkles, UtensilsCrossed, Plus, Trash2, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';

const CATEGORIES = [
  { key: 'movies', label: 'Movies', icon: Film },
  { key: 'shows', label: 'Shows', icon: Tv },
  { key: 'anime', label: 'Anime', icon: Sparkles },
  { key: 'food', label: 'Food', icon: UtensilsCrossed },
];

const SUBCATEGORY_LABEL = {
  anime: 'Genre',
  food: 'Cuisine',
};

function total(item) {
  return (item.rohitRating ?? 0) + (item.farhinRating ?? 0);
}

function parseRating(value) {
  if (value === '' || value === null || value === undefined) return null;
  const num = Number(value);
  if (Number.isNaN(num)) return null;
  return Math.max(0, Math.min(10, num));
}

export default function Ratings() {
  const [category, setCategory] = useState('movies');
  const items = useQuery(api.ratings.list, { category }) || [];
  const addItem = useMutation(api.ratings.add);
  const updateItem = useMutation(api.ratings.update);
  const removeItem = useMutation(api.ratings.remove);

  const [newTitle, setNewTitle] = useState('');
  const [newSub, setNewSub] = useState('');
  const [adding, setAdding] = useState(false);

  const sorted = useMemo(() => {
    return [...items].sort((a, b) => {
      const ta = total(a);
      const tb = total(b);
      if (tb !== ta) return tb - ta;
      if (a.watched !== b.watched) return a.watched ? -1 : 1;
      return a.title.localeCompare(b.title);
    });
  }, [items]);

  const subLabel = SUBCATEGORY_LABEL[category];

  const handleAdd = async (e) => {
    e.preventDefault();
    const title = newTitle.trim();
    if (!title) return;
    setAdding(true);
    try {
      await addItem({
        title,
        category,
        subCategory: subLabel && newSub.trim() ? newSub.trim() : undefined,
      });
      setNewTitle('');
      setNewSub('');
    } finally {
      setAdding(false);
    }
  };

  const handleRatingChange = (id, field, value) => {
    const parsed = parseRating(value);
    updateItem({ id, [field]: parsed });
  };

  const handleToggleWatched = (item) => {
    updateItem({ id: item.id, watched: !item.watched });
  };

  const handleDelete = (id) => {
    removeItem({ id });
  };

  return (
    <div className="min-h-screen bg-gradient-romantic">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="font-display text-4xl font-bold text-ink mb-2">Our Ratings</h1>
          <p className="font-script text-xl text-rose-400">
            Every movie, show, bite, and binge — scored together
          </p>
        </motion.div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {CATEGORIES.map(({ key, label, icon: Icon }) => {
            const isActive = category === key;
            return (
              <button
                key={key}
                onClick={() => setCategory(key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-rose-500 text-white shadow'
                    : 'bg-white text-ink-light hover:bg-blush hover:text-rose-500'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            );
          })}
        </div>

        {/* Add Form */}
        <form onSubmit={handleAdd} className="card p-4 mb-6 flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-medium text-ink-light mb-1">Title</label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Add a new item..."
              className="input"
            />
          </div>
          {subLabel && (
            <div className="flex-1 min-w-[150px]">
              <label className="block text-xs font-medium text-ink-light mb-1">
                {subLabel}
              </label>
              <input
                type="text"
                value={newSub}
                onChange={(e) => setNewSub(e.target.value)}
                placeholder={subLabel}
                className="input"
              />
            </div>
          )}
          <button
            type="submit"
            disabled={adding || !newTitle.trim()}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </form>

        {/* List */}
        <div className="card overflow-hidden">
          {/* Table Header */}
          <div className="hidden md:grid grid-cols-[1fr_100px_100px_80px_80px_40px] gap-3 px-4 py-3 bg-blush text-xs font-semibold text-ink-light uppercase tracking-wide">
            <div>Title</div>
            <div className="text-center">Rohit</div>
            <div className="text-center">Farhin</div>
            <div className="text-center">Total</div>
            <div className="text-center">Seen</div>
            <div></div>
          </div>

          {sorted.length === 0 ? (
            <div className="text-center py-12 text-ink-lighter">
              Nothing rated yet — add your first item above.
            </div>
          ) : (
            <AnimatePresence>
              {sorted.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="grid grid-cols-2 md:grid-cols-[1fr_100px_100px_80px_80px_40px] gap-3 px-4 py-3 border-t border-blush items-center"
                >
                  <div className="col-span-2 md:col-span-1">
                    <div className="font-medium text-ink">{item.title}</div>
                    {item.subCategory && (
                      <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-rose-50 text-rose-600">
                        {item.subCategory}
                      </span>
                    )}
                  </div>
                  <RatingInput
                    label="Rohit"
                    value={item.rohitRating}
                    onChange={(v) => handleRatingChange(item.id, 'rohitRating', v)}
                  />
                  <RatingInput
                    label="Farhin"
                    value={item.farhinRating}
                    onChange={(v) => handleRatingChange(item.id, 'farhinRating', v)}
                  />
                  <div className="text-center font-semibold text-rose-500">
                    <span className="md:hidden text-xs text-ink-lighter mr-1">Total:</span>
                    {total(item).toFixed(2)}
                  </div>
                  <div className="flex justify-center">
                    <button
                      onClick={() => handleToggleWatched(item)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                        item.watched
                          ? 'bg-rose-500 text-white'
                          : 'bg-blush text-ink-lighter hover:bg-rose-100'
                      }`}
                      title={item.watched ? 'Mark unseen' : 'Mark seen'}
                    >
                      {item.watched ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="flex justify-center">
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-ink-lighter hover:bg-rose-50 hover:text-rose-500"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}

function RatingInput({ label, value, onChange }) {
  const [draft, setDraft] = useState(value ?? '');

  // Sync when remote value changes.
  useEffect(() => {
    setDraft(value ?? '');
  }, [value]);

  return (
    <div className="flex items-center justify-center">
      <span className="md:hidden text-xs text-ink-lighter mr-1">{label}:</span>
      <input
        type="number"
        min="0"
        max="10"
        step="0.25"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => {
          if ((draft === '' ? null : Number(draft)) !== (value ?? null)) {
            onChange(draft);
          }
        }}
        className="input w-16 text-center px-2 py-1 text-sm"
      />
    </div>
  );
}
