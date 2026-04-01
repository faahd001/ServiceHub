import { useState, useEffect, FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { ProviderProfile, UserProfile } from '../types';
import ProviderCard from '../components/ProviderCard';
import { Search as SearchIcon, SlidersHorizontal, Loader2, MapPin } from 'lucide-react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  
  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [locationQuery, setLocationQuery] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);
  const [results, setResults] = useState<{provider: ProviderProfile, user: UserProfile}[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProviders = async (searchTerm: string, locationTerm: string) => {
    setLoading(true);
    try {
      const providersRef = collection(db, 'providers');
      let q = query(providersRef, limit(20));
      
      const snapshot = await getDocs(q);
      const providerData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProviderProfile));
      
      const resultsWithUsers = await Promise.all(providerData.map(async (provider) => {
        const userDoc = await getDocs(query(collection(db, 'users'), where('__name__', '==', provider.userId)));
        const userData = userDoc.docs[0]?.data() as UserProfile;
        return { provider, user: { id: userDoc.docs[0]?.id, ...userData } };
      }));

      const filtered = resultsWithUsers.filter(item => {
        const matchesSearch = !searchTerm || 
          item.provider.profession.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.user.name.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesLocation = !locationTerm || 
          (item.user.location && item.user.location.toLowerCase().includes(locationTerm.toLowerCase()));
          
        return matchesSearch && matchesLocation;
      });

      setResults(filtered);
    } catch (error) {
      console.error("Error searching providers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders(queryParam, '');
  }, [queryParam]);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    setSearchParams({ q: searchQuery });
    fetchProviders(searchQuery, locationQuery);
  };

  const detectLocation = () => {
    setIsDetecting(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // In a real app, we would use reverse geocoding here.
          // For now, we'll just set a placeholder or use coordinates.
          const { latitude, longitude } = position.coords;
          setLocationQuery(`Near ${latitude.toFixed(2)}, ${longitude.toFixed(2)}`);
          setIsDetecting(false);
          // Trigger search automatically
          fetchProviders(searchQuery, `Near ${latitude.toFixed(2)}, ${longitude.toFixed(2)}`);
        },
        (error) => {
          console.error("Error getting location:", error);
          setIsDetecting(false);
          alert("Unable to retrieve your location. Please check your browser permissions.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
      setIsDetecting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row gap-4 items-end">
        <form onSubmit={handleSearch} className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-2">
          <Input
            placeholder="Search by name or profession..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-12"
          />
          <div className="relative">
            <Input
              placeholder="Location (e.g. Nairobi)"
              value={locationQuery}
              onChange={(e) => setLocationQuery(e.target.value)}
              className="h-12 pr-24"
              icon={<MapPin className="w-5 h-5 text-gray-400" />}
            />
            <button
              type="button"
              onClick={detectLocation}
              disabled={isDetecting}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
            >
              {isDetecting ? "Detecting..." : "Detect"}
            </button>
          </div>
        </form>
        <div className="flex gap-2 w-full md:w-auto">
          <Button type="submit" onClick={handleSearch} className="h-12 px-8 flex-grow md:flex-grow-0">
            <SearchIcon className="w-5 h-5" />
          </Button>
          <Button variant="outline" className="h-12 gap-2">
            <SlidersHorizontal className="w-5 h-5" />
            Filters
          </Button>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          {loading ? "Searching..." : `${results.length} experts found`}
        </h2>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Loader2 className="w-10 h-10 animate-spin mb-4" />
            <p>Finding the best experts for you...</p>
          </div>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {results.map((item) => (
              <div key={item.provider.id}>
                <ProviderCard provider={item.provider} user={item.user} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-3xl border border-dashed border-gray-200 dark:border-gray-800">
            <p className="text-gray-500 dark:text-gray-400">No experts found matching your search.</p>
            <Button variant="ghost" className="mt-4" onClick={() => { setSearchQuery(''); setSearchParams({}); }}>
              Clear search
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
