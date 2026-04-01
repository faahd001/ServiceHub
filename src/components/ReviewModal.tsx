import React, { useState } from 'react';
import { Star, X, Loader2 } from 'lucide-react';
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../components/AuthContext';
import Button from './ui/Button';
import Input from './ui/Input';
import { cn } from '../lib/utils';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  providerId: string;
}

export default function ReviewModal({ isOpen, onClose, bookingId, providerId }: ReviewModalProps) {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || rating === 0) return;

    setLoading(true);
    try {
      // Add review
      await addDoc(collection(db, 'reviews'), {
        customerId: user.uid,
        providerId,
        bookingId,
        rating,
        comment,
        createdAt: new Date().toISOString()
      });

      // Update provider rating
      const providerRef = doc(db, 'providers', providerId);
      // This is a simplified rating update. In a real app, you'd recalculate the average.
      // For now, we'll just increment totalReviews.
      await updateDoc(providerRef, {
        totalReviews: increment(1)
      });

      // Update booking to show it's been reviewed
      await updateDoc(doc(db, 'bookings', bookingId), {
        reviewed: true
      });

      onClose();
    } catch (error) {
      console.error("Error submitting review:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-gray-50 dark:border-gray-800 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Rate your experience</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="flex flex-col items-center gap-4">
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={cn(
                      "w-10 h-10 transition-colors",
                      (hover || rating) >= star
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-200 dark:text-gray-700"
                    )}
                  />
                </button>
              ))}
            </div>
            <p className="text-sm font-medium text-gray-500">
              {rating === 0 ? "Select a rating" : `${rating} out of 5 stars`}
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Your feedback</label>
            <textarea
              className="w-full h-32 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-gray-900 dark:text-white resize-none"
              placeholder="Tell us about the service..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full h-12 rounded-xl text-lg" isLoading={loading} disabled={rating === 0}>
            Submit Review
          </Button>
        </form>
      </div>
    </div>
  );
}
