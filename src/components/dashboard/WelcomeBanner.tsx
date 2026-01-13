'use client';

import { Sparkles } from 'lucide-react';

interface WelcomeBannerProps {
  userName: string;
}

export default function WelcomeBanner({ userName }: WelcomeBannerProps) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Goedemorgen';
    if (hour < 18) return 'Goedemiddag';
    return 'Goedenavond';
  };

  const getMotivationalMessage = () => {
    const messages = [
      "Laten we vandaag rocken! 💪",
      "Je bent op de goede weg! 🚀",
      "Elke stap telt! 👟",
      "Blijf gefocust! 🎯",
      "Je doet het geweldig! ⭐"
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  return (
    <div className="bg-gradient-to-r from-rose-500 to-pink-600 rounded-2xl p-6 sm:p-8 text-white mb-6 shadow-lg">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5" />
            <span className="text-sm sm:text-base opacity-90">
              {getGreeting()}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">
            Welkom terug, {userName.split(' ')[0]} 👋
          </h2>
          <p className="text-base sm:text-lg opacity-90">
            {getMotivationalMessage()}
          </p>
        </div>
        <div className="hidden sm:block">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <Sparkles className="w-8 h-8" />
          </div>
        </div>
      </div>
    </div>
  );
}

