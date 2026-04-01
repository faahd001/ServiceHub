import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'es' | 'fr' | 'de' | 'sw';
type Theme = 'light' | 'dark';

interface SettingsContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    settings: 'Settings',
    language: 'Language',
    display: 'Display',
    darkMode: 'Dark Mode',
    saveChanges: 'Save Changes',
    profile: 'Profile',
    notifications: 'Notifications',
    howItWorks: 'How It Works',
    findServices: 'Find Services',
    contact: 'Contact',
    logout: 'Logout',
    login: 'Login',
    register: 'Register'
  },
  es: {
    settings: 'Ajustes',
    language: 'Idioma',
    display: 'Pantalla',
    darkMode: 'Modo Oscuro',
    saveChanges: 'Guardar Cambios',
    profile: 'Perfil',
    notifications: 'Notificaciones',
    howItWorks: 'Cómo Funciona',
    findServices: 'Buscar Servicios',
    contact: 'Contacto',
    logout: 'Cerrar Sesión',
    login: 'Iniciar Sesión',
    register: 'Registrarse'
  },
  fr: {
    settings: 'Paramètres',
    language: 'Langue',
    display: 'Affichage',
    darkMode: 'Mode Sombre',
    saveChanges: 'Enregistrer les modifications',
    profile: 'Profil',
    notifications: 'Notifications',
    howItWorks: 'Comment ça marche',
    findServices: 'Trouver des services',
    contact: 'Contact',
    logout: 'Déconnexion',
    login: 'Connexion',
    register: 'S\'inscrire'
  },
  de: {
    settings: 'Einstellungen',
    language: 'Sprache',
    display: 'Anzeige',
    darkMode: 'Dunkelmodus',
    saveChanges: 'Änderungen speichern',
    profile: 'Profil',
    notifications: 'Benachrichtigungen',
    howItWorks: 'Wie es funktioniert',
    findServices: 'Dienste finden',
    contact: 'Kontakt',
    logout: 'Abmelden',
    login: 'Anmelden',
    register: 'Registrieren'
  },
  sw: {
    settings: 'Mipangilio',
    language: 'Lugha',
    display: 'Onyesho',
    darkMode: 'Hali ya Giza',
    saveChanges: 'Hifadhi Mabadiliko',
    profile: 'Wasifu',
    notifications: 'Arifa',
    howItWorks: 'Jinsi Inavyofanya Kazi',
    findServices: 'Tafuta Huduma',
    contact: 'Wasiliana Nasi',
    logout: 'Ondoka',
    login: 'Ingia',
    register: 'Jisajili'
  }
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('app-language');
    return (saved as Language) || 'en';
  });
  
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    localStorage.setItem('app-theme', 'light');
    document.documentElement.classList.remove('dark');
  }, []);

  useEffect(() => {
    localStorage.setItem('app-language', language);
  }, [language]);

  const t = (key: string) => {
    return translations[language][key] || key;
  };

  return (
    <SettingsContext.Provider value={{ language, setLanguage, theme, setTheme, t }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
