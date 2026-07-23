import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <h1 className="text-4xl md:text-5xl font-extrabold text-blue-600 tracking-tight mb-4">
        CureLink
      </h1>
      <p className="text-xl md:text-2xl text-gray-800 font-medium max-w-2xl mb-8">
        Smart Medicine Availability and OCR-Based Pharmacy Coordination System
      </p>

      <div className="flex gap-4 mb-12">
        <Link
          to="/pharmacies/nearby"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-transform hover:scale-105"
        >
          Find Nearby Pharmacies
        </Link>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 max-w-3xl shadow-sm">
        <p className="text-blue-800 text-lg">
          Medicine search, OCR prescription processing, private pharmacy quotations, ordering, payments and notifications will be added in later development phases.
        </p>
      </div>
    </div>
  );
};

export default HomePage;
