import { Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCountdown } from '../../hooks/useCountdown';

export default function Countdown({ targetDate, title }) {
  const { days, hours, minutes, seconds, isPast } = useCountdown(targetDate);

  if (isPast) {
    return (
      <div className="text-center py-8">
        <p className="font-script text-2xl text-rose-500">It's date day!</p>
        <Heart className="w-12 h-12 text-rose-500 fill-rose-500 mx-auto mt-4 animate-heartbeat" />
      </div>
    );
  }

  const timeUnits = [
    { value: days, label: 'Days' },
    { value: hours, label: 'Hours' },
    { value: minutes, label: 'Minutes' },
    { value: seconds, label: 'Seconds' },
  ];

  return (
    <div className="text-center">
      {title && (
        <p className="font-script text-xl text-rose-400 mb-4">{title}</p>
      )}

      <div className="flex justify-center gap-4 md:gap-6">
        {timeUnits.map((unit, index) => (
          <motion.div
            key={unit.label}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            className="flex flex-col items-center"
          >
            <div className="bg-white rounded-2xl shadow-soft p-4 md:p-6 min-w-[70px] md:min-w-[90px]">
              <motion.span
                key={unit.value}
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="font-display text-3xl md:text-5xl font-bold text-rose-500"
              >
                {String(unit.value).padStart(2, '0')}
              </motion.span>
            </div>
            <span className="text-ink-lighter text-xs md:text-sm mt-2 uppercase tracking-wider">
              {unit.label}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
