import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

const COLORS = ['#f43f5e', '#D4AF37', '#F8EDEE', '#fb7185', '#fda4af'];

function fireConfetti() {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: COLORS,
  });

  setTimeout(() => {
    confetti({
      particleCount: 50,
      spread: 120,
      origin: { x: 0.2, y: 0.5 },
      colors: COLORS,
    });
  }, 200);

  setTimeout(() => {
    confetti({
      particleCount: 50,
      spread: 120,
      origin: { x: 0.8, y: 0.5 },
      colors: COLORS,
    });
  }, 400);

  setTimeout(() => {
    confetti({
      particleCount: 80,
      spread: 100,
      origin: { y: 0.7 },
      colors: COLORS,
    });
  }, 700);
}

// Floating heart background element
function FloatingHeart({ delay, x, size, duration }) {
  return (
    <div
      className="absolute text-rose-200 pointer-events-none animate-float-heart"
      style={{
        left: `${x}%`,
        bottom: '-20px',
        fontSize: `${size}px`,
        '--duration': `${duration}s`,
        '--delay': `${delay}s`,
        opacity: 0,
      }}
    >
      <Heart className="fill-current" style={{ width: size, height: size }} />
    </div>
  );
}

export default function ValentineAskPage({ onAccept, hasAccepted }) {
  const [showMessage, setShowMessage] = useState(hasAccepted);

  const handleYes = () => {
    fireConfetti();
    localStorage.setItem('valentines-2026-accepted', 'true');
    onAccept?.();
    setTimeout(() => setShowMessage(true), 600);
  };

  // Fire confetti again if revisiting after acceptance
  useEffect(() => {
    if (hasAccepted) {
      const timer = setTimeout(() => fireConfetti(), 500);
      return () => clearTimeout(timer);
    }
  }, [hasAccepted]);

  const floatingHearts = Array.from({ length: 10 }, (_, i) => ({
    delay: i * 0.6,
    x: 5 + (i * 37 + 13) % 90,
    size: 14 + (i % 4) * 6,
    duration: 3.5 + (i % 3) * 1.5,
  }));

  return (
    <div className="scrapbook-page relative flex flex-col items-center justify-center min-h-full px-6 py-10 overflow-hidden">
      {/* Floating hearts background */}
      {showMessage && floatingHearts.map((props, i) => (
        <FloatingHeart key={i} {...props} />
      ))}

      <AnimatePresence mode="wait">
        {!showMessage ? (
          /* ═══════════════════════════════════════ */
          /* THE VALENTINE'S ASK                     */
          /* ═══════════════════════════════════════ */
          <motion.div
            key="ask"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center text-center"
          >
            {/* Decorative hearts */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-2 mb-8"
            >
              <Heart className="w-4 h-4 text-rose-300 fill-rose-300" />
              <Heart className="w-6 h-6 text-rose-400 fill-rose-400" />
              <Heart className="w-4 h-4 text-rose-300 fill-rose-300" />
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="font-display text-xl text-gold font-semibold mb-8"
            >
              One Last Thing...
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="font-script text-3xl md:text-4xl text-ink leading-snug mb-12"
            >
              Will you be my<br />Valentine?
            </motion.p>

            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7, type: 'spring', stiffness: 200 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleYes}
              className="bg-gradient-to-r from-rose-400 to-rose-500 text-white px-10 py-4 rounded-full font-display text-lg font-semibold shadow-lg shadow-rose-200/50 flex items-center gap-2 animate-heartbeat"
            >
              <Heart className="w-5 h-5 fill-white" />
              Yes!
            </motion.button>
          </motion.div>
        ) : (
          /* ═══════════════════════════════════════════════ */
          /* AFTER ACCEPTANCE — CUSTOMIZE YOUR MESSAGE HERE */
          /* ═══════════════════════════════════════════════ */
          <motion.div
            key="accepted"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center text-center relative z-10"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            >
              <Heart className="w-16 h-16 text-gold fill-gold mb-6" />
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="font-display text-2xl md:text-3xl font-bold text-ink mb-6"
            >
              She Said Yes!
            </motion.h2>

            {/* ═══════════════════════════════════════════════ */}
            {/* CUSTOMIZE YOUR VALENTINE'S MESSAGE BELOW       */}
            {/* Change the text between the <p> tags to your   */}
            {/* own personal message for her                   */}
            {/* ═══════════════════════════════════════════════ */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="font-script text-xl md:text-2xl text-ink-light leading-relaxed max-w-sm"
            >
              I hope you know how much I appreciate you. The way you
              show up, the way you care, the way you make even the
              smallest moments feel meaningful. I see everything you
              do, even the things you think go unnoticed. I&apos;m so
              lucky to love you and to be loved by you. Happy
              Valentine&apos;s Day.
            </motion.p>
            {/* ═══════════════════════════════════════════════ */}

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="flex items-center gap-1 mt-8"
            >
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.9 + i * 0.1, type: 'spring' }}
                >
                  <Heart className="w-5 h-5 text-rose-400 fill-rose-400" />
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
