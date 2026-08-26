import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

import { Search, FileText, CheckCircle2, Shield, CreditCard, Clock, MapPin, Activity, Store, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import pharmacyService from '../features/pharmacy/pharmacyService';

const HomePage = () => {
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

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
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Featured Pharmacies</h2>
            <Link to="/pharmacies/nearby" className="text-primary-600 font-medium hover:text-primary-700 flex items-center">
              View all <Search className="w-4 h-4 ml-1" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="animate-pulse flex flex-col gap-3">
                  <div className="bg-slate-200 rounded-2xl aspect-square w-full"></div>
                  <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {pharmacies.map(pharmacy => (
                <div key={pharmacy._id} className="group cursor-pointer flex flex-col gap-3">
                  <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-slate-100 border border-slate-200">
                    {pharmacy.photoUrl ? (
                      <img 
                        src={pharmacy.photoUrl} 
                        alt={pharmacy.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 group-hover:scale-105 transition-transform duration-300">
                        <Store className="w-16 h-16 opacity-50" />
                      </div>
                    )}
                    {/* Badge Overlay */}
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
                      <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                      <span className="text-xs font-bold text-slate-700">New</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-slate-900 line-clamp-1">{pharmacy.name}</h3>
                    </div>
                    <p className="text-sm text-slate-500">{pharmacy.address?.city}{pharmacy.address?.district ? `, ${pharmacy.address.district}` : ''}</p>
                    <p className="text-sm font-medium text-slate-700 mt-1">
                      {pharmacy.deliveryAvailable ? 'Delivery Available' : 'Pickup Only'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
          {pharmacies.length === 0 && !loading && (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-200 border-dashed">
              <Store className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-slate-900">No pharmacies found</h3>
              <p className="text-slate-500">Be the first pharmacy to register and appear here!</p>
            </div>
          )}
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-20 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">How CureLink Works</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">A seamless journey from prescription to fulfillment.</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 text-center">
            {[
              { title: 'Search', desc: 'Find medicines locally' },
              { title: 'Request', desc: 'Upload your prescription' },
              { title: 'Verify', desc: 'OCR & manual check' },
              { title: 'Compare', desc: 'Review private quotes' },
              { title: 'Order', desc: 'Secure checkout' },
              { title: 'Receive', desc: 'Pickup or Delivery' }
            ].map((step, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary-100 text-primary-600 font-bold text-lg mb-4">
                  {i + 1}
                </div>
                <h3 className="font-semibold text-slate-900 mb-1">{step.title}</h3>
                <p className="text-sm text-slate-500">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Core Features</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">Powerful tools designed for both customers and pharmacies.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: MapPin, title: 'Nearby Pharmacies', desc: 'Locate verified pharmacies within your service radius instantly.' },
              { icon: FileText, title: 'OCR Prescriptions', desc: 'Smart extraction of medicine names from uploaded prescription images.' },
              { icon: Shield, title: 'Private Quotations', desc: 'Blind bidding system ensures fair pricing and privacy between pharmacies.' },
              { icon: CheckCircle2, title: 'Medicine Availability', desc: 'Check stock levels and find medical substitutes securely.' },
              { icon: CreditCard, title: 'Secure Ordering', desc: 'Integrated with Stripe for safe online payments or Cash on Delivery.' },
              { icon: Clock, title: 'Real-time Tracking', desc: 'Live WebSocket notifications keep you updated on your order status.' }
            ].map((feature, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Ready to experience smarter healthcare?</h2>
          <p className="text-primary-100 mb-10 text-lg">Join CureLink today as a customer to find your medicines, or as a pharmacy to expand your reach.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/register/customer">
              <Button size="lg" className="w-full sm:w-auto bg-white text-primary-700 hover:bg-slate-50">
                Join as Customer
              </Button>
            </Link>
            <Link to="/register/pharmacy">
              <Button variant="outline" size="lg" className="w-full sm:w-auto border-white text-white hover:bg-primary-700">
                Register Pharmacy
              </Button>
            </Link>
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

export default HomePage;
