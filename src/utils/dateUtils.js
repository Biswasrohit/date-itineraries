import { format, formatDistanceToNow, isToday, isTomorrow, isPast, isFuture } from 'date-fns';

// Format date for display
export function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  return format(d, 'EEEE, MMMM d, yyyy');
}

// Format date short
export function formatDateShort(date) {
  if (!date) return '';
  const d = new Date(date);
  return format(d, 'MMM d, yyyy');
}

// Format time (24h to 12h)
export function formatTime(time) {
  if (!time) return '';
  const [hours, minutes] = time.split(':');
  const h = parseInt(hours);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
}

// Format time range
export function formatTimeRange(startTime, endTime) {
  if (!startTime) return '';
  if (!endTime) return formatTime(startTime);
  return `${formatTime(startTime)} - ${formatTime(endTime)}`;
}

// Get relative date label
export function getRelativeDate(date) {
  if (!date) return '';
  const d = new Date(date);

  if (isToday(d)) return 'Today';
  if (isTomorrow(d)) return 'Tomorrow';

  if (isFuture(d)) {
    return `in ${formatDistanceToNow(d)}`;
  }

  return formatDistanceToNow(d, { addSuffix: true });
}

// Check if date is upcoming
export function isUpcoming(date) {
  if (!date) return false;
  return isFuture(new Date(date)) || isToday(new Date(date));
}

// Calculate duration between times
export function calculateDuration(startTime, endTime) {
  if (!startTime || !endTime) return '';

  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);

  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  const diffMinutes = endMinutes - startMinutes;

  if (diffMinutes < 60) {
    return `${diffMinutes} min`;
  }

  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;

  if (minutes === 0) {
    return `${hours} hr`;
  }

  return `${hours} hr ${minutes} min`;
}
