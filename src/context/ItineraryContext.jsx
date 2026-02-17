import { createContext, useContext, useCallback } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';

const ItineraryContext = createContext();

export function useItinerary() {
  return useContext(ItineraryContext);
}

export function ItineraryProvider({ children }) {
  const rawItineraries = useQuery(api.itineraries.list);
  const itineraries = rawItineraries ?? [];
  const loading = rawItineraries === undefined;

  const createMutation = useMutation(api.itineraries.create);
  const updateMutation = useMutation(api.itineraries.update);
  const removeMutation = useMutation(api.itineraries.remove);
  // Create new itinerary
  const createItinerary = useCallback(async (itineraryData) => {
    const id = await createMutation({
      title: itineraryData.title,
      date: itineraryData.date instanceof Date ? itineraryData.date.getTime() : itineraryData.date,
      description: itineraryData.description,
      activities: itineraryData.activities || [],
      travelSegments: itineraryData.travelSegments || [],
      keyLocations: itineraryData.keyLocations || [],
      budget: itineraryData.budget,
    });
    return id;
  }, [createMutation]);

  // Update itinerary
  const updateItinerary = useCallback(async (id, updates) => {
    await updateMutation({ id, updates });
  }, [updateMutation]);

  // Delete itinerary
  const deleteItinerary = useCallback(async (id) => {
    await removeMutation({ id });
  }, [removeMutation]);

  // Add activity to itinerary
  const addActivity = useCallback(async (itineraryId, activity) => {
    const itinerary = itineraries.find(i => i.id === itineraryId);
    if (!itinerary) return;

    const newActivity = {
      id: crypto.randomUUID(),
      ...activity,
      completed: false,
      order: itinerary.activities.length,
    };

    await updateMutation({
      id: itineraryId,
      updates: { activities: [...itinerary.activities, newActivity] },
    });
  }, [itineraries, updateMutation]);

  // Update activity
  const updateActivity = useCallback(async (itineraryId, activityId, updates) => {
    const itinerary = itineraries.find(i => i.id === itineraryId);
    if (!itinerary) return;

    const updatedActivities = itinerary.activities.map(a =>
      a.id === activityId ? { ...a, ...updates } : a
    );

    await updateMutation({
      id: itineraryId,
      updates: { activities: updatedActivities },
    });
  }, [itineraries, updateMutation]);

  // Delete activity
  const deleteActivity = useCallback(async (itineraryId, activityId) => {
    const itinerary = itineraries.find(i => i.id === itineraryId);
    if (!itinerary) return;

    const updatedActivities = itinerary.activities
      .filter(a => a.id !== activityId)
      .map((a, index) => ({ ...a, order: index }));

    await updateMutation({
      id: itineraryId,
      updates: { activities: updatedActivities },
    });
  }, [itineraries, updateMutation]);

  // Reorder activities
  const reorderActivities = useCallback(async (itineraryId, newOrder) => {
    const itinerary = itineraries.find(i => i.id === itineraryId);
    if (!itinerary) return;

    const reorderedActivities = newOrder.map((id, index) => {
      const activity = itinerary.activities.find(a => a.id === id);
      return { ...activity, order: index };
    });

    await updateMutation({
      id: itineraryId,
      updates: { activities: reorderedActivities },
    });
  }, [itineraries, updateMutation]);

  // Mark itinerary as completed
  const markAsCompleted = useCallback(async (id) => {
    await updateMutation({
      id,
      updates: { status: 'completed' },
    });
  }, [updateMutation]);

  // Add memories to itinerary
  const addMemories = useCallback(async (itineraryId, memories) => {
    await updateMutation({
      id: itineraryId,
      updates: { memories },
    });
  }, [updateMutation]);

  // Get upcoming itineraries
  const getUpcoming = useCallback(() => {
    return itineraries.filter(i => i.status === 'upcoming');
  }, [itineraries]);

  // Get completed itineraries
  const getCompleted = useCallback(() => {
    return itineraries.filter(i => i.status === 'completed');
  }, [itineraries]);

  // Get next upcoming date
  const getNextDate = useCallback(() => {
    const upcoming = getUpcoming()
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    return upcoming[0] || null;
  }, [getUpcoming]);

  // Get itinerary by ID
  const getItineraryById = useCallback((id) => {
    return itineraries.find(i => i.id === id);
  }, [itineraries]);

  const value = {
    itineraries,
    loading,
    createItinerary,
    updateItinerary,
    deleteItinerary,
    addActivity,
    updateActivity,
    deleteActivity,
    reorderActivities,
    markAsCompleted,
    addMemories,
    getUpcoming,
    getCompleted,
    getNextDate,
    getItineraryById,
  };

  return (
    <ItineraryContext.Provider value={value}>
      {children}
    </ItineraryContext.Provider>
  );
}
