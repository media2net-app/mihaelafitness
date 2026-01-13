'use client';

import { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, Globe, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { language, setLanguage, t } = useLanguage();
  const { login, isAuthenticated, user } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  // QR scan removed

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const success = await login(email, password);
      
      if (success) {
        // Wait a bit for auth context to update
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Redirect based on user role from context
        // The user should be available from the login response stored in context
        // Check localStorage for the user data
        const storedUser = localStorage.getItem('auth_user');
        if (storedUser) {
          try {
            const userData = JSON.parse(storedUser);
            const userRole = userData?.role || 'client';
            
            if (userRole === 'admin') {
        router.push('/admin');
            } else {
              router.push('/dashboard');
            }
          } catch {
            // Fallback to dashboard if parsing fails
            router.push('/dashboard');
          }
        } else {
          // Fallback to dashboard if no user data
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

  const fillDemoAccount = () => {
    setEmail('demo-klant@mihaelafitness.com');
    setPassword('demo123');
    setError('');
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

            {/* Demo Account Button */}
            <button
              type="button"
              onClick={fillDemoAccount}
              className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-800 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-medium hover:from-yellow-500 hover:to-yellow-600 transition-all duration-300 shadow-md hover:shadow-lg text-sm sm:text-base flex items-center justify-center gap-2"
            >
              <User className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Demo Account Invullen</span>
            </button>

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

            {/* QR Scan removed */}

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

        {/* QR Modal removed */}
      </div>
    </div>
  );
}