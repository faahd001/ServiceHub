import React, { useState } from 'react';
import { Globe, Moon, Sun, Bell, Shield, User, Save, CheckCircle2, Lock, Mail, Phone, MapPin, Camera, Smartphone, QrCode, Copy, RefreshCw, Trash2, AlertTriangle, Key, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useSettings } from '../components/SettingsContext';
import { useAuth } from '../components/AuthContext';
import { db, auth as firebaseAuth } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { cn } from '../lib/utils';

export default function Settings() {
  const { language, setLanguage, theme, setTheme, t } = useSettings();
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Profile State
  const [displayName, setDisplayName] = useState(profile?.displayName || '');
  const [phoneNumber, setPhoneNumber] = useState(profile?.phoneNumber || '');
  const [location, setLocation] = useState(profile?.location || '');
  const [bio, setBio] = useState(profile?.bio || '');

  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Notification State
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);

  // 2FA State
  const [is2FAEnabled, setIs2FAEnabled] = useState(profile?.twoFactorEnabled || false);
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [setupStep, setSetupStep] = useState(1);
  const [verificationCode, setVerificationCode] = useState('');
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [is2FALoading, setIs2FALoading] = useState(false);

  const handleStart2FASetup = () => {
    setSetupStep(1);
    setShow2FASetup(true);
  };

  const handleVerify2FA = async () => {
    if (verificationCode.length !== 6) return;
    
    setIs2FALoading(true);
    try {
      // Simulate verification delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate dummy recovery codes
      const codes = Array.from({ length: 8 }, () => Math.random().toString(36).substring(2, 10).toUpperCase());
      setRecoveryCodes(codes);
      setSetupStep(4);
    } catch (error) {
      console.error("Error verifying 2FA:", error);
    } finally {
      setIs2FALoading(false);
    }
  };

  const handleComplete2FA = async () => {
    if (!user) return;
    setIs2FALoading(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        twoFactorEnabled: true,
        recoveryCodes: recoveryCodes
      });
      setIs2FAEnabled(true);
      setShow2FASetup(false);
    } catch (error) {
      console.error("Error completing 2FA setup:", error);
    } finally {
      setIs2FALoading(false);
    }
  };

  const handleDisable2FA = async () => {
    if (!user || !window.confirm('Are you sure you want to disable Two-Factor Authentication? This will make your account less secure.')) return;
    
    setIs2FALoading(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        twoFactorEnabled: false,
        recoveryCodes: []
      });
      setIs2FAEnabled(false);
    } catch (error) {
      console.error("Error disabling 2FA:", error);
    } finally {
      setIs2FALoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        displayName,
        phoneNumber,
        location,
        bio
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    if (!firebaseAuth.currentUser || !firebaseAuth.currentUser.email) return;

    try {
      setIsSaving(true);
      const credential = EmailAuthProvider.credential(firebaseAuth.currentUser.email, currentPassword);
      await reauthenticateWithCredential(firebaseAuth.currentUser, credential);
      await updatePassword(firebaseAuth.currentUser, newPassword);
      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      setPasswordError(error.message || 'Failed to update password');
    } finally {
      setIsSaving(false);
    }
  };

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
    { code: 'sw', name: 'Kiswahili' }
  ];

  return (
    <div className="max-w-5xl mx-auto py-12 px-4 space-y-12">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">{t('settings')}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Manage your account preferences and display settings</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="space-y-2">
          {[
            { id: 'general', label: 'General', icon: Globe },
            { id: 'account', label: 'Account', icon: User },
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'privacy', label: 'Privacy & Security', icon: Shield },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all",
                activeTab === item.id
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-none"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="md:col-span-3 space-y-8">
          {activeTab === 'general' && (
            <>
              {/* Language Section */}
              <section className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-8 shadow-sm space-y-6">
                <div className="flex items-center gap-3 border-b border-gray-50 dark:border-gray-800 pb-4">
                  <Globe className="w-6 h-6 text-blue-600" />
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('language')}</h2>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setLanguage(lang.code as any)}
                      className={cn(
                        "p-4 rounded-2xl border transition-all text-left flex items-center justify-between",
                        language === lang.code 
                          ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" 
                          : "border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
                      )}
                    >
                      <span className="font-bold">{lang.name}</span>
                      {language === lang.code && <CheckCircle2 className="w-5 h-5" />}
                    </button>
                  ))}
                </div>
              </section>
            </>
          )}

          {activeTab === 'account' && (
            <section className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-8 shadow-sm space-y-8">
              <div className="flex items-center gap-3 border-b border-gray-50 dark:border-gray-800 pb-4">
                <User className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Profile Settings</h2>
              </div>

              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-shrink-0 flex flex-col items-center gap-4">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden border-4 border-white dark:border-gray-900 shadow-lg">
                      {profile?.photoURL ? (
                        <img src={profile.photoURL} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-12 h-12 text-gray-400" />
                      )}
                    </div>
                    <button className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors">
                      <Camera className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">JPG, GIF or PNG. Max size of 2MB</p>
                </div>

                <div className="flex-grow space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Full Name</label>
                      <Input 
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Your Name"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Email Address</label>
                      <Input 
                        value={user?.email || ''}
                        disabled
                        className="bg-gray-50 dark:bg-gray-800/50 cursor-not-allowed"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Phone Number</label>
                      <Input 
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Location</label>
                      <Input 
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="City, Country"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Bio</label>
                    <textarea 
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="w-full p-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all min-h-[120px]"
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                  <div className="flex justify-end pt-4">
                    <Button 
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                      className="gap-2"
                    >
                      {saveSuccess ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                      {saveSuccess ? 'Saved!' : 'Save Profile'}
                    </Button>
                  </div>
                </div>
              </div>
            </section>
          )}

          {activeTab === 'notifications' && (
            <section className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-8 shadow-sm space-y-8">
              <div className="flex items-center gap-3 border-b border-gray-50 dark:border-gray-800 pb-4">
                <Bell className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Notification Preferences</h2>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                      <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">Push Notifications</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Receive alerts on your device for new bookings and messages</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setPushEnabled(!pushEnabled)}
                    className={cn(
                      "w-14 h-8 rounded-full p-1 transition-colors relative",
                      pushEnabled ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-700"
                    )}
                  >
                    <div className={cn(
                      "w-6 h-6 bg-white rounded-full shadow-sm transition-transform",
                      pushEnabled ? "translate-x-6" : "translate-x-0"
                    )} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                      <Mail className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">Email Notifications</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Get updates about your account and services via email</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setEmailEnabled(!emailEnabled)}
                    className={cn(
                      "w-14 h-8 rounded-full p-1 transition-colors relative",
                      emailEnabled ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-700"
                    )}
                  >
                    <div className={cn(
                      "w-6 h-6 bg-white rounded-full shadow-sm transition-transform",
                      emailEnabled ? "translate-x-6" : "translate-x-0"
                    )} />
                  </button>
                </div>
              </div>
            </section>
          )}

          {activeTab === 'privacy' && (
            <section className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-8 shadow-sm space-y-8">
              <div className="flex items-center gap-3 border-b border-gray-50 dark:border-gray-800 pb-4">
                <Shield className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Privacy & Security</h2>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-6 max-w-md">
                <div className="space-y-4">
                  <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Change Password
                  </h3>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Current Password</label>
                    <Input 
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">New Password</label>
                    <Input 
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Confirm New Password</label>
                    <Input 
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>

                {passwordError && (
                  <p className="text-sm text-red-600 font-medium">{passwordError}</p>
                )}
                {passwordSuccess && (
                  <p className="text-sm text-green-600 font-medium">Password updated successfully!</p>
                )}

                <Button 
                  type="submit"
                  disabled={isSaving}
                  className="w-full"
                >
                  Update Password
                </Button>
              </form>

              <div className="pt-8 border-t border-gray-50 dark:border-gray-800 space-y-6">
                <h3 className="font-bold text-gray-900 dark:text-white">Account Security</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-6 rounded-3xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "p-3 rounded-2xl",
                        is2FAEnabled ? "bg-green-50 dark:bg-green-900/20 text-green-600" : "bg-blue-50 dark:bg-blue-900/20 text-blue-600"
                      )}>
                        <Smartphone className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-gray-900 dark:text-white">Two-Factor Authentication</p>
                          {is2FAEnabled && (
                            <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 text-[10px] font-bold rounded-full uppercase tracking-wider">Enabled</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Add an extra layer of security to your account using an authenticator app</p>
                      </div>
                    </div>
                    {is2FAEnabled ? (
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setShow2FASetup(true)} className="gap-2">
                          <RefreshCw className="w-4 h-4" />
                          Manage
                        </Button>
                        <Button variant="ghost" size="sm" onClick={handleDisable2FA} className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 gap-2">
                          <Trash2 className="w-4 h-4" />
                          Disable
                        </Button>
                      </div>
                    ) : (
                      <Button variant="primary" size="sm" onClick={handleStart2FASetup} className="gap-2">
                        <Smartphone className="w-4 h-4" />
                        Enable 2FA
                      </Button>
                    )}
                  </div>

                  <div className="flex items-center justify-between p-6 rounded-3xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-2xl text-gray-600 dark:text-gray-400">
                        <Key className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">Security Keys</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Use a physical security key (like YubiKey) for hardware-based protection</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Add Key</Button>
                  </div>
                </div>
              </div>

              {/* 2FA Setup Modal */}
              <AnimatePresence>
                {show2FASetup && (
                  <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 20 }}
                      className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/10"
                    >
                      <div className="p-8 border-b border-gray-50 dark:border-gray-800 flex justify-between items-center">
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Two-Factor Authentication</h2>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Step {setupStep} of 4</p>
                        </div>
                        <button onClick={() => setShow2FASetup(false)} className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-2xl transition-colors">
                          <X className="w-6 h-6" />
                        </button>
                      </div>

                      <div className="p-8">
                        {setupStep === 1 && (
                          <div className="space-y-6 text-center">
                            <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-3xl flex items-center justify-center mx-auto">
                              <Smartphone className="w-10 h-10" />
                            </div>
                            <div className="space-y-2">
                              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Secure your account</h3>
                              <p className="text-gray-500 dark:text-gray-400">
                                2FA adds an extra layer of protection. When you sign in, you'll need to provide a code from your authenticator app.
                              </p>
                            </div>
                            <Button className="w-full h-14 rounded-2xl text-lg" onClick={() => setSetupStep(2)}>
                              Get Started
                            </Button>
                          </div>
                        )}

                        {setupStep === 2 && (
                          <div className="space-y-6">
                            <div className="flex flex-col items-center gap-6">
                              <div className="p-4 bg-white rounded-3xl shadow-inner border-4 border-gray-50">
                                <QrCode className="w-40 h-40 text-gray-900" />
                              </div>
                              <div className="text-center space-y-2">
                                <p className="text-sm font-bold text-gray-900 dark:text-white tracking-wide uppercase">Scan this QR Code</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Scan this code with your authenticator app (Google Authenticator, Authy, etc.)</p>
                              </div>
                            </div>
                            
                            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                              <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Or enter manually</p>
                              <div className="flex items-center justify-between">
                                <code className="text-blue-600 dark:text-blue-400 font-mono font-bold">ABCD-EFGH-IJKL-MNOP</code>
                                <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors">
                                  <Copy className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            <div className="flex gap-3">
                              <Button variant="outline" className="flex-1 h-14 rounded-2xl" onClick={() => setSetupStep(1)}>Back</Button>
                              <Button className="flex-[2] h-14 rounded-2xl" onClick={() => setSetupStep(3)}>Next</Button>
                            </div>
                          </div>
                        )}

                        {setupStep === 3 && (
                          <div className="space-y-6">
                            <div className="text-center space-y-2">
                              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Verify Setup</h3>
                              <p className="text-gray-500 dark:text-gray-400">Enter the 6-digit code from your authenticator app to confirm setup.</p>
                            </div>

                            <div className="flex justify-center gap-2">
                              <Input 
                                className="w-full h-16 text-center text-3xl font-bold tracking-[0.5em] rounded-2xl"
                                maxLength={6}
                                placeholder="000000"
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                              />
                            </div>

                            <div className="flex gap-3">
                              <Button variant="outline" className="flex-1 h-14 rounded-2xl" onClick={() => setSetupStep(2)}>Back</Button>
                              <Button 
                                className="flex-[2] h-14 rounded-2xl" 
                                onClick={handleVerify2FA}
                                isLoading={is2FALoading}
                                disabled={verificationCode.length !== 6}
                              >
                                Verify
                              </Button>
                            </div>
                          </div>
                        )}

                        {setupStep === 4 && (
                          <div className="space-y-6">
                            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-2xl border border-green-100 dark:border-green-800 flex items-center gap-3">
                              <CheckCircle2 className="w-6 h-6 text-green-600" />
                              <p className="text-sm font-bold text-green-700 dark:text-green-400">Verification successful!</p>
                            </div>

                            <div className="space-y-4">
                              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-2xl border border-yellow-100 dark:border-yellow-800 flex items-start gap-3">
                                <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                                <p className="text-xs text-yellow-700 dark:text-yellow-500">
                                  Save these recovery codes in a safe place. You can use them to access your account if you lose your phone.
                                </p>
                              </div>

                              <div className="grid grid-cols-2 gap-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl font-mono text-sm border border-gray-100 dark:border-gray-700">
                                {recoveryCodes.map((code, i) => (
                                  <div key={i} className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                    <span className="text-[10px] opacity-30">{i + 1}.</span>
                                    <span className="font-bold">{code}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <Button className="w-full h-14 rounded-2xl text-lg" onClick={handleComplete2FA} isLoading={is2FALoading}>
                              Finish Setup
                            </Button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
