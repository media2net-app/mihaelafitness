'use client';

import { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, Globe, QrCode, ChevronDown, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { language, setLanguage, t } = useLanguage();
  const { login, isAuthenticated } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('demo@mihaelafitness.com');
  const [password, setPassword] = useState('K9mX2pQ7');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showQrDropdown, setShowQrDropdown] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [selectedQrUser, setSelectedQrUser] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const success = await login(email, password);
      
      if (success) {
        // Check if user is demo user and redirect to admin dashboard
        if (email === 'demo@mihaelafitness.com') {
          router.push('/admin');
        } else {
          router.push('/dashboard');
        }
      } else {
        setError('Invalid credentials. Please try again.');
      }
    } catch (error) {
      setError('An error occurred during login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ro' : 'en');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 flex items-center justify-center p-2 sm:p-4">
      <div
        className="w-full max-w-md"
      >
        {/* Language Toggle */}
        <div className="flex justify-end mb-3 sm:mb-6">
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:shadow-md transition-all duration-300 text-gray-700 hover:text-rose-600"
          >
            <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="text-xs sm:text-sm font-medium">
              {language === 'en' ? 'RO' : 'EN'}
            </span>
          </button>
        </div>

        {/* Login Card */}
        <div
          className="bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-8 border border-white/20"
        >
          {/* Header */}
          <div className="text-center mb-4 sm:mb-8">
            <div
              className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-rose-400 to-pink-500 rounded-xl sm:rounded-2xl mx-auto mb-2 sm:mb-4 flex items-center justify-center"
            >
              <span className="text-lg sm:text-2xl font-bold text-white">MF</span>
            </div>
            <h1 className="text-lg sm:text-2xl font-bold text-gray-800 mb-1 sm:mb-2">
              {t.login.title}
            </h1>
            <p className="text-gray-600 text-xs sm:text-sm">
              {t.login.subtitle}
            </p>
          </div>

            {/* Login Form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-4 sm:space-y-6"
          >
            {/* Error Message */}
            {error && (
              <div
                className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm"
              >
                {error}
              </div>
            )}
            {/* Email Field */}
            <div className="space-y-1 sm:space-y-2">
              <label className="text-xs sm:text-sm font-medium text-gray-700">
                {t.login.email}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 bg-gray-50 border border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-300 text-sm sm:text-base"
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1 sm:space-y-2">
              <label className="text-xs sm:text-sm font-medium text-gray-700">
                {t.login.password}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 sm:pl-10 pr-10 sm:pr-12 py-2.5 sm:py-3 bg-gray-50 border border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-300 text-sm sm:text-base"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="text-right">
              <button
                type="button"
                className="text-xs sm:text-sm text-rose-600 hover:text-rose-700 transition-colors duration-200"
              >
                {t.login.forgotPassword}
              </button>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-medium hover:from-rose-600 hover:to-pink-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl text-sm sm:text-base"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  {t.common.loading}
                </div>
              ) : (
                t.login.loginButton
              )}
            </button>

            {/* QR Scan Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowQrDropdown(!showQrDropdown)}
                className="w-full flex items-center justify-center gap-1 sm:gap-2 bg-gray-100 text-gray-700 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-medium hover:bg-gray-200 transition-all duration-300 text-sm sm:text-base"
              >
                <QrCode className="w-4 h-4 sm:w-5 sm:h-5" />
                QR Scan
                <ChevronDown className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform duration-200 ${showQrDropdown ? 'rotate-180' : ''}`} />
              </button>
              
              {showQrDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 z-10">
                  <div className="p-2">
                    <button
                      onClick={() => {
                        setSelectedQrUser('Mihaela');
                        setShowQrModal(true);
                        setShowQrDropdown(false);
                      }}
                      className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Mihaela
                    </button>
                    <button
                      onClick={() => {
                        setSelectedQrUser('Chiel');
                        setShowQrModal(true);
                        setShowQrDropdown(false);
                      }}
                      className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Chiel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Sign Up Link */}
            <div className="text-center pt-2 sm:pt-4">
              <p className="text-xs sm:text-sm text-gray-600">
                {t.login.noAccount}{' '}
                <button
                  type="button"
                  className="text-rose-600 hover:text-rose-700 font-medium transition-colors duration-200"
                >
                  {t.login.signUp}
                </button>
              </p>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div
          className="text-center mt-4 sm:mt-8"
        >
          <p className="text-xs text-gray-500">
            {t.common.copyright}
          </p>
        </div>

        {/* QR Modal */}
        {showQrModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">QR Code - {selectedQrUser}</h2>
                <button
                  onClick={() => setShowQrModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="text-center">
                {selectedQrUser === 'Chiel' ? (
                  <div className="bg-gray-100 rounded-lg p-8">
                    <div className="bg-white rounded-lg p-4 shadow-inner">
                      <img
                        src="/qr-chiel.png"
                        alt="Chiel QR Code"
                        className="w-full h-auto max-w-xs mx-auto"
                        style={{ maxHeight: '300px' }}
                      />
                      <p className="font-medium text-gray-500 mt-4">Chiel QR Code</p>
                      <p className="text-sm text-gray-400 mt-2">Scan to login as Chiel</p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-100 rounded-lg p-8">
                    <div className="bg-white rounded-lg p-4 shadow-inner">
                      <img
                        src="/qr-mihaela.png"
                        alt="Mihaela QR Code"
                        className="w-full h-auto max-w-xs mx-auto"
                        style={{ maxHeight: '300px' }}
                      />
                      <p className="font-medium text-gray-500 mt-4">Mihaela QR Code</p>
                      <p className="text-sm text-gray-400 mt-2">Scan to login as Mihaela</p>
                    </div>
                  </div>
                )}
                
                <div className="mt-6">
                  <button
                    onClick={() => setShowQrModal(false)}
                    className="px-6 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}