import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, onSnapshot, orderBy, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../components/AuthContext';
import { Booking, ProviderProfile, UserProfile } from '../types';
import { Calendar, Clock, CheckCircle2, XCircle, MessageSquare, Star } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../lib/utils';
import Button from '../components/ui/Button';
import ReviewModal from '../components/ReviewModal';

export default function CustomerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'bookings'),
      where('customerId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setBookings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking)));
      setLoading(false);
    }, (error) => {
      console.error("Error fetching bookings:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleReviewClick = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsReviewModalOpen(true);
  };

  const handleChatClick = async (providerId: string) => {
    if (!user) return;
    try {
      const q = query(
        collection(db, 'chatRooms'),
        where('participants', 'array-contains', user.uid)
      );
      const snapshot = await getDocs(q);
      let roomId = '';
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.participants.includes(providerId)) {
          roomId = doc.id;
        }
      });

      if (!roomId) {
        const roomDoc = await addDoc(collection(db, 'chatRooms'), {
          participants: [user.uid, providerId],
          createdAt: new Date().toISOString(),
          lastMessage: '',
          lastMessageTimestamp: new Date().toISOString()
        });
        roomId = roomDoc.id;
      }
      navigate(`/chat/${roomId}`);
    } catch (error) {
      console.error("Error initiating chat:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-50 text-yellow-700 border-yellow-100';
      case 'ongoing': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'completed': return 'bg-green-50 text-green-700 border-green-100';
      case 'cancelled': return 'bg-red-50 text-red-700 border-red-100';
      default: return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900">Customer Dashboard</h1>
        <p className="text-gray-500 mt-2">Manage your service requests and bookings</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="text-gray-500 text-sm font-medium mb-1">Total Bookings</div>
          <div className="text-3xl font-bold text-gray-900">{bookings.length}</div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="text-gray-500 text-sm font-medium mb-1">Active Requests</div>
          <div className="text-3xl font-bold text-blue-600">
            {bookings.filter(b => ['pending', 'ongoing'].includes(b.status)).length}
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="text-gray-500 text-sm font-medium mb-1">Completed Jobs</div>
          <div className="text-3xl font-bold text-green-600">
            {bookings.filter(b => b.status === 'completed').length}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Recent Bookings</h2>
          <Button variant="ghost" size="sm">View All</Button>
        </div>
        
        <div className="divide-y divide-gray-50">
          {bookings.length > 0 ? bookings.map((booking) => (
            <div key={booking.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-gray-50/50 transition-colors">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Service Request #{booking.id.slice(-6)}</h3>
                  <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {format(new Date(booking.date), 'MMM d, yyyy • h:mm a')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <span className={cn(
                  "px-3 py-1 rounded-full text-xs font-bold border",
                  getStatusColor(booking.status)
                )}>
                  {booking.status.toUpperCase()}
                </span>
                
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-2"
                    onClick={() => handleChatClick(booking.providerId)}
                  >
                    <MessageSquare className="w-4 h-4" />
                    Chat
                  </Button>
                  {booking.status === 'completed' && !booking.reviewed && (
                    <Button 
                      variant="primary" 
                      size="sm" 
                      className="gap-2"
                      onClick={() => handleReviewClick(booking)}
                    >
                      <Star className="w-4 h-4" />
                      Review
                    </Button>
                  )}
                  {booking.status === 'pending' && (
                    <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50">
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )) : (
            <div className="p-12 text-center text-gray-500">
              <p>You haven't made any bookings yet.</p>
              <Button variant="outline" className="mt-4" onClick={() => window.location.href = '/search'}>
                Find a Service
              </Button>
            </div>
          )}
        </div>
      </div>

      {selectedBooking && (
        <ReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          bookingId={selectedBooking.id}
          providerId={selectedBooking.providerId}
        />
      )}
    </div>
  );
}
