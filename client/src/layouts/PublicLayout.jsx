import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import { MapPin, Phone, Mail, Globe, MessageCircle, Share2, Briefcase, ChevronRight, ArrowUp } from 'lucide-react';

const PublicLayout = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <Navbar />
      <main className="flex-grow w-full">
        {/* The child routes will manage their own max-width if they are full-screen (like landing) or boxed (like dashboards) */}
        <Outlet />
      </main>
      
      <footer className="bg-[#071333] text-white mt-auto pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16 mb-12">
            
            {/* Column 1: Contact Us */}
            <div>
              <h3 className="text-xl font-bold mb-6 tracking-wide">Contact Us</h3>
              <ul className="space-y-4">
                <li className="flex items-start text-slate-300">
                  <MapPin className="w-5 h-5 mr-3 mt-0.5 text-primary-400 shrink-0" />
                  <span className="text-sm leading-relaxed">No 15, CureLink Head Office,<br />Galle Road, Colombo 03</span>
                </li>
                <li className="flex items-center text-slate-300">
                  <Phone className="w-5 h-5 mr-3 text-primary-400 shrink-0" />
                  <span className="text-sm">+94 11 234 5678</span>
                </li>
                <li className="flex items-center text-slate-300">
                  <Mail className="w-5 h-5 mr-3 text-primary-400 shrink-0" />
                  <span className="text-sm">info@curelink.com</span>
                </li>
              </ul>
              <div className="flex space-x-3 mt-6">
                {[Globe, MessageCircle, Share2, Briefcase].map((Icon, i) => (
                  <a key={i} href="#" className="w-9 h-9 rounded-full border border-slate-500 flex items-center justify-center text-slate-300 hover:bg-primary-600 hover:text-white hover:border-primary-600 transition-colors">
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* Column 2: Our Services */}
            <div>
              <h3 className="text-xl font-bold mb-6 tracking-wide">Our Services</h3>
              <ul className="space-y-3">
                {['Pharmacy Registration', 'Medicine Availability', 'Private Quotations', 'Secure Online Orders', 'Customer Support'].map((item, i) => (
                  <li key={i}>
                    <a href="#" className="flex items-center text-sm text-slate-300 hover:text-white group transition-colors">
                      <ChevronRight className="w-4 h-4 mr-2 text-primary-500 group-hover:translate-x-1 transition-transform" />
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Quick Access */}
            <div>
              <h3 className="text-xl font-bold mb-6 tracking-wide">Quick Access</h3>
              <ul className="space-y-3">
                {[
                  { name: 'About Us', path: '/about' },
                  { name: 'Find Pharmacies', path: '/pharmacies/nearby' },
                  { name: 'Register Customer', path: '/register/customer' },
                  { name: 'Terms & Conditions', path: '#' },
                  { name: 'Privacy Policy', path: '#' }
                ].map((item, i) => (
                  <li key={i}>
                    <Link to={item.path} className="flex items-center text-sm text-slate-300 hover:text-white group transition-colors">
                      <ChevronRight className="w-4 h-4 mr-2 text-primary-500 group-hover:translate-x-1 transition-transform" />
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>



          </div>
        </div>

        {/* Bottom Bar */}
        <div className="bg-[#040A1F] py-4 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center text-xs text-slate-400">
            <p>&copy; {new Date().getFullYear()} CureLink Healthcare, All Rights Reserved.</p>
          </div>
          <button 
            onClick={scrollToTop}
            className="absolute right-4 md:right-8 -top-5 w-10 h-10 bg-primary-700 hover:bg-primary-600 rounded-full flex items-center justify-center text-white shadow-lg transition-colors focus:outline-none"
            aria-label="Scroll to top"
          >
            <ArrowUp className="w-5 h-5" />
          </button>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
