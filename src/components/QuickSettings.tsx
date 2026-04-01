import React, { useState, useRef, useEffect } from 'react';
import { Settings, Moon, Sun, Globe, Check, X } from 'lucide-react';
import { useSettings } from './SettingsContext';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export default function QuickSettings() {
  const { language, setLanguage, theme, setTheme, t } = useSettings();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
    { code: 'sw', name: 'Kiswahili' }
  ];

  return (
    <div className="fixed bottom-6 right-6 z-[100]" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300",
          isOpen ? "bg-red-500 rotate-90" : "bg-blue-600 hover:bg-blue-700"
        )}
      >
        {isOpen ? <X className="w-6 h-6 text-white" /> : <Settings className="w-6 h-6 text-white animate-spin-slow" />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="absolute bottom-16 right-0 w-64 bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden"
          >
            <div className="p-5 space-y-6">
              {/* Language Selection */}
              <div className="space-y-3">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('language')}</p>
                <div className="grid grid-cols-1 gap-2">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code as any);
                      }}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-xl text-sm font-medium transition-all",
                        language === lang.code
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-600 hover:bg-gray-50"
                      )}
                    >
                      <span>{lang.name}</span>
                      {language === lang.code && <Check className="w-4 h-4" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="p-3 bg-gray-50 text-center">
              <a 
                href="/settings" 
                className="text-xs font-bold text-blue-600 hover:underline"
                onClick={() => setIsOpen(false)}
              >
                View All Settings
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
