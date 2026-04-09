import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import {
  Film,
  Tv,
  Sparkles,
  UtensilsCrossed,
  Plus,
  Minus,
  Trash2,
  Check,
  X,
  Pencil,
  MoreVertical,
  Eye,
  EyeOff,
  Crown,
  Award,
} from 'lucide-react';
import {
  // eslint-disable-next-line no-unused-vars -- used via <motion.foo> JSX, which this lint config doesn't track
  motion,
  AnimatePresence,
  LayoutGroup,
  useReducedMotion,
} from 'framer-motion';
import { useQuery, useMutation, useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';

// --- Constants -------------------------------------------------------------

const POSTER_CATEGORIES = new Set(['movies', 'shows', 'anime']);
const POSTER_FETCH_DELAY_MS = 350;
const RATING_COMMIT_DEBOUNCE_MS = 400;
const MAX_RATING = 10;

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

// --- Helpers ---------------------------------------------------------------

function total(item) {
  return (item.rohitRating ?? 0) + (item.farhinRating ?? 0);
}

function clampRating(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return null;
  const snapped = Math.round(value * 4) / 4;
  return Math.max(0, Math.min(MAX_RATING, snapped));
}

function stepRating(current, delta) {
  return clampRating((current ?? 0) + delta);
}

function formatRating(value) {
  if (value === null || value === undefined) return '—';
  const fixed = value.toFixed(2);
  const stripped = fixed.replace(/\.?0+$/, '');
  return stripped || '0';
}

function sortItems(items) {
  return [...items].sort((a, b) => {
    const ta = total(a);
    const tb = total(b);
    if (tb !== ta) return tb - ta;
    if (a.watched !== b.watched) return a.watched ? -1 : 1;
    return a.title.localeCompare(b.title);
  });
}

// --- Main page -------------------------------------------------------------

export default function Ratings() {
  const [category, setCategory] = useState('movies');

  // Subscribe to every category so the rail can show counts for free.
  // Convex dedupes subscriptions, so the active tab doesn't double-fetch.
  const moviesList = useQuery(api.ratings.list, { category: 'movies' });
  const showsList = useQuery(api.ratings.list, { category: 'shows' });
  const animeList = useQuery(api.ratings.list, { category: 'anime' });
  const foodList = useQuery(api.ratings.list, { category: 'food' });
  const lists = useMemo(
    () => ({
      movies: moviesList,
      shows: showsList,
      anime: animeList,
      food: foodList,
    }),
    [moviesList, showsList, animeList, foodList]
  );
  const items = useMemo(() => lists[category] ?? [], [lists, category]);
  const counts = {
    movies: moviesList?.length ?? 0,
    shows: showsList?.length ?? 0,
    anime: animeList?.length ?? 0,
    food: foodList?.length ?? 0,
  };

  const addItem = useMutation(api.ratings.add);
  const updateItem = useMutation(api.ratings.update);
  const removeItem = useMutation(api.ratings.remove);
  const fetchPoster = useAction(api.ratings.fetchPoster);

  const [expandedPillId, setExpandedPillIdRaw] = useState(null);
  const [frozenIds, setFrozenIds] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [deleteArmedId, setDeleteArmedId] = useState(null);
  const [sheet, setSheet] = useState(null);

  const posterFetchedRef = useRef(new Set());
  const reduceMotion = useReducedMotion();

  // Freeze the display order while any rating pill is expanded so the card
  // being edited does not jump away mid-stroke. Unfreezes on collapse.
  const sorted = useMemo(() => sortItems(items), [items]);

  // Keep the latest sorted list accessible from the stable setter below
  // without turning the setter into a churning dependency.
  const sortedRef = useRef(sorted);
  useEffect(() => {
    sortedRef.current = sorted;
  }, [sorted]);

  // Stable wrapper that updates expandedPillId and the freeze snapshot in
  // the same event handler — no setState-in-effect, no cascading renders.
  const setExpandedPillId = useCallback((next) => {
    setExpandedPillIdRaw(next);
    setFrozenIds((prev) => {
      if (next && !prev) return sortedRef.current.map((i) => i.id);
      if (!next) return null;
      return prev;
    });
  }, []);

  const displayList = useMemo(() => {
    if (!frozenIds) return sorted;
    const byId = new Map(sorted.map((i) => [i.id, i]));
    const rebuilt = frozenIds.map((id) => byId.get(id)).filter(Boolean);
    // Append any items that appeared after the freeze started.
    for (const item of sorted) {
      if (!rebuilt.some((f) => f.id === item.id)) rebuilt.push(item);
    }
    return rebuilt;
  }, [sorted, frozenIds]);

  const subLabel = SUBCATEGORY_LABEL[category];

  // Poster backfill — preserved verbatim from the previous implementation.
  useEffect(() => {
    if (!POSTER_CATEGORIES.has(category)) return;
    const queue = sorted.filter(
      (item) => !item.posterUrl && !posterFetchedRef.current.has(item.id)
    );
    if (queue.length === 0) return;
    let cancelled = false;
    (async () => {
      for (const item of queue) {
        if (cancelled) return;
        posterFetchedRef.current.add(item.id);
        try {
          await fetchPoster({ id: item.id });
        } catch {
          // swallow — a missing poster is not worth surfacing
        }
        await new Promise((r) => setTimeout(r, POSTER_FETCH_DELAY_MS));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sorted, category, fetchPoster]);

  // Auto-disarm the delete confirmation after 4s of inaction.
  useEffect(() => {
    if (!deleteArmedId) return;
    const t = setTimeout(() => setDeleteArmedId(null), 4000);
    return () => clearTimeout(t);
  }, [deleteArmedId]);

  // Close menu/pill when a pointerdown hits anything not tagged as
  // rating-interactive. Using pointerdown beats blur and focus races.
  useEffect(() => {
    if (expandedPillId === null && openMenuId === null) return;
    const onDown = (e) => {
      if (e.target.closest?.('[data-rating-interactive]')) return;
      setExpandedPillId(null);
      setOpenMenuId(null);
      setDeleteArmedId(null);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [expandedPillId, openMenuId, setExpandedPillId]);

  // Escape priority: sheet → menu → pill
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      if (sheet) {
        setSheet(null);
      } else if (openMenuId) {
        setOpenMenuId(null);
        setDeleteArmedId(null);
      } else if (expandedPillId) {
        setExpandedPillId(null);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [sheet, openMenuId, expandedPillId, setExpandedPillId]);

  const handleCategoryChange = useCallback(
    (next) => {
      setExpandedPillId(null);
      setOpenMenuId(null);
      setDeleteArmedId(null);
      setCategory(next);
    },
    [setExpandedPillId]
  );

  const handleAdd = useCallback(
    async ({ title, subCategory }) => {
      const trimmed = title.trim();
      if (!trimmed) return;
      const newId = await addItem({
        title: trimmed,
        category,
        subCategory:
          subLabel && subCategory?.trim() ? subCategory.trim() : undefined,
      });
      if (newId && POSTER_CATEGORIES.has(category)) {
        posterFetchedRef.current.add(newId);
        fetchPoster({ id: newId }).catch(() => {});
      }
    },
    [addItem, category, fetchPoster, subLabel]
  );

  const handleRatingCommit = useCallback(
    (id, field, value) => {
      updateItem({ id, [field]: value });
    },
    [updateItem]
  );

  const handleToggleWatched = useCallback(
    (item) => {
      updateItem({ id: item.id, watched: !item.watched });
    },
    [updateItem]
  );

  const handleDelete = useCallback(
    (id) => {
      removeItem({ id });
      setOpenMenuId(null);
      setDeleteArmedId(null);
    },
    [removeItem]
  );

  const handleRenameCommit = useCallback(
    async (id, nextTitle) => {
      const next = nextTitle.trim();
      if (!next) return;
      const item = items.find((i) => i.id === id);
      if (!item || next === item.title) return;
      await updateItem({ id, title: next });
      if (POSTER_CATEGORIES.has(category)) {
        posterFetchedRef.current.add(id);
        fetchPoster({ id, force: true }).catch(() => {});
      }
    },
    [items, updateItem, category, fetchPoster]
  );

  const stats = useMemo(() => {
    const rated = items.filter(
      (i) => i.rohitRating !== undefined || i.farhinRating !== undefined
    ).length;
    const watched = items.filter((i) => i.watched).length;
    return { rated, watched, total: items.length };
  }, [items]);

  const editingItem =
    sheet?.mode === 'edit' ? items.find((i) => i.id === sheet.itemId) : null;

  return (
    <div className="min-h-screen bg-gradient-romantic">
      <div className="max-w-4xl mx-auto px-4 pt-8 pb-28 md:pb-12">
        <Header stats={stats} />

        <CategoryRail
          category={category}
          counts={counts}
          onChange={handleCategoryChange}
        />

        <div className="hidden md:block mt-6">
          <InlineAddCard subLabel={subLabel} onAdd={handleAdd} />
        </div>

        <div className="mt-5 md:mt-6">
          {displayList.length === 0 ? (
            <EmptyState
              category={category}
              onAdd={() => setSheet({ mode: 'add' })}
            />
          ) : (
            <div key={category}>
              <LayoutGroup>
                <AnimatePresence initial={false}>
                  <motion.ul
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    className="grid gap-3 md:gap-4 list-none p-0 m-0"
                  >
                    {displayList.map((item, index) => (
                      <RatingCard
                        key={item.id}
                        item={item}
                        rank={index + 1}
                        index={index}
                        category={category}
                        reduceMotion={reduceMotion}
                        expandedPillId={expandedPillId}
                        openMenuOpen={openMenuId === item.id}
                        deleteArmed={deleteArmedId === item.id}
                        onExpandPill={setExpandedPillId}
                        onOpenMenu={() => setOpenMenuId(item.id)}
                        onCloseMenu={() => setOpenMenuId(null)}
                        onArmDelete={() => setDeleteArmedId(item.id)}
                        onDelete={() => handleDelete(item.id)}
                        onEdit={() => {
                          setOpenMenuId(null);
                          setDeleteArmedId(null);
                          setSheet({ mode: 'edit', itemId: item.id });
                        }}
                        onToggleWatched={() => handleToggleWatched(item)}
                        onRatingCommit={handleRatingCommit}
                      />
                    ))}
                  </motion.ul>
                </AnimatePresence>
              </LayoutGroup>
            </div>
          )}
        </div>
      </div>

      {/* Mobile floating add button. */}
      <button
        type="button"
        onClick={() => setSheet({ mode: 'add' })}
        className="md:hidden fixed bottom-5 right-5 z-30 w-14 h-14 rounded-full bg-gradient-gold text-white shadow-[0_12px_32px_rgba(244,63,94,0.35)] flex items-center justify-center focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-200"
        style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
        aria-label="Add new item"
      >
        <Plus className="w-6 h-6" strokeWidth={2.5} />
      </button>

      <AnimatePresence>
        {sheet && (
          <AddSheet
            key={sheet.mode + (sheet.itemId ?? '')}
            mode={sheet.mode}
            category={category}
            subLabel={subLabel}
            initialTitle={editingItem?.title ?? ''}
            onClose={() => setSheet(null)}
            onSubmit={async (data) => {
              if (sheet.mode === 'add') {
                await handleAdd(data);
              } else if (sheet.mode === 'edit' && sheet.itemId) {
                await handleRenameCommit(sheet.itemId, data.title);
              }
              setSheet(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Subcomponents ---------------------------------------------------------

function Header({ stats }) {
  return (
    <motion.header
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="text-center mb-6"
    >
      <div className="flex items-center justify-center gap-2 text-rose-400 mb-1">
        <span className="h-px w-8 bg-rose-300" />
        <span className="font-script text-lg">together</span>
        <span className="h-px w-8 bg-rose-300" />
      </div>
      <h1
        id="ratings-heading"
        className="font-display text-4xl md:text-5xl font-bold text-ink tracking-tight"
      >
        Our Ratings
      </h1>
      <p className="mt-2 text-sm md:text-base text-ink-light">
        {stats.total > 0 ? (
          <>
            <span className="font-semibold text-rose-500">{stats.total}</span>
            {' rated · '}
            <span className="font-semibold text-rose-500">{stats.watched}</span>
            {' watched together'}
          </>
        ) : (
          <span className="font-script text-lg text-rose-400">
            Every bite, binge, and story — scored together
          </span>
        )}
      </p>
    </motion.header>
  );
}

function CategoryRail({ category, counts, onChange }) {
  return (
    <nav
      aria-label="Rating categories"
      className="-mx-4 px-4 flex gap-2 overflow-x-auto snap-x snap-mandatory pb-2 [&::-webkit-scrollbar]:hidden"
      style={{ scrollbarWidth: 'none' }}
    >
      {CATEGORIES.map((cat) => {
        const isActive = category === cat.key;
        const count = counts[cat.key];
        const CatIcon = cat.icon;
        return (
          <button
            key={cat.key}
            type="button"
            onClick={() => onChange(cat.key)}
            aria-pressed={isActive}
            data-rating-interactive
            className={`snap-start shrink-0 min-h-11 px-4 rounded-full flex items-center gap-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2 focus-visible:ring-offset-cream ${
              isActive
                ? 'bg-rose-500 text-white shadow-[0_8px_24px_rgba(244,63,94,0.25)]'
                : 'bg-white text-ink-light hover:bg-blush'
            }`}
          >
            <CatIcon className="w-4 h-4" />
            <span>{cat.label}</span>
            <span
              className={`text-[11px] font-semibold px-1.5 py-0.5 rounded-full ${
                isActive ? 'bg-white/25 text-white' : 'bg-rose-50 text-rose-600'
              }`}
            >
              {count}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

function InlineAddCard({ subLabel, onAdd }) {
  const [title, setTitle] = useState('');
  const [sub, setSub] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    try {
      await onAdd({ title, subCategory: sub });
      setTitle('');
      setSub('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      data-rating-interactive
      className="bg-white rounded-2xl shadow-card p-4 flex flex-wrap items-end gap-3"
    >
      <div className="flex-1 min-w-[200px]">
        <label
          className="block text-xs font-medium text-ink-light mb-1"
          htmlFor="add-title"
        >
          Title
        </label>
        <input
          id="add-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a new item…"
          className="input pl-4"
        />
      </div>
      {subLabel && (
        <div className="flex-1 min-w-[150px]">
          <label
            className="block text-xs font-medium text-ink-light mb-1"
            htmlFor="add-sub"
          >
            {subLabel}
          </label>
          <input
            id="add-sub"
            type="text"
            value={sub}
            onChange={(e) => setSub(e.target.value)}
            placeholder={subLabel}
            className="input pl-4"
          />
        </div>
      )}
      <button
        type="submit"
        disabled={submitting || !title.trim()}
        className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Plus className="w-4 h-4" />
        Add
      </button>
    </form>
  );
}

function RatingCard({
  item,
  rank,
  index,
  category,
  reduceMotion,
  expandedPillId,
  openMenuOpen,
  deleteArmed,
  onExpandPill,
  onOpenMenu,
  onCloseMenu,
  onArmDelete,
  onDelete,
  onEdit,
  onToggleWatched,
  onRatingCommit,
}) {
  const rohitPillId = `${item.id}:rohit`;
  const farhinPillId = `${item.id}:farhin`;
  const mountDelay = reduceMotion ? 0 : Math.min(index, 10) * 0.04;

  return (
    <motion.li
      layout={reduceMotion ? false : 'position'}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0, transition: { delay: mountDelay } }}
      exit={{ opacity: 0, y: -8 }}
      transition={
        reduceMotion
          ? { duration: 0.15 }
          : { type: 'spring', stiffness: 320, damping: 32 }
      }
      data-rating-interactive
      className="relative bg-white rounded-2xl shadow-card p-4 md:p-5"
    >
      <div className="grid grid-cols-[auto_1fr_auto] gap-4 items-start">
        <div className="relative">
          <PosterTile item={item} category={category} />
          <RankBadge rank={rank} />
        </div>

        <div className="min-w-0">
          <h3
            className="font-display text-lg md:text-xl leading-snug text-ink line-clamp-2 break-words"
            title={item.title}
          >
            {item.title}
          </h3>
          {item.subCategory && (
            <span className="inline-block mt-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-rose-50 text-rose-600">
              {item.subCategory}
            </span>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <RatingPill
              label="Rohit"
              value={item.rohitRating}
              itemTitle={item.title}
              expanded={expandedPillId === rohitPillId}
              onExpand={() => onExpandPill(rohitPillId)}
              onCollapse={() => onExpandPill(null)}
              onCommit={(v) => onRatingCommit(item.id, 'rohitRating', v)}
            />
            <RatingPill
              label="Farhin"
              value={item.farhinRating}
              itemTitle={item.title}
              expanded={expandedPillId === farhinPillId}
              onExpand={() => onExpandPill(farhinPillId)}
              onCollapse={() => onExpandPill(null)}
              onCommit={(v) => onRatingCommit(item.id, 'farhinRating', v)}
            />
          </div>
        </div>

        <ActionMenu
          open={openMenuOpen}
          deleteArmed={deleteArmed}
          onOpen={onOpenMenu}
          onClose={onCloseMenu}
          onEdit={onEdit}
          onArmDelete={onArmDelete}
          onConfirmDelete={onDelete}
        />
      </div>

      <div className="mt-3 pt-3 border-t border-blush flex items-center justify-between gap-3">
        <TotalChip value={total(item)} />
        <WatchedToggle watched={item.watched} onToggle={onToggleWatched} />
      </div>
    </motion.li>
  );
}

function PosterTile({ item, category }) {
  const sizeClass = 'w-20 h-28 md:w-24 md:h-32';
  if (POSTER_CATEGORIES.has(category)) {
    return (
      <div
        className={`${sizeClass} rounded-xl overflow-hidden relative shadow-md bg-blush shrink-0`}
      >
        {item.posterUrl ? (
          <>
            <img
              src={item.posterUrl}
              alt=""
              loading="lazy"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
          </>
        ) : (
          <div className="w-full h-full animate-pulse bg-gradient-to-br from-blush to-rose-100" />
        )}
      </div>
    );
  }
  const initial = (item.subCategory?.[0] || item.title[0] || '?').toUpperCase();
  return (
    <div
      className={`${sizeClass} rounded-xl overflow-hidden shrink-0 shadow-md bg-gradient-to-br from-rose-300 via-rose-400 to-gold flex items-center justify-center`}
      aria-hidden="true"
    >
      <span className="font-display text-3xl md:text-4xl text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.3)]">
        {initial}
      </span>
    </div>
  );
}

function RankBadge({ rank }) {
  if (rank <= 3) {
    const palette = {
      1: 'from-gold to-gold-dark text-white',
      2: 'from-rose-300 to-rose-400 text-white',
      3: 'from-rose-200 to-rose-300 text-rose-700',
    };
    const Icon = rank === 1 ? Crown : Award;
    return (
      <div
        className={`absolute -top-2 -left-2 w-8 h-8 rounded-full bg-gradient-to-br ${palette[rank]} flex items-center justify-center shadow-md ${rank === 1 ? 'animate-shimmer' : ''}`}
        aria-label={`Ranked ${rank}`}
      >
        <Icon className="w-4 h-4" strokeWidth={2.5} />
      </div>
    );
  }
  return (
    <div
      className="absolute -top-2 -left-2 w-7 h-7 rounded-full bg-white text-rose-500 text-[11px] font-bold flex items-center justify-center shadow-sm ring-2 ring-rose-100"
      aria-label={`Ranked ${rank}`}
    >
      {rank}
    </div>
  );
}

function RatingPill({
  label,
  value,
  itemTitle,
  expanded,
  onExpand,
  onCollapse,
  onCommit,
}) {
  if (!expanded) {
    return (
      <button
        type="button"
        onClick={onExpand}
        data-rating-interactive
        aria-label={`${label}'s rating for ${itemTitle}, currently ${formatRating(value)} out of ${MAX_RATING}. Activate to edit.`}
        className="h-11 px-4 rounded-full bg-rose-50 text-rose-700 font-medium text-sm tabular-nums flex items-center gap-1.5 hover:bg-rose-100 active:scale-[0.97] transition-[background-color,transform] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
      >
        <span className="text-[10px] uppercase tracking-wide text-rose-400 font-semibold">
          {label}
        </span>
        <span className="text-base font-semibold">{formatRating(value)}</span>
      </button>
    );
  }

  return (
    <ExpandedRatingPill
      label={label}
      value={value}
      itemTitle={itemTitle}
      onCollapse={onCollapse}
      onCommit={onCommit}
    />
  );
}

function ExpandedRatingPill({
  label,
  value,
  itemTitle,
  onCollapse,
  onCommit,
}) {
  // Seeded from the remote value at mount — unmounts on collapse so the
  // next expansion re-seeds from the latest Convex value automatically.
  const [draft, setDraft] = useState(value ?? null);
  const debounceRef = useRef(null);

  const flush = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
  }, []);

  const commit = useCallback(
    (next) => {
      flush();
      if ((next ?? null) === (value ?? null)) return;
      onCommit(next);
    },
    [flush, onCommit, value]
  );

  const scheduleCommit = useCallback(
    (next) => {
      flush();
      debounceRef.current = setTimeout(
        () => commit(next),
        RATING_COMMIT_DEBOUNCE_MS
      );
    },
    [flush, commit]
  );

  // Cleanup any pending commit when the pill unmounts.
  useEffect(() => () => flush(), [flush]);

  const step = (delta) => {
    setDraft((curr) => {
      const next = stepRating(curr, delta);
      scheduleCommit(next);
      return next;
    });
  };

  const setExact = (next) => {
    setDraft(next);
    scheduleCommit(next);
  };

  const handleKey = (e) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      step(0.25);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      step(-0.25);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      step(1);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      step(-1);
    } else if (e.key === 'Home') {
      e.preventDefault();
      setExact(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      setExact(MAX_RATING);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      commit(draft);
      onCollapse();
    }
  };

  const handleBlur = (e) => {
    if (e.currentTarget.contains(e.relatedTarget)) return;
    commit(draft);
    onCollapse();
  };

  return (
    <div
      role="slider"
      tabIndex={0}
      aria-valuemin={0}
      aria-valuemax={MAX_RATING}
      aria-valuenow={draft ?? 0}
      aria-label={`${label}'s rating for ${itemTitle}`}
      onKeyDown={handleKey}
      onBlur={handleBlur}
      data-rating-interactive
      className="h-11 rounded-full bg-white border-2 border-rose-300 shadow-soft flex items-center gap-1 px-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
    >
      <button
        type="button"
        tabIndex={-1}
        onClick={() => step(-0.25)}
        aria-label={`Decrease ${label}'s rating`}
        data-rating-interactive
        className="w-9 h-9 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center hover:bg-rose-200 active:scale-90 transition-transform focus-visible:outline-none"
      >
        <Minus className="w-4 h-4" strokeWidth={3} />
      </button>
      <div className="flex flex-col items-center min-w-[56px] px-1">
        <span className="text-[9px] uppercase tracking-wide text-rose-400 font-semibold leading-none">
          {label}
        </span>
        <span className="font-display text-lg tabular-nums text-ink leading-tight">
          {formatRating(draft)}
        </span>
      </div>
      <button
        type="button"
        tabIndex={-1}
        onClick={() => step(0.25)}
        aria-label={`Increase ${label}'s rating`}
        data-rating-interactive
        className="w-9 h-9 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center hover:bg-rose-200 active:scale-90 transition-transform focus-visible:outline-none"
      >
        <Plus className="w-4 h-4" strokeWidth={3} />
      </button>
    </div>
  );
}

function TotalChip({ value }) {
  return (
    <div className="h-8 px-3 rounded-full bg-gradient-gold text-white flex items-center gap-1.5 shadow-sm">
      <span className="text-[10px] uppercase tracking-wider font-bold opacity-90">
        Total
      </span>
      <span className="font-display text-sm tabular-nums font-bold">
        {formatRating(value)}
        <span className="opacity-70 text-[10px]">/20</span>
      </span>
    </div>
  );
}

function WatchedToggle({ watched, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      data-rating-interactive
      aria-pressed={watched}
      className={`h-9 px-3 rounded-full flex items-center gap-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white ${
        watched
          ? 'bg-rose-500 text-white hover:bg-rose-600'
          : 'bg-blush text-ink-light hover:bg-rose-100'
      }`}
    >
      {watched ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
      {watched ? 'Watched' : 'Not yet'}
    </button>
  );
}

function ActionMenu({
  open,
  deleteArmed,
  onOpen,
  onClose,
  onEdit,
  onArmDelete,
  onConfirmDelete,
}) {
  return (
    <div className="relative shrink-0 -mr-1 -mt-1">
      <button
        type="button"
        onClick={() => (open ? onClose() : onOpen())}
        data-rating-interactive
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Item actions"
        className="w-9 h-9 rounded-full flex items-center justify-center text-ink-lighter hover:text-rose-500 hover:bg-blush focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
      >
        <MoreVertical className="w-5 h-5" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.12 }}
            role="menu"
            data-rating-interactive
            className="absolute right-0 top-full mt-1 min-w-[150px] origin-top-right rounded-xl bg-white shadow-[0_12px_32px_rgba(0,0,0,0.12)] ring-1 ring-rose-100 overflow-hidden z-20"
          >
            <button
              type="button"
              role="menuitem"
              onClick={onEdit}
              data-rating-interactive
              className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-ink hover:bg-blush text-left focus-visible:outline-none focus-visible:bg-blush"
            >
              <Pencil className="w-4 h-4 text-rose-500" />
              Rename
            </button>
            {deleteArmed ? (
              <button
                type="button"
                role="menuitem"
                onClick={onConfirmDelete}
                data-rating-interactive
                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-white bg-rose-500 hover:bg-rose-600 text-left focus-visible:outline-none focus-visible:bg-rose-600"
              >
                <Check className="w-4 h-4" />
                Confirm delete
              </button>
            ) : (
              <button
                type="button"
                role="menuitem"
                onClick={onArmDelete}
                data-rating-interactive
                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-rose-600 hover:bg-rose-50 text-left focus-visible:outline-none focus-visible:bg-rose-50"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AddSheet({
  mode,
  category,
  subLabel,
  initialTitle,
  onClose,
  onSubmit,
}) {
  const [title, setTitle] = useState(initialTitle);
  const [sub, setSub] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const titleRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => titleRef.current?.focus(), 60);
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    return () => {
      clearTimeout(t);
      document.documentElement.style.overflow = prev;
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    try {
      await onSubmit({ title, subCategory: sub });
    } finally {
      setSubmitting(false);
    }
  };

  const heading = mode === 'edit' ? 'Rename item' : `Add ${category}`;
  const hint =
    mode === 'edit' ? 'Update the title below.' : 'A new entry for the list.';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="sheet-heading"
      className="fixed inset-0 z-40 flex items-end md:items-center justify-center"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
      />
      <motion.form
        initial={{ y: '100%', opacity: 0.9 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', stiffness: 320, damping: 34 }}
        data-rating-interactive
        onSubmit={handleSubmit}
        className="relative w-full md:w-[420px] bg-white md:rounded-2xl rounded-t-3xl p-5 md:p-6 shadow-[0_-20px_48px_rgba(0,0,0,0.18)] md:shadow-[0_20px_48px_rgba(0,0,0,0.18)] md:mx-4"
        style={{ paddingBottom: 'calc(1.25rem + env(safe-area-inset-bottom))' }}
      >
        <div className="md:hidden flex justify-center mb-3">
          <div className="w-12 h-1.5 rounded-full bg-rose-200" />
        </div>
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h2
              id="sheet-heading"
              className="font-display text-2xl text-ink leading-tight"
            >
              {heading}
            </h2>
            <p className="text-xs text-ink-lighter mt-0.5">{hint}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            data-rating-interactive
            aria-label="Close"
            className="w-9 h-9 rounded-full bg-blush text-ink-light hover:bg-rose-100 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-3">
          <div>
            <label
              className="block text-xs font-medium text-ink-light mb-1"
              htmlFor="sheet-title"
            >
              Title
            </label>
            <input
              ref={titleRef}
              id="sheet-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={mode === 'edit' ? 'Item title' : 'A new favourite…'}
              className="input pl-4"
              data-rating-interactive
            />
          </div>
          {mode === 'add' && subLabel && (
            <div>
              <label
                className="block text-xs font-medium text-ink-light mb-1"
                htmlFor="sheet-sub"
              >
                {subLabel}
              </label>
              <input
                id="sheet-sub"
                type="text"
                value={sub}
                onChange={(e) => setSub(e.target.value)}
                placeholder={subLabel}
                className="input pl-4"
                data-rating-interactive
              />
            </div>
          )}
        </div>
        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 btn btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || !title.trim()}
            className="flex-[2] btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {mode === 'edit' ? (
              <>
                <Check className="w-4 h-4" />
                Save
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Add item
              </>
            )}
          </button>
        </div>
      </motion.form>
    </div>
  );
}

function EmptyState({ category, onAdd }) {
  const catLabel =
    CATEGORIES.find((c) => c.key === category)?.label.toLowerCase() ?? 'items';
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl bg-white shadow-card p-8 md:p-12 text-center"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-rose-50 via-transparent to-cream pointer-events-none" />
      <div className="relative">
        <div className="mx-auto mb-3 w-14 h-14 rounded-full bg-gradient-gold flex items-center justify-center shadow-md">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <p className="font-script text-2xl text-rose-500">Nothing here yet</p>
        <h3 className="font-display text-xl md:text-2xl text-ink mt-1">
          Start your {catLabel} collection
        </h3>
        <p className="text-sm text-ink-lighter mt-2 max-w-xs mx-auto">
          Add the first item and start scoring it together — every taste counts.
        </p>
        <button
          type="button"
          onClick={onAdd}
          className="mt-5 btn btn-primary md:hidden"
        >
          <Plus className="w-4 h-4" />
          Add the first one
        </button>
      </div>
    </motion.div>
  );
}
