import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../services/firebase';

const ItineraryContext = createContext();

export function useItinerary() {
  return useContext(ItineraryContext);
}

export function ItineraryProvider({ children }) {
  const [itineraries, setItineraries] = useState([]);
  const [loading, setLoading] = useState(true);

  // Subscribe to itineraries collection
  useEffect(() => {
    const q = query(
      collection(db, 'itineraries'),
      orderBy('date', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const itineraryData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Convert Firestore timestamp to Date
        date: doc.data().date?.toDate?.() || new Date(doc.data().date)
      }));
      setItineraries(itineraryData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching itineraries:', error);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Create new itinerary
  const createItinerary = useCallback(async (itineraryData) => {
    const newItinerary = {
      ...itineraryData,
      status: 'upcoming',
      activities: itineraryData.activities || [],
      travelSegments: itineraryData.travelSegments || [],
      keyLocations: itineraryData.keyLocations || [],
      budget: itineraryData.budget || { estimated: { total: 0, breakdown: '' }, actual: { total: null, breakdown: null } },
      memories: { photos: [], reflection: '', favoriteMemory: '', rating: null },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, 'itineraries'), newItinerary);
    return docRef.id;
  }, []);

  // Update itinerary
  const updateItinerary = useCallback(async (id, updates) => {
    await updateDoc(doc(db, 'itineraries', id), {
      ...updates,
      updatedAt: serverTimestamp()
    });
  }, []);

  // Delete itinerary
  const deleteItinerary = useCallback(async (id) => {
    await deleteDoc(doc(db, 'itineraries', id));
  }, []);

  // Add activity to itinerary
  const addActivity = useCallback(async (itineraryId, activity) => {
    const itinerary = itineraries.find(i => i.id === itineraryId);
    if (!itinerary) return;

    const newActivity = {
      id: crypto.randomUUID(),
      ...activity,
      completed: false,
      order: itinerary.activities.length
    };

    await updateDoc(doc(db, 'itineraries', itineraryId), {
      activities: [...itinerary.activities, newActivity],
      updatedAt: serverTimestamp()
    });
  }, [itineraries]);

  // Update activity
  const updateActivity = useCallback(async (itineraryId, activityId, updates) => {
    const itinerary = itineraries.find(i => i.id === itineraryId);
    if (!itinerary) return;

    const updatedActivities = itinerary.activities.map(a =>
      a.id === activityId ? { ...a, ...updates } : a
    );

    await updateDoc(doc(db, 'itineraries', itineraryId), {
      activities: updatedActivities,
      updatedAt: serverTimestamp()
    });
  }, [itineraries]);

  // Delete activity
  const deleteActivity = useCallback(async (itineraryId, activityId) => {
    const itinerary = itineraries.find(i => i.id === itineraryId);
    if (!itinerary) return;

    const updatedActivities = itinerary.activities
      .filter(a => a.id !== activityId)
      .map((a, index) => ({ ...a, order: index }));

    await updateDoc(doc(db, 'itineraries', itineraryId), {
      activities: updatedActivities,
      updatedAt: serverTimestamp()
    });
  }, [itineraries]);

  // Reorder activities
  const reorderActivities = useCallback(async (itineraryId, newOrder) => {
    const itinerary = itineraries.find(i => i.id === itineraryId);
    if (!itinerary) return;

    const reorderedActivities = newOrder.map((id, index) => {
      const activity = itinerary.activities.find(a => a.id === id);
      return { ...activity, order: index };
    });

    await updateDoc(doc(db, 'itineraries', itineraryId), {
      activities: reorderedActivities,
      updatedAt: serverTimestamp()
    });
  }, [itineraries]);

  // Mark itinerary as completed
  const markAsCompleted = useCallback(async (id) => {
    await updateDoc(doc(db, 'itineraries', id), {
      status: 'completed',
      updatedAt: serverTimestamp()
    });
  }, []);

  // Add memories to itinerary
  const addMemories = useCallback(async (itineraryId, memories) => {
    await updateDoc(doc(db, 'itineraries', itineraryId), {
      memories,
      updatedAt: serverTimestamp()
    });
  }, []);

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
    getItineraryById
  };

  return (
    <ItineraryContext.Provider value={value}>
      {children}
    </ItineraryContext.Provider>
  );
}
