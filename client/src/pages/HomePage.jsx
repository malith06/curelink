import React from 'react';

const HomePage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <h1 className="text-4xl md:text-5xl font-extrabold text-blue-600 tracking-tight mb-4">
        CureLink
      </h1>
      <p className="text-xl md:text-2xl text-gray-800 font-medium max-w-2xl mb-8">
        Smart Medicine Availability and OCR-Based Pharmacy Coordination System
      </p>
      
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 max-w-3xl shadow-sm">
        <p className="text-blue-800 text-lg">
          Medicine search, OCR prescription processing, private pharmacy quotations, ordering, payments and notifications will be added in later development phases.
        </p>
      </div>
    </div>
  );
};

export default HomePage;
