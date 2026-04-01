import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search as SearchIcon, Hammer, Shield, Clock, Star, ArrowRight } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { motion } from 'motion/react';

const CATEGORIES = [
  { name: 'Engineers', icon: '🏗️', count: 124 },
  { name: 'Mechanics', icon: '🔧', count: 86 },
  { name: 'Electricians', icon: '⚡', count: 92 },
  { name: 'Plumbers', icon: '🚰', count: 54 },
  { name: 'Carpenters', icon: '🪚', count: 41 },
  { name: 'Painters', icon: '🎨', count: 38 },
];

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-600 rounded-full blur-3xl"></div>
        </div>

        <div className="text-center max-w-3xl mx-auto space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight">
              Expert Services, <span className="text-blue-600">Just a Click Away.</span>
            </h1>
            <p className="mt-6 text-xl text-gray-600 dark:text-gray-400">
              Connect with top-rated engineers, mechanics, and electricians in your area. 
              Reliable, professional, and easy to book.
            </p>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            onSubmit={handleSearch}
            className="flex flex-col md:flex-row gap-4 p-2 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800"
          >
            <div className="flex-grow flex items-center px-4 gap-3">
              <SearchIcon className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="What service do you need? (e.g. Mechanic)"
                className="w-full py-3 focus:outline-none text-gray-700 dark:text-gray-200 bg-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button type="submit" size="lg" className="md:w-40 rounded-xl">
              Search
            </Button>
          </motion.form>

          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500">
            <span>Popular:</span>
            {['Mechanic', 'Plumber', 'Electrician'].map((tag) => (
              <button
                key={tag}
                onClick={() => navigate(`/search?q=${tag}`)}
                className="hover:text-blue-600 transition-colors underline underline-offset-4"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section>
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Browse Categories</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Find the right expert for your specific needs</p>
          </div>
          <Link to="/search" className="text-blue-600 font-medium flex items-center gap-1 hover:underline">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {CATEGORIES.map((cat, i) => (
            <motion.button
              key={cat.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              onClick={() => navigate(`/search?q=${cat.name}`)}
              className="p-6 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-lg hover:-translate-y-1 transition-all text-center group"
            >
              <span className="text-4xl mb-4 block group-hover:scale-110 transition-transform">{cat.icon}</span>
              <h3 className="font-semibold text-gray-900 dark:text-white">{cat.name}</h3>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{cat.count} experts</p>
            </motion.button>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-blue-600 rounded-3xl p-12 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/20 rounded-full -ml-32 -mb-32 blur-3xl"></div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
          <div className="space-y-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold">Verified Experts</h3>
            <p className="text-blue-100">Every service provider on our platform goes through a rigorous verification process.</p>
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold">Fast Booking</h3>
            <p className="text-blue-100">Book a service in minutes and get real-time updates on your request status.</p>
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Star className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold">Quality Guaranteed</h3>
            <p className="text-blue-100">Read reviews from other customers and rate your experience after completion.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
