import { ReactNode } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import QuickSettings from './QuickSettings';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-white transition-colors duration-300">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>
      <QuickSettings />
      <Footer />
    </div>
  );
}
