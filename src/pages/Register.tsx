import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Hammer, User, Briefcase, AlertCircle, ExternalLink, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { UserRole } from '../types';

export default function Register() {
  const [role, setRole] = useState<UserRole>('customer');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [profession, setProfession] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Create user profile
      await setDoc(doc(db, 'users', user.uid), {
        name,
        email,
        phone,
        role,
        createdAt: serverTimestamp(),
      });

      // If provider, create provider profile
      if (role === 'provider') {
        await setDoc(doc(db, 'providers', user.uid), {
          userId: user.uid,
          profession,
          experience: 0,
          description: '',
          rating: 0,
          totalReviews: 0,
        });
      }

      navigate('/dashboard');
    } catch (err: any) {
      console.error("Registration error:", err);
      if (err.code === 'auth/operation-not-allowed') {
        setError('setup-required');
      } else {
        setError(err.message || 'Failed to create account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl w-full bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-gray-100"
      >
        <div className="text-center mb-10">
          <motion.div 
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-2xl mb-6 shadow-lg shadow-blue-200"
          >
            <Hammer className="w-8 h-8" />
          </motion.div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Create Account</h1>
          <p className="text-gray-500 mt-2 text-lg">Join ConnectPro to find or offer expert services</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-10">
          <button
            type="button"
            onClick={() => setRole('customer')}
            className={cn(
              "relative p-6 rounded-2xl border-2 transition-all text-left group overflow-hidden",
              role === 'customer' 
                ? "border-blue-600 bg-blue-50/50 ring-4 ring-blue-50" 
                : "border-gray-100 hover:border-gray-200 bg-white"
            )}
          >
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors",
              role === 'customer' ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-400 group-hover:bg-gray-200"
            )}>
              <User className="w-6 h-6" />
            </div>
            <span className={cn("font-bold block text-lg", role === 'customer' ? "text-blue-900" : "text-gray-700")}>Customer</span>
            <span className="text-sm text-gray-500">I'm looking for help</span>
            {role === 'customer' && (
              <CheckCircle2 className="absolute top-4 right-4 w-6 h-6 text-blue-600" />
            )}
          </button>
          
          <button
            type="button"
            onClick={() => setRole('provider')}
            className={cn(
              "relative p-6 rounded-2xl border-2 transition-all text-left group overflow-hidden",
              role === 'provider' 
                ? "border-blue-600 bg-blue-50/50 ring-4 ring-blue-50" 
                : "border-gray-100 hover:border-gray-200 bg-white"
            )}
          >
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors",
              role === 'provider' ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-400 group-hover:bg-gray-200"
            )}>
              <Briefcase className="w-6 h-6" />
            </div>
            <span className={cn("font-bold block text-lg", role === 'provider' ? "text-blue-900" : "text-gray-700")}>Provider</span>
            <span className="text-sm text-gray-500">I want to offer services</span>
            {role === 'provider' && (
              <CheckCircle2 className="absolute top-4 right-4 w-6 h-6 text-blue-600" />
            )}
          </button>
        </div>

        <AnimatePresence mode="wait">
          {error === 'setup-required' ? (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-8 p-5 bg-amber-50 border border-amber-200 rounded-2xl space-y-3"
            >
              <div className="flex items-center gap-2 text-amber-800 font-bold">
                <AlertCircle className="w-5 h-5" />
                <span>Firebase Setup Required</span>
              </div>
              <p className="text-sm text-amber-700 leading-relaxed">
                Registration is currently disabled because <strong>Email/Password</strong> authentication is not enabled in your Firebase project.
              </p>
              <a 
                href="https://console.firebase.google.com/project/_/authentication/providers" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 bg-amber-600 text-white rounded-xl text-sm font-bold hover:bg-amber-700 transition-all shadow-md shadow-amber-100"
              >
                Enable Email/Password Auth <ExternalLink className="w-4 h-4" />
              </a>
            </motion.div>
          ) : error && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-8 p-4 bg-red-50 text-red-700 text-sm rounded-2xl border border-red-100 flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleRegister} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Full Name"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="h-12 rounded-xl"
            />
            <Input
              label="Email Address"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-12 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Phone Number (WhatsApp)"
              type="tel"
              placeholder="+254 700 000 000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="h-12 rounded-xl"
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-12 rounded-xl"
            />
          </div>

          {role === 'provider' && (
            <div className="grid grid-cols-1 gap-6">
              <Input
                label="Profession"
                placeholder="e.g. Mechanical Engineer"
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
                required
                className="h-12 rounded-xl"
              />
            </div>
          )}
          
          <div className="pt-4">
            <Button type="submit" className="w-full h-14 rounded-2xl text-lg font-bold shadow-xl shadow-blue-100" isLoading={loading}>
              Create {role === 'provider' ? 'Provider' : 'Customer'} Account
            </Button>
          </div>
        </form>

        <p className="mt-10 text-center text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 font-bold hover:text-blue-700 transition-colors">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
