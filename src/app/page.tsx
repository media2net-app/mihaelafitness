'use client';

import Image from 'next/image';
import { useLanguage } from '@/contexts/LanguageContext';
import { Calendar, Clock, User, Mail, Phone, ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function HomePage() {
  const { t, setLanguage } = useLanguage();
  const [showForm, setShowForm] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    preferredDate: '',
    preferredTime: '',
    message: ''
  });
  const [availableSlots, setAvailableSlots] = useState<Array<{start: string, end: string, available: boolean}>>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [availableDays, setAvailableDays] = useState<Array<{date: string, dayName: string, available: boolean}>>([]);
  const [loadingDays, setLoadingDays] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showNotifyForm, setShowNotifyForm] = useState(false);
  const [notifyFormData, setNotifyFormData] = useState({
    name: '',
    email: '',
    interests: [] as string[]
  });

  // Lightweight toast notifications (no chat, no options)
  const [currentToastIndex, setCurrentToastIndex] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const toastMessages = [
    'Bună! Bine ai venit la Mihaela Fitness',
    'Te ajut să atingi un stil de viață sănătos',
    'Ofer antrenamente 1:1 și în grup la Galaxy Gym în Găești',
    'Nu ești aproape? Am și program online pentru acasă sau altă sală'
  ];

  // Get coaching content from translations
  const coachingContent = t.homepage.coaching;

  // Language switch and chat removed

  // Chat and toast removed

  // Force Romanian on homepage regardless of saved preference
  useEffect(() => {
    setLanguage('ro');
  }, [setLanguage]);

  // Show toast messages once (no loop)
  useEffect(() => {
    if (showForm || showNotifyForm) {
      setShowToast(false);
      return;
    }

    let hideTimeout: NodeJS.Timeout | null = null;
    let nextMessageTimeout: NodeJS.Timeout | null = null;

    // Only show if we haven't shown all messages yet
    if (currentToastIndex < toastMessages.length) {
      setShowToast(true);
      
      hideTimeout = setTimeout(() => {
        setShowToast(false);
        
        // Move to next message if not at the end
        if (currentToastIndex < toastMessages.length - 1) {
          nextMessageTimeout = setTimeout(() => {
            setCurrentToastIndex((prev) => prev + 1);
          }, 400); // small delay to allow fade-out
        }
      }, 4500); // toast visible duration
    }

    return () => {
      if (hideTimeout) clearTimeout(hideTimeout);
      if (nextMessageTimeout) clearTimeout(nextMessageTimeout);
    };
  }, [showForm, showNotifyForm, currentToastIndex, toastMessages.length]);

  const showIntakeForm = () => {
    console.log('🎯 DEBUG: showIntakeForm called - opening intake form');
    setIsAnimating(true);
    setTimeout(() => {
      setShowForm(true);
      setIsAnimating(false);
      console.log('📝 Form opened, calling fetchAvailableDays...');
      fetchAvailableDays(); // Load available days when form opens
    }, 400); // Half of the animation duration
  };

  const hideIntakeForm = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setShowForm(false);
      setIsAnimating(false);
      setAvailableSlots([]); // Reset available slots when hiding the form
      setAvailableDays([]); // Reset available days when hiding the form
    }, 400);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    console.log(`🔄 DEBUG: handleInputChange - ${name}: ${value}`);
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // If date is changed, fetch available slots
    if (name === 'preferredDate' && value) {
      console.log('📅 Date selected, calling fetchAvailableSlots for:', value);
      fetchAvailableSlots(value);
    }
  };

  const fetchAvailableDays = async () => {
    setLoadingDays(true);
    try {
      // Generate next 14 days
      const days = [];
      const today = new Date();
      console.log('🗓️ DEBUG: Starting fetchAvailableDays, today:', today.toDateString());
      
      for (let i = 1; i <= 14; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        const dayOfWeek = date.getDay();
        const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
        const isWeekend = dayOfWeek === 0; // Only Sunday is closed
        
        console.log(`📅 Day ${i}: ${date.toDateString()} (${dayName}, ${dayOfWeek}) - ${isWeekend ? 'WEEKEND BLOCKED' : 'WORKDAY INCLUDED'}`);
        
        // Skip Sunday (closed day)
        const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD format
        const isClosed = isWeekend; // Only Sunday closed
        
        if (!isClosed) {
          const dayNameFormatted = date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'short', 
            day: 'numeric' 
          });
          
          days.push({
            date: dateString,
            dayName: dayNameFormatted,
            available: true
          });
          console.log(`✅ Added to available days: ${dateString} (${dayNameFormatted})`);
        } else {
          console.log(`❌ Skipped SUNDAY CLOSED: ${date.toDateString()} (${dayName})`);
        }
      }
      
      console.log('📋 Final available days:', days);
      setAvailableDays(days);
    } catch (error) {
      console.error('Error fetching available days:', error);
      setAvailableDays([]);
    } finally {
      setLoadingDays(false);
    }
  };

  const fetchAvailableSlots = async (date: string) => {
    setLoadingSlots(true);
    console.log('🕐 DEBUG: fetchAvailableSlots called for date:', date);
    
    try {
      const response = await fetch(`/api/available-slots?date=${date}`);
      console.log('📡 API Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📊 API Response data:', data);
        
        setAvailableSlots(data.availableSlots);
        
        // Show weekend message if it's a weekend
        if (data.weekend && data.message) {
          console.log('🏖️ WEEKEND DETECTED:', data.message);
        } else {
          console.log('✅ Available slots count:', data.availableSlots.length);
        }
      } else {
        console.log('❌ API Error:', response.status, response.statusText);
        setAvailableSlots([]);
      }
    } catch (error) {
      console.error('💥 Error fetching available slots:', error);
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/intake', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('Mulțumim! Vă vom contacta în curând pentru a programa consultația gratuită.');
        setShowForm(false);
        setFormData({
          name: '',
          email: '',
          phone: '',
          preferredDate: '',
          preferredTime: '',
          message: ''
        });
        setAvailableSlots([]);
        setAvailableDays([]);
      } else {
        throw new Error('Failed to submit form');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Ne pare rău, a apărut o eroare la trimiterea cererii. Vă rugăm să încercați din nou.');
    }
  };

  const showNotifyMeForm = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setShowNotifyForm(true);
      setIsAnimating(false);
    }, 400);
  };

  const hideNotifyForm = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setShowNotifyForm(false);
      setIsAnimating(false);
    }, 400);
  };

  const handleNotifyInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNotifyFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleInterestToggle = (interest: string) => {
    setNotifyFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleNotifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      console.log('Submitting online coaching registration:', notifyFormData);
      
      const response = await fetch('/api/online-coaching-registration-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: notifyFormData.name,
          email: notifyFormData.email,
          interests: notifyFormData.interests,
          program: 'Online Coaching',
          notes: 'Interested in: ' + notifyFormData.interests.join(', ')
        }),
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (response.ok) {
        const result = await response.json();
        console.log('Registration successful:', result);
        alert('Mulțumim! Te vom contacta în curând pentru programul de coaching online.');
        setShowNotifyForm(false);
        setNotifyFormData({
          name: '',
          email: '',
          interests: []
        });
      } else {
        const errorData = await response.json();
        console.error('Registration failed:', errorData);
        throw new Error(errorData.error || 'Failed to submit online coaching registration');
      }
    } catch (error) {
      console.error('Error submitting online coaching registration:', error);
      alert('Ne pare rău, a apărut o eroare. Vă rugăm încercați din nou mai târziu.');
    }
  };

  return (
    <div className="homepage-container">
      <div className="homepage-wrapper">
        <header className="homepage-header">
          <div className="homepage-logo-container">
            <Image 
              src="/logo/Middel 4.svg" 
              alt="Mihaela Fitness Logo" 
              className="homepage-logo"
              width={200}
              height={60}
            />
          </div>
          {/* Sign In removed */}
        </header>
        
        <main className="homepage-main-content">
          <div className="homepage-hero-section">
            {!showForm && !showNotifyForm ? (
              <div className={`homepage-text-content ${isAnimating ? 'fade-out-down' : ''}`}>
                {selectedOption ? (
                  <>
                    <h1 className="homepage-main-title">{coachingContent[selectedOption as keyof typeof coachingContent].title}</h1>
                    <p className="homepage-subtitle">{coachingContent[selectedOption as keyof typeof coachingContent].description}</p>
                    <div className="homepage-features">
                      <ul>
                        {coachingContent[selectedOption as keyof typeof coachingContent].features.map((feature, index) => (
                          <li key={index}>{feature}</li>
                        ))}
                      </ul>
                    </div>
                    {!coachingContent[selectedOption as keyof typeof coachingContent].available && (
                      <>
                        <p className="homepage-coming-soon">({t.homepage.comingSoon})</p>
                        <div className="homepage-cta-buttons">
                          <button 
                            onClick={showNotifyMeForm}
                            className="homepage-btn homepage-btn-primary"
                          >
                            {t.homepage.notifyForm.button}
                          </button>
                        </div>
                      </>
                    )}
                    {coachingContent[selectedOption as keyof typeof coachingContent].available && (
                      <div className="homepage-cta-buttons">
                        <button 
                          onClick={showIntakeForm}
                          className="homepage-btn homepage-btn-primary"
                        >
                          {t.homepage.startNow}
                        </button>
                      </div>
                    )}
                    
                    {/* Coaching Option Buttons - also show when option is selected */}
                    <div className="homepage-coaching-options">
                      <button 
                        onClick={() => setSelectedOption(selectedOption === '1:1' ? null : '1:1')}
                        className={`homepage-coaching-option-btn ${selectedOption === '1:1' ? 'active' : ''}`}
                      >
                        🏋️ Personal Training 1:1
                      </button>
                      <button 
                        onClick={() => setSelectedOption(selectedOption === 'group' ? null : 'group')}
                        className={`homepage-coaching-option-btn ${selectedOption === 'group' ? 'active' : ''}`}
                      >
                        👥 Antrenament în Grup
                      </button>
                      <button 
                        onClick={() => setSelectedOption(selectedOption === 'online' ? null : 'online')}
                        className={`homepage-coaching-option-btn ${selectedOption === 'online' ? 'active' : ''}`}
                      >
                        💻 Online Coaching
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <h1 className="homepage-main-title">{t.homepage.title}</h1>
                    <p className="homepage-subtitle">{t.homepage.subtitle}</p>
                    <p className="homepage-description">
                      {t.homepage.description}<br /><br />
                      {t.homepage.signature}
                    </p>
                    <div className="homepage-cta-buttons">
                      <button 
                        onClick={showIntakeForm}
                        className="homepage-btn homepage-btn-primary"
                      >
                        {t.homepage.startNow}
                      </button>
                    </div>

                    {/* Coaching Option Buttons */}
                    <div className="homepage-coaching-options">
                      <button 
                        onClick={() => setSelectedOption(selectedOption === '1:1' ? null : '1:1')}
                        className={`homepage-coaching-option-btn ${selectedOption === '1:1' ? 'active' : ''}`}
                      >
                        🏋️ Personal Training 1:1
                      </button>
                      <button 
                        onClick={() => setSelectedOption(selectedOption === 'group' ? null : 'group')}
                        className={`homepage-coaching-option-btn ${selectedOption === 'group' ? 'active' : ''}`}
                      >
                        👥 Antrenament în Grup
                      </button>
                      <button 
                        onClick={() => setSelectedOption(selectedOption === 'online' ? null : 'online')}
                        className={`homepage-coaching-option-btn ${selectedOption === 'online' ? 'active' : ''}`}
                      >
                        💻 Online Coaching
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : showForm ? (
              <div className="homepage-intake-form" style={{ paddingBottom: '120px' }}>
                <div className="homepage-form-header">
                  <button 
                    onClick={hideIntakeForm}
                    className="homepage-btn homepage-btn-back"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    {t.homepage.intakeForm.back}
                  </button>
                  <h2 className="homepage-form-title">{t.homepage.intakeForm.title}</h2>
                  <p className="homepage-form-subtitle">{t.homepage.intakeForm.subtitle}</p>
                </div>
                
                <form onSubmit={handleSubmit} className="homepage-form">
                  <div className="homepage-form-group">
                    <label htmlFor="name" className="homepage-form-label">
                      <User className="w-4 h-4" />
                      {t.homepage.intakeForm.name}
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="homepage-form-input"
                    />
                  </div>

                  <div className="homepage-form-group">
                    <label htmlFor="email" className="homepage-form-label">
                      <Mail className="w-4 h-4" />
                      {t.homepage.intakeForm.email}
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="homepage-form-input"
                    />
                  </div>

                  <div className="homepage-form-group">
                    <label htmlFor="phone" className="homepage-form-label">
                      <Phone className="w-4 h-4" />
                      {t.homepage.intakeForm.phone}
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="homepage-form-input"
                    />
                  </div>

                  <div className="homepage-form-row">
                    <div className="homepage-form-group">
                      <label htmlFor="preferredDate" className="homepage-form-label">
                        <Calendar className="w-4 h-4" />
                        {t.homepage.intakeForm.preferredDate}
                      </label>
                      <select
                        id="preferredDate"
                        name="preferredDate"
                        value={formData.preferredDate}
                        onChange={handleInputChange}
                        className="homepage-form-input"
                        disabled={loadingDays}
                      >
                        <option value="">
                          {loadingDays 
                            ? 'Loading available days...' 
                            : availableDays.length === 0 
                            ? 'No available days' 
                            : 'Select a day'
                          }
                        </option>
                        {availableDays.map((day) => (
                          <option key={day.date} value={day.date}>
                            {day.dayName}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="homepage-form-group">
                      <label htmlFor="preferredTime" className="homepage-form-label">
                        <Clock className="w-4 h-4" />
                        {t.homepage.intakeForm.preferredTime}
                      </label>
                      <select
                        id="preferredTime"
                        name="preferredTime"
                        value={formData.preferredTime}
                        onChange={handleInputChange}
                        className="homepage-form-input"
                        disabled={!formData.preferredDate || loadingSlots}
                      >
                        <option value="">
                          {!formData.preferredDate 
                            ? 'Select date first' 
                            : loadingSlots 
                            ? 'Loading available times...' 
                            : availableSlots.length === 0 
                            ? (() => {
                                const selectedDate = new Date(formData.preferredDate);
                                const dayOfWeek = selectedDate.getDay();
                                const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // Sunday=0, Saturday=6
                                if (isWeekend) {
                                  return 'Weekend in Holland';
                                }
                                return 'No available times';
                              })()
                            : 'Select time'
                          }
                        </option>
                        {availableSlots.map((slot) => (
                          <option key={slot.start} value={slot.start}>
                            {slot.start} - {slot.end}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="homepage-form-group">
                    <label htmlFor="message" className="homepage-form-label">
                      {t.homepage.intakeForm.message}
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      rows={4}
                      className="homepage-form-textarea"
                    />
                  </div>

                  <button type="submit" className="homepage-btn homepage-btn-primary homepage-form-submit">
                    {t.homepage.intakeForm.submit}
                  </button>
                </form>
              </div>
            ) : (
              <div className="homepage-intake-form" style={{ paddingBottom: '120px' }}>
                <div className="homepage-form-header">
                  <button 
                    onClick={hideNotifyForm}
                    className="homepage-btn homepage-btn-back"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    {t.homepage.notifyForm.back}
                  </button>
                  <h2 className="homepage-form-title">{t.homepage.notifyForm.title}</h2>
                  <p className="homepage-form-subtitle">{t.homepage.notifyForm.subtitle}</p>
                </div>
                
                <form onSubmit={handleNotifySubmit} className="homepage-form">
                  <div className="homepage-form-group">
                    <label htmlFor="notify-name" className="homepage-form-label">
                      <User className="w-4 h-4" />
                      {t.homepage.notifyForm.name}
                    </label>
                    <input
                      type="text"
                      id="notify-name"
                      name="name"
                      value={notifyFormData.name}
                      onChange={handleNotifyInputChange}
                      required
                      className="homepage-form-input"
                    />
                  </div>

                  <div className="homepage-form-group">
                    <label htmlFor="notify-email" className="homepage-form-label">
                      <Mail className="w-4 h-4" />
                      {t.homepage.notifyForm.email}
                    </label>
                    <input
                      type="email"
                      id="notify-email"
                      name="email"
                      value={notifyFormData.email}
                      onChange={handleNotifyInputChange}
                      required
                      className="homepage-form-input"
                    />
                  </div>

                  <div className="homepage-form-group">
                    <label className="homepage-form-label">
                      {t.homepage.notifyForm.interests}
                    </label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
                      {Object.entries(t.homepage.notifyForm.interestOptions).map(([key, label]) => (
                        <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={notifyFormData.interests.includes(key)}
                            onChange={() => handleInterestToggle(key)}
                            style={{ 
                              width: '18px', 
                              height: '18px', 
                              cursor: 'pointer',
                              accentColor: '#e63946'
                            }}
                          />
                          <span style={{ fontSize: '16px' }}>{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <button type="submit" className="homepage-btn homepage-btn-primary homepage-form-submit">
                    {t.homepage.notifyForm.submit}
                  </button>
                </form>
              </div>
            )}
          </div>
        </main>
        
        {/* Footer action buttons removed */}
        
        {/* Fixed background image */}
        <div className="homepage-fixed-background-image">
          <Image 
            src="/media/mihaela-vrijstaand.png" 
            alt="Mihaela" 
            className="homepage-background-image"
            width={800}
            height={1000}
            priority
          />
        </div>

        {/* Toast Notifications (simple, non-interactive) */}
        {!showForm && !showNotifyForm && (
          <div className={`homepage-toast ${showToast ? 'homepage-toast-show' : 'homepage-toast-hide'}`}>
            <div className="homepage-toast-content">
              <div className="homepage-toast-avatar">
                <span>MF</span>
              </div>
              <div className="homepage-toast-message">
                {toastMessages[currentToastIndex]}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
