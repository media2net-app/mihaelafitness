'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  FiSun, 
  FiUsers, 
  FiCamera, 
  FiMessageCircle, 
  FiBookOpen,
  FiCheck,
  FiArrowRight,
  FiMenu,
  FiX
} from 'react-icons/fi';

export default function SummerfitChallengePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-rose-500 backdrop-blur-md border-b border-rose-600/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center">
              <Image
                src="/logo/Middel 4.svg"
                alt="Mihaela Fitness"
                width={150}
                height={45}
                className="h-10 w-auto brightness-0 invert"
              />
            </Link>
            
            <div className="flex items-center gap-4">
              <Link 
                href="/" 
                className="hidden sm:inline-flex text-white hover:text-white/80 font-medium transition-colors"
              >
                Terug naar home
              </Link>
              <button
                className="bg-white text-rose-600 px-6 py-2.5 rounded-lg font-semibold hover:bg-gray-50 transition-all text-sm"
                onClick={() => window.open('https://wa.me/31612345678?text=Ik%20wil%20meedoen%20aan%20de%20Summerfit%20Challenge!', '_blank')}
              >
                Doe mee via WhatsApp
              </button>
              <button
                className="md:hidden p-2 text-white"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
              </button>
            </div>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-white/20">
              <Link 
                href="/" 
                className="block py-2 text-white hover:text-white/80 font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Terug naar home
              </Link>
              <button
                className="w-full mt-2 bg-white text-rose-600 px-6 py-3 rounded-lg font-semibold"
                onClick={() => {
                  window.open('https://wa.me/31612345678?text=Ik%20wil%20meedoen%20aan%20de%20Summerfit%20Challenge!', '_blank');
                  setMobileMenuOpen(false);
                }}
              >
                Doe mee via WhatsApp
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-amber-400 via-orange-400 to-rose-500 relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/30 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
            <FiSun className="text-amber-600" size={20} />
            <span className="text-white font-semibold text-sm">Gratis - Voor alle klanten</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight drop-shadow-lg">
            Summerfit Challenge
          </h1>
          <p className="text-xl md:text-2xl text-white/95 mb-8 max-w-2xl mx-auto leading-relaxed">
            Samen met gelijkgestemden dat extra stukje presteren voor jouw summer fit body. 
            Doe gratis mee en word onderdeel van de community!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://wa.me/31612345678?text=Ik%20wil%20meedoen%20aan%20de%20Summerfit%20Challenge!"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-white text-rose-600 px-8 py-4 rounded-xl text-lg font-bold hover:bg-gray-50 transition-all transform hover:scale-105 shadow-xl"
            >
              Schrijf je nu in
              <FiArrowRight size={20} />
            </a>
            <a
              href="#hoe-werkt-het"
              className="inline-flex items-center justify-center gap-2 bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white/30 transition-all border-2 border-white/50"
            >
              Hoe werkt het?
            </a>
          </div>
        </div>
      </section>

      {/* What & Why Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 text-center">
            Wat is de Summerfit Challenge?
          </h2>
          <p className="text-lg text-gray-600 text-center mb-12 leading-relaxed">
            Een speciale challenge waarbij alle klanten van Mihaela Fitness mee kunnen doen. 
            Deelname is <strong className="text-rose-600">volledig gratis</strong>. Het doel: 
            samen met gelijkgestemden net even dat stukje extra presteren voor jouw summer fit body.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl p-8 border border-rose-100">
              <div className="w-14 h-14 bg-rose-500 rounded-xl flex items-center justify-center mb-6">
                <FiUsers className="text-white" size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Community</h3>
              <p className="text-gray-600">
                Word onderdeel van een speciale WhatsApp-groep met alle deelnemers. Motiveer elkaar en deel je progressie.
              </p>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-8 border border-amber-100">
              <div className="w-14 h-14 bg-amber-500 rounded-xl flex items-center justify-center mb-6">
                <FiCamera className="text-white" size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Dagelijks bewijs</h3>
              <p className="text-gray-600">
                Stuur elke dag een foto van wat je eet in de WhatsApp-groep. Samen accountable blijven werkt!
              </p>
            </div>
            <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl p-8 border border-rose-100">
              <div className="w-14 h-14 bg-rose-500 rounded-xl flex items-center justify-center mb-6">
                <FiBookOpen className="text-white" size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Tips & recepten</h3>
              <p className="text-gray-600">
                In de app deelt Mihaela exclusieve tips en recepten om jou te helpen je doelen te bereiken.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="hoe-werkt-het" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12 text-center">
            Zo werkt het
          </h2>
          
          <div className="space-y-8">
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-rose-600 text-white rounded-full flex items-center justify-center font-bold">1</div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Meld je aan via WhatsApp</h3>
                <p className="text-gray-600">Stuur een bericht om je aan te melden. Je ontvangt een uitnodiging voor de exclusieve Summerfit Challenge WhatsApp-groep.</p>
              </div>
            </div>
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-rose-600 text-white rounded-full flex items-center justify-center font-bold">2</div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Post dagelijks je maaltijden</h3>
                <p className="text-gray-600">Stuur elke dag een foto van wat je eet in de groep. Dit houdt je accountable en inspireert anderen. Samen sterk!</p>
              </div>
            </div>
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-rose-600 text-white rounded-full flex items-center justify-center font-bold">3</div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Ontvang tips & recepten</h3>
                <p className="text-gray-600">Mihaela deelt in de app regelmatig nieuwe tips en recepten. Gebruik de Mihaela Fitness app om ze te ontdekken.</p>
              </div>
            </div>
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-rose-600 text-white rounded-full flex items-center justify-center font-bold">4</div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Bereik je summer body</h3>
                <p className="text-gray-600">Met de steun van de community en de begeleiding van Mihaela ga je dat extra stukje. Summer ready!</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What you get */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">Wat je krijgt</h2>
          <ul className="space-y-4">
            {['Gratis deelname aan de challenge', 'Toegang tot de exclusieve WhatsApp-groep', 'Dagelijkse accountability met foto\'s van je maaltijden', 'Tips en recepten van Mihaela in de app', 'Community van gelijkgestemden die hetzelfde doel hebben', 'Extra motivatie om je summer fit body te bereiken'].map((item, i) => (
              <li key={i} className="flex items-start gap-4">
                <FiCheck className="flex-shrink-0 text-rose-600 mt-1" size={22} />
                <span className="text-gray-700 text-lg">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-rose-600 to-pink-600 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <FiMessageCircle className="mx-auto mb-6" size={64} />
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Klaar voor je summer body?</h2>
          <p className="text-xl mb-8 opacity-95">Meld je nu aan via WhatsApp en word onderdeel van de Summerfit Challenge. Gratis, voor alle klanten van Mihaela Fitness. Let's go!!</p>
          <a href="https://wa.me/31612345678?text=Ik%20wil%20meedoen%20aan%20de%20Summerfit%20Challenge!" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 bg-white text-rose-600 px-10 py-4 rounded-xl text-lg font-bold hover:bg-gray-50 transition-all transform hover:scale-105 shadow-xl">
            Doe mee via WhatsApp
            <FiArrowRight size={20} />
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <Link href="/" className="flex items-center">
            <Image src="/logo/Middel 4.svg" alt="Mihaela Fitness" width={120} height={36} className="h-9 w-auto brightness-0 invert opacity-90" />
          </Link>
          <p className="text-gray-400 text-sm text-center md:text-right">© {new Date().getFullYear()} Mihaela Fitness. Summerfit Challenge – Gratis voor alle klanten.</p>
          <Link href="/" className="text-rose-400 hover:text-rose-300 text-sm font-medium transition-colors">Terug naar home</Link>
        </div>
      </footer>
    </div>
  );
}
