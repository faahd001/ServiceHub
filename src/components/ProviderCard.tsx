import { Star, MapPin, Briefcase, ChevronRight, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MouseEvent } from 'react';
import { ProviderProfile, UserProfile } from '../types';
import Button from './ui/Button';

interface ProviderCardProps {
  provider: ProviderProfile;
  user: UserProfile;
}

export default function ProviderCard({ provider, user }: ProviderCardProps) {
  const handleWhatsAppClick = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (user.phone) {
      const formattedPhone = user.phone.replace(/\D/g, '');
      window.open(`https://wa.me/${formattedPhone}`, '_blank');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-xl transition-all group relative">
      <div className="flex gap-6">
        <div className="w-24 h-24 rounded-2xl bg-gray-100 overflow-hidden flex-shrink-0">
          <img 
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} 
            alt={user.name}
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="flex-grow">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                {user.name}
              </h3>
              <div className="flex items-center gap-2 text-gray-500 text-sm mt-1">
                <Briefcase className="w-4 h-4" />
                <span>{provider.profession}</span>
                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                <span>{provider.experience} years exp.</span>
              </div>
            </div>
            <div className="flex items-center gap-1 bg-yellow-50 text-yellow-700 px-2 py-1 rounded-lg text-sm font-bold">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span>{provider.rating.toFixed(1)}</span>
              <span className="text-yellow-500 font-normal">({provider.totalReviews})</span>
            </div>
          </div>

          <p className="mt-4 text-gray-600 line-clamp-2 text-sm leading-relaxed">
            {provider.description || "No description provided."}
          </p>

          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-gray-500 text-sm">
                <MapPin className="w-4 h-4" />
                <span>{user.location || "Location not set"}</span>
              </div>
              {user.phone && (
                <button 
                  onClick={handleWhatsAppClick}
                  className="flex items-center gap-1 text-green-600 text-sm font-bold hover:text-green-700 transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  WhatsApp
                </button>
              )}
            </div>
            <Link to={`/provider/${provider.id}`}>
              <Button variant="outline" size="sm" className="gap-2">
                View Profile <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
