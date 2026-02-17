import { Heart } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MemoryLaneTeaser({ onOpen }) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onOpen}
      className="card p-6 w-full text-left cursor-pointer animate-shimmer"
    >
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-xl bg-rose-100">
          <Heart className="w-6 h-6 text-rose-500 fill-rose-500 animate-heartbeat" />
        </div>
        <div>
          <h3 className="font-display text-lg font-semibold text-ink">Valentine&apos;s Day</h3>
          <p className="text-sm text-ink-lighter">Tap to open</p>
        </div>
      </div>
    </motion.button>
  );
}
