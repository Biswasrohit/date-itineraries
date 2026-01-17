import { useState, useEffect, useRef } from 'react';
import { MessageCircleHeart, Send, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { format } from 'date-fns';

export default function LoveNotesPage() {
  const [notes, setNotes] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [senderName, setSenderName] = useState(localStorage.getItem('loveNoteName') || '');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const q = query(collection(db, 'loveNotes'), orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date()
      }));
      setNotes(data);
    }, (error) => {
      console.error('Error fetching notes:', error);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [notes]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !senderName.trim()) return;

    // Save name to localStorage
    localStorage.setItem('loveNoteName', senderName);

    setLoading(true);
    try {
      await addDoc(collection(db, 'loveNotes'), {
        fromName: senderName.trim(),
        message: newMessage.trim(),
        createdAt: serverTimestamp()
      });
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send note:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (date) => {
    if (!date) return '';
    return format(new Date(date), 'MMM d, h:mm a');
  };

  return (
    <div className="min-h-screen bg-gradient-romantic flex flex-col">
      <div className="max-w-2xl mx-auto px-4 py-8 flex-1 flex flex-col w-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="font-display text-4xl font-bold text-ink mb-2">Love Notes</h1>
          <p className="font-script text-xl text-rose-400">Little messages of love</p>
        </motion.div>

        {/* Messages Container */}
        <div className="card flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {notes.length === 0 ? (
              <div className="text-center py-12">
                <MessageCircleHeart className="w-16 h-16 text-rose-200 mx-auto mb-4" />
                <h3 className="font-display text-lg font-semibold text-ink mb-2">No notes yet</h3>
                <p className="text-ink-lighter">Send the first love note!</p>
              </div>
            ) : (
              <AnimatePresence>
                {notes.map((note, index) => {
                  const isOwnMessage = note.fromName === senderName;

                  return (
                    <motion.div
                      key={note.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] ${
                          isOwnMessage
                            ? 'bg-rose-500 text-white rounded-2xl rounded-br-md'
                            : 'bg-blush text-ink rounded-2xl rounded-bl-md'
                        } p-4`}
                      >
                        {/* Sender Name */}
                        <p className={`text-xs font-medium mb-1 ${
                          isOwnMessage ? 'text-rose-200' : 'text-rose-600'
                        }`}>
                          {note.fromName}
                        </p>

                        {/* Message */}
                        <p className="font-script text-lg leading-relaxed whitespace-pre-wrap">
                          {note.message}
                        </p>

                        {/* Timestamp */}
                        <p className={`text-xs mt-2 ${
                          isOwnMessage ? 'text-rose-200' : 'text-ink-lighter'
                        }`}>
                          {formatTimestamp(note.createdAt)}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <form onSubmit={handleSend} className="p-4 border-t border-blush">
            <div className="flex gap-3 mb-3">
              <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="Your name..."
                className="input pl-4 w-40 text-sm"
              />
            </div>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Write a love note..."
                  className="input pl-4 pr-12 font-script text-lg"
                />
                <Heart className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-rose-300" />
              </div>
              <button
                type="submit"
                disabled={loading || !newMessage.trim() || !senderName.trim()}
                className="btn btn-primary"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>

        {/* Decorative Elements */}
        <div className="mt-8 text-center">
          <p className="font-script text-rose-300 text-lg">
            "A simple love note can make someone's whole day"
          </p>
        </div>
      </div>
    </div>
  );
}
