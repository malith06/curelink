import React from 'react';
import { Shield, BrainCircuit, Users, Lock, Heart, FileImage, Truck, CheckCircle2 } from 'lucide-react';
import { cn } from '../utils/cn';

const AboutPage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      
      {/* Hero Section */}
      <section className="relative bg-[#0B1354] py-24 px-4 overflow-hidden">
        {/* Modern Background Elements */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary-600 rounded-full mix-blend-screen filter blur-[100px] opacity-40 animate-blob"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-500 rounded-full mix-blend-screen filter blur-[100px] opacity-40 animate-blob animation-delay-2000"></div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight">
            Revolutionizing the <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">Healthcare Ecosystem</span>
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 max-w-2xl mx-auto font-light">
            Bridging the gap between patients and pharmacies through smart, secure, and transparent technology.
          </p>
        </div>
      </section>

      {/* The Problem & What is CureLink */}
      <section className="py-20 px-4 max-w-7xl mx-auto w-full relative -mt-12 z-20">
        <div className="grid lg:grid-cols-2 gap-8 items-stretch">
          <div className="bg-white p-8 md:p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 h-full flex flex-col justify-center">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-500 mb-6">
              <FileImage className="h-6 w-6" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">The Problem</h2>
            <p className="text-slate-600 mb-4 leading-relaxed text-lg">
              Patients often face the frustration of visiting multiple pharmacies to find their prescribed medicines, especially during shortages or for rare drugs. Calling pharmacies individually is time-consuming and inefficient.
            </p>
            <p className="text-slate-600 leading-relaxed text-lg">
              For pharmacies, acquiring local patients and managing private pricing in a highly competitive market without exposing their pricing strategy to rivals is difficult.
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-primary-600 to-indigo-700 p-8 md:p-10 rounded-3xl shadow-lg h-full flex flex-col justify-center text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full filter blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-md mb-6">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-4 tracking-tight">What is CureLink?</h2>
            <p className="text-blue-50 leading-relaxed text-lg">
              CureLink is a specialized marketplace designed for healthcare. It allows patients to broadcast medicine requests to nearby pharmacies securely. Pharmacies respond with private quotations, offering fair prices or exact medical substitutes, ensuring patients always find what they need.
            </p>
          </div>
        </div>
      </section>

      {/* Core Technology Features */}
      <section className="py-20 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight">Powered by Modern Technology</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">Built with industry-leading tools to ensure reliability, speed, and uncompromising data protection.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard 
              icon={BrainCircuit}
              title="OCR Prescription Engine"
              desc="Upload a prescription and our integrated OCR engine extracts text automatically, while a real pharmacist verifies accuracy."
            />
            <FeatureCard 
              icon={Lock}
              title="Blind Bidding System"
              desc="Pharmacies cannot see each other's quotes. Your data and pricing offers remain strictly between you and the quoting pharmacy."
            />
            <FeatureCard 
              icon={CheckCircle2}
              title="Verified Network"
              desc="Every pharmacy on CureLink is strictly vetted and verified. You only receive medicine from licensed, trusted professionals."
            />
            <FeatureCard 
              icon={Truck}
              title="Flexible Fulfillment"
              desc="Choose what works for you: get your medicines delivered right to your doorstep or prepare them for a quick in-store pickup."
            />
          </div>
        </div>
      </section>

      {/* How it benefits everyone */}
      <section className="py-24 px-4 max-w-5xl mx-auto w-full text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-16 tracking-tight">Built for the Entire Ecosystem</h2>
        
        <div className="grid md:grid-cols-2 gap-12">
          <div className="group bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-lg transition-shadow duration-300">
            <div className="mx-auto w-20 h-20 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 transform group-hover:scale-110 transition-transform duration-300">
              <Heart className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">For Patients</h3>
            <p className="text-slate-600 text-lg leading-relaxed">
              Save precious time during sickness. Compare fair prices from home, instantly find hard-to-get medicines, and safely order them directly to your door or for quick pickup.
            </p>
          </div>
          
          <div className="group bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-lg transition-shadow duration-300">
            <div className="mx-auto w-20 h-20 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 transform group-hover:scale-110 transition-transform duration-300">
              <Users className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">For Pharmacies</h3>
            <p className="text-slate-600 text-lg leading-relaxed">
              Discover new local customers, safely offer medical substitutes when exact brands are out of stock, and manage fulfillment through a dedicated operations dashboard.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
};

const FeatureCard = ({ icon: Icon, title, desc }) => (
  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/60 hover:bg-white hover:shadow-md transition-all duration-300 group">
    <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center mb-5 group-hover:bg-primary-50 group-hover:border-primary-100 transition-colors">
      <Icon className="w-6 h-6 text-primary-600" />
    </div>
    <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
    <p className="text-slate-600 leading-relaxed text-sm">{desc}</p>
  </div>
);

export default AboutPage;
