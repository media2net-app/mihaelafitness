'use client';

import { useState } from 'react';
import Image from 'next/image';
import { 
  FiMenu, 
  FiX, 
  FiSunrise, 
  FiMoon, 
  FiActivity, 
  FiHeart,
  FiCheck,
  FiArrowRight,
  FiChevronDown,
  FiChevronUp
} from 'react-icons/fi';

export default function Homepage2() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      question: "What is Mihaela Fitness exactly?",
      answer: "Mihaela Fitness is a comprehensive fitness coaching platform combining personalized training, nutrition guidance, and mindset coaching. It's your all-in-one personal trainer and nutritionist in one place."
    },
    {
      question: "How much does it cost?",
      answer: "We offer flexible pricing plans starting from €49 per month for online coaching, with personal training and group sessions available at competitive rates. Contact us for a personalized quote."
    },
    {
      question: "Do I need any equipment?",
      answer: "No, you don't need any special equipment. We design workouts that can be done at home, in the gym, or anywhere you prefer. We'll adapt the program to what you have available."
    },
    {
      question: "Can I really get personalized coaching?",
      answer: "Yes! Every client receives personalized attention. Whether it's 1:1 training, group sessions, or online coaching, we tailor the program to your goals, fitness level, and lifestyle."
    },
    {
      question: "Is Mihaela Fitness only for advanced athletes?",
      answer: "Not at all. Whether you're a complete beginner or experienced, Mihaela Fitness adapts to your level and goals, including fat loss, strength building, or general fitness improvement."
    },
    {
      question: "How do I get started?",
      answer: "Just choose a plan, sign up, and we will guide you through the next steps. You'll receive everything you need to begin your health journey right away, including a free consultation."
    }
  ];

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Image
                src="/logo/Middel 4.svg"
                alt="Mihaela Fitness"
                width={150}
                height={45}
                className="h-10 w-auto brightness-0 invert"
              />
            </div>
            
            {/* Menu Button */}
            <button
              className="bg-white/20 backdrop-blur-sm text-white px-6 py-2 rounded-lg font-semibold hover:bg-white/30 transition-all border border-white/30 uppercase text-sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? 'Close' : 'Menu'}
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 bg-rose-600/95 backdrop-blur-md z-40 md:hidden">
            <div className="flex flex-col h-full">
              <div className="flex justify-between items-center px-4 py-4 border-b border-white/20">
                <Image
                  src="/logo/Middel 4.svg"
                  alt="Mihaela Fitness"
                  width={150}
                  height={45}
                  className="h-10 w-auto brightness-0 invert"
                />
                <button
                  className="text-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FiX size={24} />
                </button>
              </div>
              <div className="flex-1 px-4 pt-8 space-y-4">
                <a href="#about" className="block py-3 text-white text-xl font-semibold border-b border-white/20" onClick={() => setMobileMenuOpen(false)}>About</a>
                <a href="#programs" className="block py-3 text-white text-xl font-semibold border-b border-white/20" onClick={() => setMobileMenuOpen(false)}>Programs</a>
                <a href="#pricing" className="block py-3 text-white text-xl font-semibold border-b border-white/20" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
                <a href="#faq" className="block py-3 text-white text-xl font-semibold border-b border-white/20" onClick={() => setMobileMenuOpen(false)}>FAQ</a>
                <a href="#contact" className="block py-3 text-white text-xl font-semibold border-b border-white/20" onClick={() => setMobileMenuOpen(false)}>Contact</a>
                <button className="w-full bg-white text-rose-600 px-6 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors mt-8">
                  Get Started
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Desktop Menu Overlay */}
        {mobileMenuOpen && (
          <div className="hidden md:block fixed inset-0 bg-rose-600/95 backdrop-blur-md z-40">
            <div className="flex flex-col h-full">
              <div className="flex justify-between items-center px-8 py-6 border-b border-white/20">
                <Image
                  src="/logo/Middel 4.svg"
                  alt="Mihaela Fitness"
                  width={150}
                  height={45}
                  className="h-10 w-auto brightness-0 invert"
                />
                <button
                  className="text-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FiX size={24} />
                </button>
              </div>
              <div className="flex-1 flex items-center justify-center">
                <div className="grid grid-cols-2 gap-8 max-w-4xl">
                  <div className="space-y-4">
                    <a href="#about" className="block text-white text-2xl font-semibold hover:opacity-80 transition-opacity" onClick={() => setMobileMenuOpen(false)}>About</a>
                    <a href="#programs" className="block text-white text-2xl font-semibold hover:opacity-80 transition-opacity" onClick={() => setMobileMenuOpen(false)}>Programs</a>
                    <a href="#pricing" className="block text-white text-2xl font-semibold hover:opacity-80 transition-opacity" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
                  </div>
                  <div className="space-y-4">
                    <a href="#faq" className="block text-white text-2xl font-semibold hover:opacity-80 transition-opacity" onClick={() => setMobileMenuOpen(false)}>FAQ</a>
                    <a href="#contact" className="block text-white text-2xl font-semibold hover:opacity-80 transition-opacity" onClick={() => setMobileMenuOpen(false)}>Contact</a>
                    <button className="bg-white text-rose-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors">
                      Get Started
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-rose-500 via-pink-500 to-rose-600 relative overflow-hidden min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto w-full relative z-10">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Left Section - Text */}
            <div className="relative text-white">
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight">
                Your goals.<br />
                My coaching. One app.
              </h1>
              <p className="text-xl md:text-2xl mb-8 max-w-2xl opacity-95">
                I'll guide your training, nutrition, and mindset, every step of the way. 
                The early offer is open. Let's get to work.
              </p>
              <button className="bg-white text-rose-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg flex items-center gap-2 inline-flex">
                Claim your 30% off
                <FiArrowRight className="text-rose-600" size={20} />
              </button>
            </div>

            {/* Right Section - Standing Image */}
            <div className="relative flex justify-center md:justify-end">
              <div className="relative w-full max-w-sm md:max-w-md lg:max-w-lg">
                <Image
                  src="/media/mihaela-vrijstaand.png"
                  alt="Mihaela Fitness"
                  width={600}
                  height={1000}
                  className="w-full h-auto object-contain drop-shadow-2xl"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom Right Button */}
        <div className="absolute bottom-8 right-8 z-20">
          <button className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-lg text-sm font-semibold hover:bg-white/30 transition-all border border-white/30">
            Get the app
          </button>
        </div>
      </section>

      {/* Fuel. Move. Grow. Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Fuel. Move. Grow.
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Training should build more than strength. It builds mindset, focus, and confidence. 
              This is the method I've used for years, the same mindset that helped me perform at my best. 
              Now it's your turn.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Well-being */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-8 hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mb-6">
                <FiHeart className="text-white text-2xl" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Well-being</h3>
              <p className="text-lg font-semibold text-gray-700 mb-4">Stronger mind, Stronger body</p>
              <p className="text-gray-600 mb-6">
                Build mental resilience alongside physical strength. Our approach combines effective workouts 
                with mindfulness practices to achieve sustainable results.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center text-gray-700">
                  <FiCheck className="text-purple-600 mr-2" />
                  Guided meditation sessions
                </li>
                <li className="flex items-center text-gray-700">
                  <FiCheck className="text-purple-600 mr-2" />
                  Stress management techniques
                </li>
                <li className="flex items-center text-gray-700">
                  <FiCheck className="text-purple-600 mr-2" />
                  Mindful movement practices
                </li>
              </ul>
            </div>

            {/* Nutrition */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-8 hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mb-6">
                <FiSunrise className="text-white text-2xl" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Nutrition</h3>
              <p className="text-lg font-semibold text-gray-700 mb-4">Fuel Your Body the Right Way</p>
              <p className="text-gray-600 mb-6">
                Personalized nutrition plans that fit your lifestyle. No diets, no guessing – 
                just smart, sustainable habits that make you feel good.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center text-gray-700">
                  <FiCheck className="text-green-600 mr-2" />
                  Custom meal plans
                </li>
                <li className="flex items-center text-gray-700">
                  <FiCheck className="text-green-600 mr-2" />
                  Macro tracking & guidance
                </li>
                <li className="flex items-center text-gray-700">
                  <FiCheck className="text-green-600 mr-2" />
                  Recipe suggestions
                </li>
              </ul>
            </div>

            {/* Movement */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-6">
                <FiActivity className="text-white text-2xl" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Movement</h3>
              <p className="text-lg font-semibold text-gray-700 mb-4">With me, every workout has a purpose.</p>
              <p className="text-gray-600 mb-6">
                From strength training to cardio, every session is designed to move you closer to your goals. 
                Track progress, celebrate wins, and stay consistent.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center text-gray-700">
                  <FiCheck className="text-blue-600 mr-2" />
                  Personalized workout plans
                </li>
                <li className="flex items-center text-gray-700">
                  <FiCheck className="text-blue-600 mr-2" />
                  Progress tracking
                </li>
                <li className="flex items-center text-gray-700">
                  <FiCheck className="text-blue-600 mr-2" />
                  Form corrections & tips
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-5xl md:text-6xl font-bold text-rose-500 mb-2">500+</div>
              <div className="text-xl text-gray-300">Active Members</div>
            </div>
            <div>
              <div className="text-5xl md:text-6xl font-bold text-rose-500 mb-2">10K+</div>
              <div className="text-xl text-gray-300">Sessions Completed</div>
            </div>
            <div>
              <div className="text-5xl md:text-6xl font-bold text-rose-500 mb-2">2.5M+</div>
              <div className="text-xl text-gray-300">Calories Burnt</div>
            </div>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            This isn't theory, it works.
          </h2>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            People everywhere are getting stronger, leaner, and more confident, because they follow 
            the plan and stay consistent. I'll coach you the same way. No quick fixes. 
            Just real results that last.
          </p>
          <button className="bg-rose-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-rose-700 transition-all transform hover:scale-105 shadow-lg">
            Get Started
          </button>
        </div>
      </section>

      {/* Four Pillars Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              One app. Four pillars.<br />
              A stronger you.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Move smarter</h3>
              <p className="text-lg text-gray-600 mb-6">
                Train with purpose. From strength sessions that track every rep to quick bodyweight 
                challenges that test your limits. Every rep counts, every win goes to the leaderboard, 
                and I'll keep you pushing for more.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <FiCheck className="text-rose-600 mr-3 mt-1 text-xl" />
                  <span className="text-gray-700">Track every rep with detailed logging</span>
                </li>
                <li className="flex items-start">
                  <FiCheck className="text-rose-600 mr-3 mt-1 text-xl" />
                  <span className="text-gray-700">Take on quick, high-energy challenges</span>
                </li>
                <li className="flex items-start">
                  <FiCheck className="text-rose-600 mr-3 mt-1 text-xl" />
                  <span className="text-gray-700">Compete with friends and climb the leaderboard</span>
                </li>
              </ul>
            </div>
            <div className="bg-gray-200 rounded-2xl aspect-video flex items-center justify-center">
              <span className="text-gray-400">Workout Preview Image</span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center mt-16">
            <div className="bg-gray-200 rounded-2xl aspect-video flex items-center justify-center order-2 md:order-1">
              <span className="text-gray-400">Nutrition Tracking Image</span>
            </div>
            <div className="order-1 md:order-2">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Eat better</h3>
              <p className="text-lg text-gray-600 mb-6">
                Nutrition made simple. Log your meals, get instant insights, and learn what fuels 
                your body best. No diets, no guessing – just smart, sustainable habits that make you feel good.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <FiCheck className="text-green-600 mr-3 mt-1 text-xl" />
                  <span className="text-gray-700">Log your meals in seconds</span>
                </li>
                <li className="flex items-start">
                  <FiCheck className="text-green-600 mr-3 mt-1 text-xl" />
                  <span className="text-gray-700">Get goal-based recipes you'll actually enjoy</span>
                </li>
                <li className="flex items-start">
                  <FiCheck className="text-green-600 mr-3 mt-1 text-xl" />
                  <span className="text-gray-700">Build healthy habits that last</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center mt-16">
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Stronger mind</h3>
              <p className="text-lg text-gray-600 mb-6">
                True strength starts within. With guided mindset sessions, you'll learn to reset, 
                refocus, and stay in control — in and out of the gym.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <FiCheck className="text-purple-600 mr-3 mt-1 text-xl" />
                  <span className="text-gray-700">Guided meditations to calm your mind and recharge focus</span>
                </li>
                <li className="flex items-start">
                  <FiCheck className="text-purple-600 mr-3 mt-1 text-xl" />
                  <span className="text-gray-700">Breathwork sessions to reduce stress and boost energy</span>
                </li>
                <li className="flex items-start">
                  <FiCheck className="text-purple-600 mr-3 mt-1 text-xl" />
                  <span className="text-gray-700">Affirmations to build lasting mental strength</span>
                </li>
              </ul>
            </div>
            <div className="bg-gray-200 rounded-2xl aspect-video flex items-center justify-center">
              <span className="text-gray-400">Mindfulness Preview Image</span>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Simple. Effective. Life-Changing.</h2>
            <p className="text-xl text-gray-600">Choose the plan that works for you</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Monthly Plan */}
            <div className="border-2 border-gray-200 rounded-2xl p-8 hover:border-rose-600 transition-colors">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Monthly</h3>
                <div className="text-4xl font-bold text-gray-900 mb-1">€49</div>
                <div className="text-gray-600">/month</div>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <FiCheck className="text-rose-600 mr-3 mt-1" />
                  <span className="text-gray-700">Personalized workout plans</span>
                </li>
                <li className="flex items-start">
                  <FiCheck className="text-rose-600 mr-3 mt-1" />
                  <span className="text-gray-700">Nutrition guidance & meal plans</span>
                </li>
                <li className="flex items-start">
                  <FiCheck className="text-rose-600 mr-3 mt-1" />
                  <span className="text-gray-700">Progress tracking</span>
                </li>
                <li className="flex items-start">
                  <FiCheck className="text-rose-600 mr-3 mt-1" />
                  <span className="text-gray-700">Weekly check-ins</span>
                </li>
                <li className="flex items-start">
                  <FiCheck className="text-rose-600 mr-3 mt-1" />
                  <span className="text-gray-700">24/7 app access</span>
                </li>
              </ul>
              <button className="w-full bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors">
                Get started
              </button>
            </div>

            {/* Yearly Plan */}
            <div className="border-2 border-rose-600 rounded-2xl p-8 bg-gradient-to-br from-rose-50 to-white relative">
              <div className="absolute top-4 right-4 bg-rose-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                Popular
              </div>
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Yearly</h3>
                <div className="text-4xl font-bold text-gray-900 mb-1">€39</div>
                <div className="text-gray-600">/month</div>
                <div className="text-sm text-gray-500 mt-2">€468/year (2 months free)</div>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <FiCheck className="text-rose-600 mr-3 mt-1" />
                  <span className="text-gray-700">Everything in Monthly</span>
                </li>
                <li className="flex items-start">
                  <FiCheck className="text-rose-600 mr-3 mt-1" />
                  <span className="text-gray-700">2 months free every year</span>
                </li>
                <li className="flex items-start">
                  <FiCheck className="text-rose-600 mr-3 mt-1" />
                  <span className="text-gray-700">Priority support</span>
                </li>
                <li className="flex items-start">
                  <FiCheck className="text-rose-600 mr-3 mt-1" />
                  <span className="text-gray-700">Exclusive content</span>
                </li>
                <li className="flex items-start">
                  <FiCheck className="text-rose-600 mr-3 mt-1" />
                  <span className="text-gray-700">Best value</span>
                </li>
              </ul>
              <button className="w-full bg-rose-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-rose-700 transition-colors">
                Get started
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Got questions?<br />
              I've got you.
            </h2>
            <p className="text-xl text-gray-600">
              Starting something new can raise questions, that's normal.<br />
              Check the FAQ and get the answers you need to start strong.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-6 py-4 flex justify-between items-center text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="text-lg font-semibold text-gray-900">{faq.question}</span>
                  {openFaq === index ? (
                    <FiChevronUp className="text-gray-600" />
                  ) : (
                    <FiChevronDown className="text-gray-600" />
                  )}
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-4 text-gray-600 leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-rose-600 to-pink-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            This Is your rise —<br />
            A manifesto for change
          </h2>
          <p className="text-xl mb-8 opacity-90">
            This isn't just about training harder or eating cleaner. It's about reclaiming your energy, 
            your confidence, and your life. Mihaela Fitness is built on the belief that fitness should be 
            simple, personal, and sustainable.
          </p>
          <p className="text-lg mb-8 opacity-90">
            We believe in small steps that lead to big wins.<br />
            We believe in tools that guide, not overwhelm.<br />
            We believe in strength of body, clarity of mind, and balance in life.
          </p>
          <p className="text-xl font-semibold mb-8">
            This is more than an app.<br />
            It's a commitment to yourself.<br />
            It's a movement towards the best version of you.
          </p>
          <button className="bg-white text-rose-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg">
            Your journey starts here. Are you ready?
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <Image
                src="/logo/Middel 4.svg"
                alt="Mihaela Fitness"
                width={150}
                height={45}
                className="h-10 w-auto mb-4 brightness-0 invert"
              />
              <p className="text-gray-400">
                Your personal trainer and nutritionist in one app. Transform your body and mind.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#about" className="hover:text-white">About</a></li>
                <li><a href="#programs" className="hover:text-white">Programs</a></li>
                <li><a href="#pricing" className="hover:text-white">Pricing</a></li>
                <li><a href="#faq" className="hover:text-white">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#contact" className="hover:text-white">Contact</a></li>
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Terms & Conditions</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Follow me</h4>
              <p className="text-gray-400 mb-4">For tips, advice and offers!</p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white">Instagram</a>
                <a href="#" className="text-gray-400 hover:text-white">Facebook</a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>© 2025 Mihaela Fitness. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

