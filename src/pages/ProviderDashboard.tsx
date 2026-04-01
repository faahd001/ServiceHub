import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../components/AuthContext';
import { useNotifications } from '../components/NotificationContext';
import { Booking, ProviderProfile } from '../types';
import { Calendar, Clock, CheckCircle2, XCircle, MessageSquare, Briefcase, Settings } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../lib/utils';
import Button from '../components/ui/Button';

export default function ProviderDashboard() {
  const { user, profile } = useAuth();
  const { sendNotification } = useNotifications();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [providerData, setProviderData] = useState<ProviderProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    // Fetch provider specific data
    const providerUnsubscribe = onSnapshot(doc(db, 'providers', user.uid), (doc) => {
      if (doc.exists()) {
        setProviderData({ id: doc.id, ...doc.data() } as ProviderProfile);
      }
    });

    const q = query(
      collection(db, 'bookings'),
      where('providerId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const bookingsUnsubscribe = onSnapshot(q, (snapshot) => {
      setBookings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking)));
      setLoading(false);
    }, (error) => {
      console.error("Error fetching bookings:", error);
      setLoading(false);
    });

    return () => {
      providerUnsubscribe();
      bookingsUnsubscribe();
    };
  }, [user]);

  const filteredBookings = bookings.filter(b => {
    if (filter === 'all') return true;
    return b.status === filter;
  });

  const handleStatusUpdate = async (bookingId: string, newStatus: string) => {
    try {
      const booking = bookings.find(b => b.id === bookingId);
      await updateDoc(doc(db, 'bookings', bookingId), { status: newStatus });
      
      if (booking) {
        await sendNotification({
          userId: booking.customerId,
          type: 'booking_status',
          title: 'Booking Status Updated',
          message: `Your booking #${bookingId.slice(-6)} has been marked as ${newStatus}.`,
          link: '/dashboard'
        });
      }
    } catch (error) {
      console.error("Error updating booking status:", error);
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
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Provider Dashboard</h1>
          <p className="text-gray-500 mt-2">Manage your jobs, profile, and earnings</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Settings className="w-4 h-4" />
          Profile Settings
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="text-gray-500 text-sm font-medium mb-1">New Requests</div>
          <div className="text-3xl font-bold text-yellow-600">
            {bookings.filter(b => b.status === 'pending').length}
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="text-gray-500 text-sm font-medium mb-1">Ongoing Jobs</div>
          <div className="text-3xl font-bold text-blue-600">
            {bookings.filter(b => b.status === 'ongoing').length}
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="text-gray-500 text-sm font-medium mb-1">Completed</div>
          <div className="text-3xl font-bold text-green-600">
            {bookings.filter(b => b.status === 'completed').length}
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="text-gray-500 text-sm font-medium mb-1">Cancelled</div>
          <div className="text-3xl font-bold text-red-600">
            {bookings.filter(b => b.status === 'cancelled').length}
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="text-gray-500 text-sm font-medium mb-1">Rating</div>
          <div className="text-3xl font-bold text-gray-900">
            {providerData?.rating.toFixed(1) || "0.0"}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Job Requests</h2>
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setFilter('all')}
              className={cn(filter === 'all' && "bg-blue-50 text-blue-600")}
            >
              All
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setFilter('pending')}
              className={cn(filter === 'pending' && "bg-yellow-50 text-yellow-600")}
            >
              Pending
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setFilter('ongoing')}
              className={cn(filter === 'ongoing' && "bg-blue-50 text-blue-600")}
            >
              Ongoing
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setFilter('completed')}
              className={cn(filter === 'completed' && "bg-green-50 text-green-600")}
            >
              Completed
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setFilter('cancelled')}
              className={cn(filter === 'cancelled' && "bg-red-50 text-red-600")}
            >
              Cancelled
            </Button>
          </div>
        </div>
        
        <div className="divide-y divide-gray-50">
          {filteredBookings.length > 0 ? filteredBookings.map((booking) => (
            <div key={booking.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-gray-50/50 transition-colors">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                  <Briefcase className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Job #{booking.id.slice(-6)}</h3>
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
                  <Button variant="outline" size="sm" className="gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Chat
                  </Button>
                  
                  {booking.status === 'pending' && (
                    <>
                      <Button 
                        variant="primary" 
                        size="sm" 
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleStatusUpdate(booking.id, 'ongoing')}
                      >
                        Accept
                      </Button>
                      <Button 
                        variant="danger" 
                        size="sm"
                        onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
                      >
                        Reject
                      </Button>
                    </>
                  )}
                  
                  {booking.status === 'ongoing' && (
                    <Button 
                      variant="primary" 
                      size="sm" 
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => handleStatusUpdate(booking.id, 'completed')}
                    >
                      Mark Completed
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )) : (
            <div className="p-12 text-center text-gray-500">
              <p>No job requests found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
