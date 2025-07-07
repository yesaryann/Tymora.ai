import React, { useEffect, useState, useRef } from 'react';
import { ArrowRight, Chrome, Smartphone, Bell, Star, MessageCircle, Share2, Download, Crown, Play, Sparkles, Zap, Shield, Brain } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const handleTryExtension = () => {
    navigate('/login');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden relative">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 via-black to-blue-900/20"></div>
        {/* Floating particles */}
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-green-400/30 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      {/* Mouse follower */}
      <div 
        className="fixed w-96 h-96 pointer-events-none z-10 opacity-20"
        style={{
          left: mousePosition.x - 192,
          top: mousePosition.y - 192,
          background: 'radial-gradient(circle, rgba(34, 197, 94, 0.1) 0%, transparent 70%)',
          transition: 'all 0.1s ease-out'
        }}
      />

      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-xl border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg flex items-center justify-center transform hover:scale-110 transition-transform">
              <Sparkles size={16} className="text-black" />
            </div>
            <div className="text-xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
              Tymora.ai
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <button className="text-gray-300 hover:text-white transition-all hover:scale-105">Features</button>
            <button className="text-gray-300 hover:text-white transition-all hover:scale-105">Research</button>
            <button className="text-gray-300 hover:text-white transition-all hover:scale-105">Download</button>
          </nav>
          <div className="flex items-center gap-6">
            <button className="text-gray-300 hover:text-white transition-all hover:scale-105">Premium</button>
            <button 
              onClick={handleLogin}
              className="flex items-center gap-2 text-gray-300 hover:text-white transition-all hover:scale-105 group"
            >
              Login 
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section ref={heroRef} className="min-h-screen flex items-center justify-center relative pt-20">
        <div className="text-center max-w-6xl mx-auto px-6 relative z-20">
          {/* Badge with glitch effect */}
          <div className="inline-flex items-center gap-3 bg-gray-900/50 border border-green-500/30 rounded-full px-6 py-3 mb-8 backdrop-blur-sm hover:border-green-400/50 transition-all group">
            <span className="bg-green-500 text-black text-xs font-bold px-3 py-1 rounded-full animate-pulse">Latest</span>
            <span className="text-gray-300 text-sm group-hover:text-white transition-colors">Backed by Scientific Research</span>
          </div>

          {/* Main Heading with animated gradient */}
          <h1 className="text-6xl md:text-8xl font-black mb-8 leading-tight">
            <span className="text-white block mb-4 animate-fade-in-up">Stop Scrolling.</span>
            <span 
              className="bg-gradient-to-r from-green-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent block animate-fade-in-up"
              style={{ animationDelay: '0.2s' }}
            >
              Start Doing
            </span>
          </h1>

          {/* Subtitle */}
          <p 
            className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto animate-fade-in-up"
            style={{ animationDelay: '0.4s' }}
          >
            End doomscrolling and procrastination. Reclaim your focus.
          </p>

          {/* CTA Buttons */}
          <div 
            className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-fade-in-up"
            style={{ animationDelay: '0.6s' }}
          >
            <button className="group flex items-center gap-3 bg-green-500 hover:bg-green-400 text-black px-8 py-4 rounded-full font-semibold transition-all transform hover:scale-105 hover:shadow-2xl hover:shadow-green-500/25">
              <Smartphone size={20} />
              Try Tymora.ai on Android
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
            
            <button className="group flex items-center gap-3 bg-blue-500 hover:bg-blue-400 text-white px-8 py-4 rounded-full font-semibold transition-all transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25">
              <Bell size={20} />
              Notify me for iOS
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
            
            <button 
              onClick={handleTryExtension}
              className="group flex items-center gap-3 bg-gray-800 hover:bg-gray-700 border border-gray-600 hover:border-gray-500 text-white px-8 py-4 rounded-full font-semibold transition-all transform hover:scale-105 hover:shadow-2xl hover:shadow-gray-500/25"
            >
              <Chrome size={20} />
              Try extension now
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-gray-600 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-green-400 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Revolutionary Features Section */}
      <section className="py-32 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-black mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Revolutionary Features
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Break free from digital addiction with science-backed tools
            </p>
          </div>

          {/* Feature 1 - Smart App Blocking */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-32">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-4 py-2">
                <span className="text-green-400 text-sm font-medium">Achieve your screen time goals</span>
              </div>
              
              <h3 className="text-4xl md:text-5xl font-bold text-white">
                Smart App Blocking
              </h3>
              
              <h4 className="text-2xl text-blue-400 font-semibold">
                Block features inside app
              </h4>
              
              <p className="text-xl text-gray-400 leading-relaxed">
                Remove Shorts, Reels or anything you don't want, while keeping messaging & search for work/study.
              </p>
            </div>

            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
              <div className="relative bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 transform group-hover:scale-105 transition-all">
                <img 
                  src="https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=600" 
                  alt="App blocking interface"
                  className="w-full h-80 object-cover rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* Feature 2 - AI-Powered Alternatives */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
              <div className="relative bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 transform group-hover:scale-105 transition-all">
                <img 
                  src="https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=600" 
                  alt="AI alternatives interface"
                  className="w-full h-80 object-cover rounded-xl"
                />
              </div>
            </div>

            <div className="order-1 lg:order-2 space-y-8">
              <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-4 py-2">
                <span className="text-green-400 text-sm font-medium">Grow Faster with Tymora.ai</span>
              </div>
              
              <h3 className="text-4xl md:text-5xl font-bold text-white">
                AI-Powered Alternatives
              </h3>
              
              <h4 className="text-2xl text-blue-400 font-semibold">
                Get Alternatives with AI
              </h4>
              
              <p className="text-xl text-gray-400 leading-relaxed">
                Your AI Assistant suggests productive actions based on your mood—like lo-fi beats to focus.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Fun Lock Challenge Section */}
      <section className="py-32 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-4 py-2">
                <span className="text-green-400 text-sm font-medium">Meet the best self</span>
              </div>
              
              <h3 className="text-4xl md:text-5xl font-bold text-white">
                Fun Lock Challenge
              </h3>
              
              <p className="text-xl text-gray-400 leading-relaxed">
                Challenge yourself with fun locks and accountability features that make staying focused engaging and rewarding.
              </p>
            </div>

            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
              <div className="relative bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 transform group-hover:scale-105 transition-all">
                <img 
                  src="https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=600" 
                  alt="Fun lock challenge interface"
                  className="w-full h-80 object-cover rounded-xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* University Logos Section */}
      <section className="py-20 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center">
            <div className="text-center group">
              <h4 className="text-xl font-bold text-white group-hover:text-green-400 transition-colors">Wharton</h4>
              <p className="text-sm text-gray-400">University of Pennsylvania</p>
            </div>
            <div className="text-center group">
              <h4 className="text-xl font-bold text-white group-hover:text-green-400 transition-colors">IITB</h4>
              <p className="text-sm text-gray-400">Indian Institute of Technology Bombay</p>
            </div>
            <div className="text-center group">
              <h4 className="text-xl font-bold text-white group-hover:text-green-400 transition-colors">CMU</h4>
              <p className="text-sm text-gray-400">Carnegie Mellon University</p>
            </div>
            <div className="text-center group">
              <h4 className="text-xl font-bold text-white group-hover:text-green-400 transition-colors">ISB</h4>
              <p className="text-sm text-gray-400">Indian School of Business</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-black mb-6 text-white">
              STOP BRAIN ROT, BOOST MEMORY
            </h2>
            <p className="text-2xl text-gray-400">NO MATTER WHO YOU ARE</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Free Plan */}
            <div className="bg-gray-900/30 border border-gray-700 rounded-2xl p-8 hover:border-gray-600 transition-all transform hover:scale-105 hover:shadow-2xl">
              <h3 className="text-3xl font-bold mb-8 text-white">Free</h3>
              <ul className="space-y-4 text-gray-300 mb-8">
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  Block Shorts, Reels
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  Restrict all addictive apps
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  Remove News Feed from websites
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  Sessions for Planned usage
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  Pre-schedule time for Focus/ Break
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  Fun lock for accountability with money
                </li>
              </ul>
              <button className="w-full py-4 text-white border border-gray-600 rounded-xl hover:bg-gray-800 transition-all font-semibold">
                Get Started Now
              </button>
            </div>

            {/* Premium Plan */}
            <div className="bg-gray-900/50 border border-green-500 rounded-2xl p-8 transform scale-105 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-black px-6 py-2 rounded-full text-sm font-bold">
                Most Popular
              </div>
              <h3 className="text-3xl font-bold mb-8 text-white">Premium</h3>
              <ul className="space-y-4 text-gray-300 mb-8">
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  Block more addictive features in apps
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  Restrict all addictive websites
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  Customize session length
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  Limitless selections for Focus/ Break
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  Set locks with a secure PIN
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  Control your suggested alternatives
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  Change your premium device
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  Early access to new features
                </li>
              </ul>
              <button className="w-full py-4 bg-white text-black rounded-xl hover:bg-gray-200 transition-all font-bold flex items-center justify-center gap-2">
                Choose Plan
                <ArrowRight size={16} />
              </button>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-gray-900/30 border border-gray-700 rounded-2xl p-8 hover:border-gray-600 transition-all transform hover:scale-105 hover:shadow-2xl">
              <h3 className="text-3xl font-bold mb-8 text-white">Enterprise</h3>
              <ul className="space-y-4 text-gray-300 mb-8">
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  White glove onboarding
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  Technical Support
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  Live Workshops
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  Suitable for schools, colleges, companies who want to nurture a focused and productive environment within their organizations
                </li>
              </ul>
              <button className="w-full py-4 text-white border border-gray-600 rounded-xl hover:bg-gray-800 transition-all font-semibold">
                Schedule a call
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-32">
        <div className="max-w-6xl mx-auto text-center px-6">
          <h2 className="text-5xl md:text-6xl font-black mb-8">
            Ready to <span className="bg-gradient-to-r from-green-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">Reclaim Your Focus?</span>
          </h2>
          <p className="text-xl text-gray-400 mb-12 max-w-3xl mx-auto">
            Join thousands who've already broken free from endless scrolling
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <button className="group flex items-center gap-3 bg-green-500 hover:bg-green-400 text-black px-8 py-4 rounded-full font-semibold transition-all transform hover:scale-105 hover:shadow-2xl hover:shadow-green-500/25">
              <Smartphone size={20} />
              Download for Android
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
            
            <button className="group flex items-center gap-3 bg-blue-500 hover:bg-blue-400 text-white px-8 py-4 rounded-full font-semibold transition-all transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25">
              <Bell size={20} />
              Get Notified for iOS
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
            
            <button 
              onClick={handleTryExtension}
              className="group flex items-center gap-3 bg-gray-800 hover:bg-gray-700 border border-gray-600 hover:border-gray-500 text-white px-8 py-4 rounded-full font-semibold transition-all transform hover:scale-105 hover:shadow-2xl hover:shadow-gray-500/25"
            >
              <Chrome size={20} />
              Try Browser Extension
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between mb-8">
            <div className="flex items-center gap-3 mb-6 md:mb-0">
              <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
                <Sparkles size={20} className="text-black" />
              </div>
              <div>
                <div className="font-bold text-xl">Tymora.ai</div>
              </div>
            </div>

            <div className="flex items-center gap-8 text-gray-400">
              <button className="hover:text-white transition-colors">Privacy</button>
              <button className="hover:text-white transition-colors">Terms</button>
              <button className="hover:text-white transition-colors">Support</button>
            </div>
          </div>

          <div className="text-center text-gray-500 text-sm">
            © 2025 Tymora.ai. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Back to top button */}
      <div className="fixed bottom-8 right-8 z-50">
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="bg-gray-800 hover:bg-gray-700 text-white p-4 rounded-full transition-all transform hover:scale-110 hover:shadow-2xl group"
        >
          <ArrowRight size={20} className="rotate-[-90deg] group-hover:translate-y-[-2px] transition-transform" />
        </button>
      </div>
    </div>
  );
};

export default LandingPage;