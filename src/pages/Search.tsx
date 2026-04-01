import { useState, useEffect, FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { ProviderProfile, UserProfile } from '../types';
import ProviderCard from '../components/ProviderCard';
import { Search as SearchIcon, SlidersHorizontal, Loader2 } from 'lucide-react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  
  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [results, setResults] = useState<{provider: ProviderProfile, user: UserProfile}[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProviders = async (searchTerm: string) => {
    setLoading(true);
    try {
      // In a real app, we'd use Algolia or a more complex query
      // For now, we'll fetch all and filter client-side if needed, or simple where
      const providersRef = collection(db, 'providers');
      let q = query(providersRef, limit(20));
      
      if (searchTerm) {
        // Simple case-insensitive search isn't native to Firestore
        // We'll just fetch and filter for this demo
      }

      const snapshot = await getDocs(q);
      const providerData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProviderProfile));
      
      // Fetch corresponding user data
      const resultsWithUsers = await Promise.all(providerData.map(async (provider) => {
        const userDoc = await getDocs(query(collection(db, 'users'), where('__name__', '==', provider.userId)));
        const userData = userDoc.docs[0]?.data() as UserProfile;
        return { provider, user: { id: userDoc.docs[0]?.id, ...userData } };
      }));

      // Client-side filter for demo purposes
      const filtered = resultsWithUsers.filter(item => 
        !searchTerm || 
        item.provider.profession.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.user.name.toLowerCase().includes(searchTerm.toLowerCase())
      );

      setResults(filtered);
    } catch (error) {
      console.error("Error searching providers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders(queryParam);
  }, [queryParam]);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    setSearchParams({ q: searchQuery });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row gap-4 items-end">
        <form onSubmit={handleSearch} className="flex-grow flex gap-2">
          <Input
            placeholder="Search by name or profession..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-12"
          />
          <Button type="submit" className="h-12 px-8">
            <SearchIcon className="w-5 h-5" />
          </Button>
        </form>
        <Button variant="outline" className="h-12 gap-2">
          <SlidersHorizontal className="w-5 h-5" />
          Filters
        </Button>
      </div>

      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-6">
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
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
            <p className="text-gray-500">No experts found matching your search.</p>
            <Button variant="ghost" className="mt-4" onClick={() => { setSearchQuery(''); setSearchParams({}); }}>
              Clear search
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
