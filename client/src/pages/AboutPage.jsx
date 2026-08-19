import React from 'react';
import { Shield, BrainCircuit, Users, Lock, Heart, FileImage } from 'lucide-react';

const AboutPage = () => {
  return (
    <div className="flex flex-col min-h-screen pb-20">
      
      {/* Header Section */}
      <section className="bg-primary-50 py-16 px-4 text-center border-b border-primary-100">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">About CureLink</h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
          Bridging the gap between patients and pharmacies through smart, secure, and transparent technology.
        </p>
      </section>

      {/* The Problem & What is CureLink */}
      <section className="py-16 px-4 max-w-5xl mx-auto w-full">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">The Problem</h2>
            <p className="text-slate-600 mb-4 leading-relaxed">
              Patients often face the frustration of visiting multiple pharmacies to find their prescribed medicines, especially during shortages or for rare drugs. Calling pharmacies individually is time-consuming and inefficient.
            </p>
            <p className="text-slate-600 leading-relaxed">
              For pharmacies, acquiring local patients and managing private pricing in a highly competitive market without exposing their pricing strategy is difficult.
            </p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">What is CureLink?</h2>
            <p className="text-slate-600 leading-relaxed">
              CureLink is a specialized marketplace designed for healthcare. It allows patients to broadcast medicine requests to nearby pharmacies securely. Pharmacies respond with private quotations, offering fair prices or exact medical substitutes, ensuring patients always find what they need.
            </p>
          </div>
        </div>
      </section>

      {/* Core Technology Features */}
      <section className="py-16 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Technology & Security</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">Built with modern tools to ensure reliability and data protection.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={BrainCircuit}
              title="OCR Prescription Processing"
              desc="When you upload a doctor's prescription, our integrated OCR engine extracts text automatically, identifying medicines while a real pharmacist verifies accuracy."
            />
            <FeatureCard 
              icon={Lock}
              title="Private Quotations"
              desc="We use a blind bidding system. Pharmacies cannot see each other's quotes. Your data and pricing offers remain strictly between you and the quoting pharmacy."
            />
            <FeatureCard 
              icon={Shield}
              title="Security & Payments"
              desc="Payments are securely handled via Stripe, ensuring credit card data never touches our servers. Authentication is protected by modern JWT standards."
            />
          </div>
        </div>
      </section>

      {/* How it benefits everyone */}
      <section className="py-16 px-4 max-w-5xl mx-auto w-full text-center">
        <h2 className="text-3xl font-bold text-slate-900 mb-12">Built for the Healthcare Ecosystem</h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="p-6">
            <div className="mx-auto w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
              <Heart className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">For Patients</h3>
            <p className="text-slate-600">Save time, compare fair prices from home, and safely order medicines directly to your door or for quick pickup.</p>
          </div>
          
          <div className="p-6">
            <div className="mx-auto w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4">
              <Users className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">For Pharmacies</h3>
            <p className="text-slate-600">Discover new local customers, safely offer medical substitutes, and manage fulfillment through a dedicated operations dashboard.</p>
          </div>
        </div>
      </section>

    </div>
  );
};

const FeatureCard = ({ icon: Icon, title, desc }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
    <Icon className="w-10 h-10 text-primary-600 mb-4" />
    <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
    <p className="text-slate-600">{desc}</p>
  </div>
);

export default AboutPage;
