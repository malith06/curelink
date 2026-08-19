import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import { Search, FileText, CheckCircle2, Shield, CreditCard, Clock, MapPin, Activity } from 'lucide-react';

const HomePage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative px-4 pt-20 pb-24 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <Badge variant="primary" className="mb-6 mx-auto w-fit">
            <Activity className="w-4 h-4 mr-2" />
            Healthcare Technology Final Year Project
          </Badge>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl md:text-6xl mb-6">
            Smart medicine access, <br className="hidden md:block"/>
            connected to <span className="text-primary-600">trusted pharmacies.</span>
          </h1>
          <p className="text-lg text-slate-600 mb-10 max-w-2xl mx-auto">
            Find medicine availability, submit prescription requests, receive private pharmacy quotations and manage your secure order through one unified platform.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/pharmacies/nearby">
              <Button size="lg" className="w-full sm:w-auto">
                <Search className="mr-2 h-5 w-5" />
                Find Medicines
              </Button>
            </Link>
            <Link to="/register/customer">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                <FileText className="mr-2 h-5 w-5" />
                Upload Prescription
              </Button>
            </Link>
          </div>
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
