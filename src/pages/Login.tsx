import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../firebase';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Hammer, Github, Mail, Lock, AlertCircle, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (err: any) {
      console.error("Login error:", err);
      if (err.code === 'auth/operation-not-allowed') {
        setError('setup-required');
      } else {
        setError(err.message || 'Failed to login. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to login with Google');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-gray-100"
      >
        <div className="text-center mb-10">
          <motion.div 
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-2xl mb-6 shadow-lg shadow-blue-200"
          >
            <Hammer className="w-8 h-8" />
          </motion.div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Welcome Back</h1>
          <p className="text-gray-500 mt-2">Sign in to your ServiceHub account</p>
        </div>

        <AnimatePresence mode="wait">
          {error === 'setup-required' ? (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-3"
            >
              <div className="flex items-center gap-2 text-amber-800 font-bold">
                <AlertCircle className="w-5 h-5" />
                <span>Action Required</span>
              </div>
              <p className="text-sm text-amber-700 leading-relaxed">
                Email/Password login is not yet enabled in your Firebase project. 
              </p>
              <a 
                href="https://console.firebase.google.com/project/_/authentication/providers" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2 bg-amber-600 text-white rounded-xl text-sm font-medium hover:bg-amber-700 transition-colors"
              >
                Enable in Firebase Console <ExternalLink className="w-4 h-4" />
              </a>
            </motion.div>
          ) : error && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-6 p-4 bg-red-50 text-red-700 text-sm rounded-2xl border border-red-100 flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1">
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
          <div className="space-y-1">
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
          
          <div className="flex items-center justify-between text-sm px-1">
            <label className="flex items-center gap-2 text-gray-600 cursor-pointer group">
              <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-all" />
              <span className="group-hover:text-gray-900 transition-colors">Remember me</span>
            </label>
            <Link to="/forgot-password" title="Forgot Password" className="text-blue-600 font-medium hover:text-blue-700 transition-colors">
              Forgot password?
            </Link>
          </div>

          <Button type="submit" className="w-full h-12 rounded-xl text-lg shadow-lg shadow-blue-100" isLoading={loading}>
            Sign In
          </Button>
        </form>

        <div className="relative my-10">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-100"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold">
            <span className="px-4 bg-white text-gray-400">Or continue with</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button variant="outline" className="h-12 rounded-xl border-gray-200 hover:bg-gray-50" onClick={handleGoogleLogin}>
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5 mr-2" />
            <span className="text-gray-700">Google</span>
          </Button>
          <Button variant="outline" className="h-12 rounded-xl border-gray-200 hover:bg-gray-50">
            <Github className="w-5 h-5 mr-2 text-gray-900" />
            <span className="text-gray-700">GitHub</span>
          </Button>
        </div>

        <p className="mt-10 text-center text-gray-600">
          New to ServiceHub?{' '}
          <Link to="/register" className="text-blue-600 font-bold hover:text-blue-700 transition-colors">
            Create an account
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
