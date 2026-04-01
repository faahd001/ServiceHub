import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import { AuthProvider } from './components/AuthContext';
import { NotificationProvider } from './components/NotificationContext';
import { SettingsProvider } from './components/SettingsContext';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Search from './pages/Search';
import ProviderProfile from './pages/ProviderProfile';
import Dashboard from './pages/Dashboard';
import Contact from './pages/Contact';
import HowItWorks from './pages/HowItWorks';
import Settings from './pages/Settings';
import ForgotPassword from './pages/ForgotPassword';
import Chat from './pages/Chat';

export default function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <NotificationProvider>
          <Router>
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/search" element={<Search />} />
                <Route path="/provider/:id" element={<ProviderProfile />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/chat/:roomId" element={<Chat />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/how-it-works" element={<HowItWorks />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </Layout>
          </Router>
        </NotificationProvider>
      </SettingsProvider>
    </AuthProvider>
  );
}
