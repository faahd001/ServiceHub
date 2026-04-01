import { Hammer } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 text-blue-600 font-bold text-xl mb-4">
              <Hammer className="w-6 h-6" />
              <span>ServiceHub</span>
            </div>
            <p className="text-gray-500 max-w-sm">
              Connecting skilled service providers with customers who need their expertise. 
              Quality service, guaranteed.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Platform</h4>
            <ul className="space-y-2 text-gray-500">
              <li><a href="/search" className="hover:text-blue-600">Browse Services</a></li>
              <li><a href="/register?role=provider" className="hover:text-blue-600">Become a Provider</a></li>
              <li><a href="/how-it-works" className="hover:text-blue-600">How it Works</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Support</h4>
            <ul className="space-y-2 text-gray-500">
              <li><a href="/contact" className="hover:text-blue-600">Contact Us</a></li>
              <li><a href="/faq" className="hover:text-blue-600">FAQ</a></li>
              <li><a href="/terms" className="hover:text-blue-600">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t mt-12 pt-8 text-center text-gray-400 text-sm">
          © {new Date().getFullYear()} ServiceHub. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
