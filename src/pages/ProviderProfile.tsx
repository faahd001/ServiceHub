import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { ProviderProfile, UserProfile, Service, Review } from '../types';
import { Star, MapPin, Briefcase, Calendar, MessageSquare, ShieldCheck, Loader2, Phone, CheckCircle2 } from 'lucide-react';
import Button from '../components/ui/Button';
import { useAuth } from '../components/AuthContext';
import { useNotifications } from '../components/NotificationContext';
import { format } from 'date-fns';
import { cn } from '../lib/utils';

export default function ProviderProfilePage() {
  const { id } = useParams();
  const { user, profile } = useAuth();
  const { sendNotification } = useNotifications();
  const navigate = useNavigate();
  
  const [provider, setProvider] = useState<ProviderProfile | null>(null);
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const handleBookNow = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!id || !provider) return;

    setBookingLoading(true);
    try {
      const bookingData = {
        customerId: user.uid,
        providerId: id,
        serviceId: services[0]?.id || 'general',
        status: 'pending',
        date: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
        createdAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, 'bookings'), bookingData);

      // Send notification to provider
      await sendNotification({
        userId: provider.userId,
        type: 'booking_request',
        title: 'New Booking Request',
        message: `${profile?.name || 'A customer'} has requested a booking for your services.`,
        link: '/dashboard'
      });

      setBookingSuccess(true);
      setTimeout(() => setBookingSuccess(false), 5000);
    } catch (error) {
      console.error("Error creating booking:", error);
    } finally {
      setBookingLoading(false);
    }
  };

  const handleWhatsAppClick = () => {
    if (userData?.phone) {
      const formattedPhone = userData.phone.replace(/\D/g, '');
      window.open(`https://wa.me/${formattedPhone}`, '_blank');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const providerDoc = await getDoc(doc(db, 'providers', id));
        if (providerDoc.exists()) {
          const pData = { id: providerDoc.id, ...providerDoc.data() } as ProviderProfile;
          setProvider(pData);
          
          const userDoc = await getDoc(doc(db, 'users', pData.userId));
          setUserData({ id: userDoc.id, ...userDoc.data() } as UserProfile);
          
          const servicesSnapshot = await getDocs(query(collection(db, 'services'), where('providerId', '==', id)));
          setServices(servicesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Service)));
          
          const reviewsSnapshot = await getDocs(query(collection(db, 'reviews'), where('providerId', '==', id)));
          setReviews(reviewsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review)));
        }
      } catch (error) {
        console.error("Error fetching provider data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <Loader2 className="w-10 h-10 animate-spin mb-4" />
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!provider || !userData) {
    return <div className="text-center py-20">Provider not found.</div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header Card */}
      <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="w-32 h-32 rounded-3xl bg-gray-100 overflow-hidden flex-shrink-0">
            <img 
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.name}`} 
              alt={userData.name}
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="flex-grow space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-3xl font-bold text-gray-900">{userData.name}</h1>
                  <ShieldCheck className="w-6 h-6 text-blue-500" />
                </div>
                <div className="flex flex-wrap items-center gap-4 text-gray-500 mt-2">
                  <div className="flex items-center gap-1">
                    <Briefcase className="w-4 h-4" />
                    <span>{provider.profession}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{userData.location || "Location not set"}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{provider.experience} years experience</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {userData.phone && (
                  <Button 
                    variant="outline" 
                    className="gap-2 border-green-200 text-green-700 hover:bg-green-50"
                    onClick={handleWhatsAppClick}
                  >
                    <Phone className="w-4 h-4" />
                    WhatsApp
                  </Button>
                )}
                <Button variant="outline" className="gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Message
                </Button>
                <Button 
                  className="gap-2"
                  onClick={handleBookNow}
                  disabled={bookingLoading || bookingSuccess}
                >
                  {bookingLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : bookingSuccess ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : null}
                  {bookingSuccess ? 'Booked!' : 'Book Now'}
                </Button>
              </div>
            </div>
            
            <div className="flex items-center gap-6 pt-4 border-t border-gray-50">
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="text-lg font-bold text-gray-900">{provider.rating.toFixed(1)}</span>
                <span className="text-gray-500">({provider.totalReviews} reviews)</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-lg font-bold text-gray-900">100%</span>
                <span className="text-gray-500">Job success</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: About & Services */}
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4">About</h2>
            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
              {provider.description || "No description provided."}
            </p>
          </section>

          <section className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Services Offered</h2>
            <div className="space-y-4">
              {services.length > 0 ? services.map(service => (
                <div key={service.id} className="p-4 rounded-2xl border border-gray-50 bg-gray-50/50 flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-gray-900">{service.title}</h3>
                    <p className="text-sm text-gray-500">{service.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-blue-600">${service.price}</div>
                    <button className="text-xs text-blue-600 font-medium hover:underline">Select</button>
                  </div>
                </div>
              )) : (
                <p className="text-gray-500 italic">No specific services listed yet.</p>
              )}
            </div>
          </section>

          <section className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Reviews</h2>
            <div className="space-y-6">
              {reviews.length > 0 ? reviews.map(review => (
                <div key={review.id} className="border-b border-gray-50 pb-6 last:border-0 last:pb-0">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={cn("w-4 h-4", i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200")} />
                      ))}
                    </div>
                    <span className="text-xs text-gray-400">{format(new Date(review.createdAt), 'MMM d, yyyy')}</span>
                  </div>
                  <p className="text-gray-600 text-sm italic">"{review.comment}"</p>
                </div>
              )) : (
                <p className="text-gray-500 italic">No reviews yet.</p>
              )}
            </div>
          </section>
        </div>

        {/* Right Column: Availability & Stats */}
        <div className="space-y-8">
          <section className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm sticky top-24">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Availability</h2>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Monday - Friday</span>
                <span className="text-gray-900 font-medium">9:00 AM - 6:00 PM</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Saturday</span>
                <span className="text-gray-900 font-medium">10:00 AM - 4:00 PM</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Sunday</span>
                <span className="text-red-500 font-medium">Closed</span>
              </div>
              
              <div className="pt-6 border-t border-gray-50">
                <p className="text-sm text-gray-500 mb-4">Response time: <span className="text-gray-900 font-medium">Under 2 hours</span></p>
                <Button className="w-full py-4 text-lg">Check Availability</Button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
