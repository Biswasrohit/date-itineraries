import { format, formatDistanceToNow, isToday, isTomorrow, isPast, isFuture } from 'date-fns';

// Create a date at midnight in local timezone (not UTC)
// Fixes timezone issues where dates shift by a day
export function createLocalDate(dateString) {
  if (!dateString) return new Date();
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day); // month is 0-indexed
}

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

// Generate Google Calendar link for itinerary
export function generateGoogleCalendarLink(itinerary) {
  if (!itinerary) return '';

  const date = new Date(itinerary.date);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;

  // Find earliest start time and latest end time from activities
  let startTime = '09:00'; // Default start time
  let endTime = '21:00';   // Default end time

  if (itinerary.activities && itinerary.activities.length > 0) {
    const sortedActivities = [...itinerary.activities].sort((a, b) => a.order - b.order);

    // Get earliest start time
    const firstActivity = sortedActivities.find(a => a.startTime);
    if (firstActivity?.startTime) {
      startTime = firstActivity.startTime;
    }

    // Get latest end time
    const lastActivity = sortedActivities[sortedActivities.length - 1];
    if (lastActivity?.endTime) {
      endTime = lastActivity.endTime;
    } else if (lastActivity?.startTime) {
      // If no end time, use start time + 1 hour
      const [h, m] = lastActivity.startTime.split(':').map(Number);
      endTime = `${String(h + 1).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    }
  }

  // Format times as HHmmss for Google Calendar
  const startTimeFormatted = startTime.replace(':', '') + '00';
  const endTimeFormatted = endTime.replace(':', '') + '00';

  // Create timed event: YYYYMMDDTHHmmss/YYYYMMDDTHHmmss
  const dates = `${dateStr}T${startTimeFormatted}/${dateStr}T${endTimeFormatted}`;

  // Build description with activities (using actual newlines)
  let description = '';
  if (itinerary.description) {
    description += itinerary.description + '\n\n';
  }

  description += 'ITINERARY:\n';

  if (itinerary.activities && itinerary.activities.length > 0) {
    const sortedActivities = [...itinerary.activities].sort((a, b) => a.order - b.order);
    sortedActivities.forEach(activity => {
      const timeStr = activity.startTime ? `${activity.startTime}` : '';
      description += `\n${timeStr ? timeStr + ' - ' : ''}${activity.title}`;
      if (activity.location?.name) {
        description += ` (${activity.location.name})`;
      }
    });
  }

  if (itinerary.budget?.estimated?.total) {
    description += `\n\nEstimated Budget: $${itinerary.budget.estimated.total}`;
  }

  // Build location string from key locations
  let location = '';
  if (itinerary.keyLocations && itinerary.keyLocations.length > 0) {
    location = itinerary.keyLocations
      .map(loc => loc.name)
      .filter(Boolean)
      .join(', ');
  }

  // Encode URI components
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: itinerary.title,
    dates: dates,
    details: description,
  });

  if (location) {
    params.append('location', location);
  }

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
