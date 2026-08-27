import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

import { Search, FileText, CheckCircle2, Shield, CreditCard, Clock, MapPin, Activity, Store, Star, ChevronLeft, ChevronRight, Users, CheckCircle, Navigation } from 'lucide-react';
import pharmacyService from '../features/pharmacy/pharmacyService';
import api from '../api/axios';

const HomePage = () => {
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [platformStats, setPlatformStats] = useState(null);

  const slides = [
    {
      image: "/assets/images/hero-1.jpg",
      title: (
        <>
          Smart medicine access, <br className="hidden md:block"/>
          connected to <span className="text-blue-400">trusted pharmacies.</span>
        </>
      ),
      subtitle: "Find medicine availability, submit prescription requests, receive private pharmacy quotations and manage your secure order through one unified platform."
    },
    {
      image: "/assets/images/hero-2.jpg",
      title: "Cashless Bill Payments Made Easy!",
      subtitle: "Experience seamless and secure payments directly through CureLink. Safe, fast, and convenient healthcare at your fingertips."
    }
  ];

  const nextSlide = () => setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  const prevSlide = () => setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));

  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchPharmacies = async () => {
      try {
        const res = await pharmacyService.getVerifiedPharmacies();
        setPharmacies(res.data);
      } catch (err) {
        console.error('Failed to fetch pharmacies', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPharmacies();
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/health/stats');
        if (res.data?.success) {
          setPlatformStats(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch platform stats', err);
      }
    };
    fetchStats();
  }, []);
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section Carousel */}
      <section className="relative h-[600px] w-full overflow-hidden flex items-center">
        {/* Slides */}
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              currentSlide === index ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <div className="absolute inset-0 bg-slate-900/60 z-10"></div>
            <img 
              src={slide.image} 
              alt="Healthcare background" 
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
        ))}

        {/* Content Overlay */}
        <div className="relative z-20 px-4 mx-auto max-w-7xl sm:px-6 lg:px-8 w-full text-white">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl mb-6 leading-tight drop-shadow-md">
              {slides[currentSlide].title}
            </h1>
            
            <p className="text-lg md:text-xl text-slate-100 mb-10 max-w-2xl drop-shadow">
              {slides[currentSlide].subtitle}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/pharmacies/nearby">
                <Button size="lg" className="w-full sm:w-auto bg-[#0B1354] hover:bg-[#111A7A] text-white border-0">
                  <Search className="mr-2 h-5 w-5" />
                  Find Medicines
                </Button>
              </Link>
              <Link to="/register/customer">
                <Button size="lg" className="w-full sm:w-auto bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/30">
                  <FileText className="mr-2 h-5 w-5" />
                  Upload Prescription
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Slider Controls */}
        <button 
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 flex items-center justify-center rounded-full bg-[#0B1354]/70 hover:bg-[#0B1354] text-white transition-colors border border-white/20 hidden md:flex"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button 
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 flex items-center justify-center rounded-full bg-[#0B1354]/70 hover:bg-[#0B1354] text-white transition-colors border border-white/20 hidden md:flex"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                currentSlide === idx ? "bg-white w-8" : "bg-white/50 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      </section>

      {/* Verified Pharmacies Grid */}
      <section className="py-24 bg-gradient-to-b from-slate-50 to-white relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-200/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 -left-24 w-72 h-72 bg-blue-200/20 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div className="max-w-2xl">
              <span className="text-primary-600 font-semibold tracking-wider uppercase text-sm mb-2 block">Trusted Network</span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">Featured Pharmacies</h2>
              <p className="mt-4 text-slate-600 text-lg">Connect with our network of verified, highly-rated pharmacies ready to fulfill your medical needs.</p>
            </div>
            <Link to="/pharmacies/nearby" className="inline-flex items-center justify-center px-6 py-3 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 hover:text-primary-600 transition-all shadow-sm hover:shadow group">
              View all pharmacies <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="animate-pulse flex flex-col gap-4">
                  <div className="bg-slate-200 rounded-[2rem] aspect-[4/3] w-full"></div>
                  <div className="h-5 bg-slate-200 rounded w-3/4 ml-2"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/2 ml-2"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {pharmacies.map(pharmacy => (
                <div key={pharmacy._id} className="group cursor-pointer flex flex-col gap-4">
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[2rem] bg-white border border-slate-200 shadow-sm group-hover:shadow-xl group-hover:shadow-primary-900/10 transition-all duration-300 group-hover:-translate-y-2">
                    {pharmacy.photoUrl ? (
                      <img 
                        src={pharmacy.photoUrl} 
                        alt={pharmacy.name} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300 group-hover:scale-110 transition-transform duration-500 bg-slate-50">
                        <Store className="w-16 h-16 opacity-50" />
                      </div>
                    )}
                    {/* Glassmorphism Badge */}
                    <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm border border-white/50">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span className="text-xs font-bold text-slate-800 tracking-wide">Verified</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col px-2">
                    <h3 className="text-lg font-bold text-slate-900 line-clamp-1 group-hover:text-primary-600 transition-colors">{pharmacy.name}</h3>
                    <p className="text-sm text-slate-500 flex items-center mt-1">
                      <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
                      {pharmacy.address?.city}{pharmacy.address?.district ? `, ${pharmacy.address.district}` : ''}
                    </p>
                    <div className="mt-3">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${
                        pharmacy.deliveryAvailable ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-700"
                      }`}>
                        {pharmacy.deliveryAvailable ? 'Delivery Available' : 'Pickup Only'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {pharmacies.length === 0 && !loading && (
            <div className="text-center py-20 bg-white rounded-[3rem] border border-slate-200 border-dashed shadow-sm">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Store className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No pharmacies found</h3>
              <p className="text-slate-500">Be the first pharmacy to register and appear here!</p>
            </div>
          )}
        </div>
      </section>

      {/* Stats Section with Animation */}
      <section className="py-20 bg-[#0B1354] relative overflow-hidden">
        {/* Background Pattern/Gradient */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
        <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 bg-primary-600 rounded-full mix-blend-screen filter blur-3xl opacity-30"></div>
        <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-96 h-96 bg-blue-400 rounded-full mix-blend-screen filter blur-3xl opacity-20"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 divide-y sm:divide-y-0 sm:divide-x divide-white/20">
            <AnimatedCounter icon={Store} end={platformStats?.verifiedPharmacies ?? 0} title="Verified Pharmacies" />
            <AnimatedCounter icon={Users} end={platformStats?.registeredPatients ?? 0} title="Registered Patients" />
            <AnimatedCounter icon={CheckCircle} end={platformStats?.prescriptionsProcessed ?? 0} title="Prescriptions Processed" />
            <AnimatedCounter icon={Navigation} end={platformStats?.citiesCovered ?? 0} title="Cities Covered" />
          </div>
        </div>
      </section>

      {/* Core Features - Modern Bento Layout */}
      <section className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <span className="text-primary-600 font-semibold tracking-wider uppercase text-sm mb-2 block">Why Choose CureLink?</span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-6">
              Healthcare logistics, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-blue-400">reimagined.</span>
            </h2>
            <p className="text-lg text-slate-600">Experience a unified platform that bridges the gap between patients and pharmacies with cutting-edge technology.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: MapPin, title: 'Nearby Pharmacies', desc: 'Locate verified pharmacies within your service radius instantly.' },
              { icon: FileText, title: 'OCR Prescriptions', desc: 'Smart extraction of medicine names from uploaded prescription images.' },
              { icon: Shield, title: 'Private Quotations', desc: 'Blind bidding system ensures fair pricing and privacy between pharmacies.' },
              { icon: CheckCircle2, title: 'Medicine Availability', desc: 'Check stock levels and find medical substitutes securely.' },
              { icon: CreditCard, title: 'Secure Ordering', desc: 'Integrated with Stripe for safe online payments or Cash on Delivery.' },
              { icon: Activity, title: 'Real-time Tracking', desc: 'Live WebSocket notifications keep you updated on your order status.' }
            ].map((feature, i) => (
              <div key={i} className="group relative bg-slate-50 rounded-[2rem] p-8 hover:bg-white border border-slate-100 hover:border-primary-100 transition-all duration-300 hover:shadow-xl hover:shadow-primary-900/5 hover:-translate-y-1">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-100/50 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity rounded-tr-[2rem]"></div>
                <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-slate-100 text-primary-600 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary-600 group-hover:text-white transition-all duration-300">
                  <feature.icon className="w-7 h-7" strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed relative z-10">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modern CTA Section */}
      <section className="py-24 bg-white relative px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto bg-[#0B1354] rounded-[3rem] overflow-hidden relative shadow-2xl">
          {/* Glassmorphism Background Blobs */}
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-primary-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-70 animate-pulse-slow"></div>
          <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-[128px] opacity-50 animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
          
          <div className="relative z-10 px-6 py-20 md:py-28 text-center max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">Ready to experience smarter healthcare?</h2>
            <p className="text-primary-100 mb-10 text-lg md:text-xl font-light">Join CureLink today as a customer to find your medicines effortlessly, or as a pharmacy to expand your digital reach.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/register/customer">
                <Button size="lg" className="w-full sm:w-auto bg-white text-[#0B1354] hover:bg-slate-100 font-bold px-8 rounded-2xl h-14 text-lg transition-transform hover:scale-105 shadow-lg">
                  Join as Customer
                </Button>
              </Link>
              <Link to="/register/pharmacy">
                <Button variant="outline" size="lg" className="w-full sm:w-auto border-white/30 text-white hover:bg-white/10 font-bold px-8 rounded-2xl h-14 text-lg backdrop-blur-sm transition-transform hover:scale-105">
                  Register Pharmacy
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

// Local inline badge component for the hero
const Badge = ({ children, className, variant = "primary" }) => (
  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800 ${className}`}>
    {children}
  </span>
);

const AnimatedCounter = ({ icon: Icon, end, suffix = '', title, duration = 2000 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    let animationFrame = null;
    
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // easeOutExpo
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(easeProgress * end));
      
      if (progress < 1) {
        animationFrame = window.requestAnimationFrame(step);
      }
    };
    
    // We want to trigger it when it becomes visible, but for simplicity we'll just run on mount
    animationFrame = window.requestAnimationFrame(step);
    
    return () => {
      if (animationFrame) {
        window.cancelAnimationFrame(animationFrame);
      }
    };
  }, [end, duration]);

  return (
    <div className="flex flex-col items-center p-6 text-center group">
      <Icon className="w-12 h-12 text-white/90 mb-4 group-hover:scale-110 group-hover:text-white transition-all duration-300" strokeWidth={1.5} />
      <h3 className="text-5xl font-extrabold text-white mb-2 tracking-tight drop-shadow-sm">
        {count}{suffix}
      </h3>
      <p className="text-primary-100 font-medium text-lg">{title}</p>
    </div>
  );
};

export default HomePage;
