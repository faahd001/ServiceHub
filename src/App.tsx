import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import { AuthProvider } from './components/AuthContext';
import { NotificationProvider } from './components/NotificationContext';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Search from './pages/Search';
import ProviderProfile from './pages/ProviderProfile';
import Dashboard from './pages/Dashboard';
import Contact from './pages/Contact';
import HowItWorks from './pages/HowItWorks';

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/search" element={<Search />} />
              <Route path="/provider/:id" element={<ProviderProfile />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
            </Routes>
          </Layout>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}
