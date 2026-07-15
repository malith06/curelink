import React from 'react';

const AboutPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
        About CureLink
      </h1>
      <p className="text-lg text-gray-600 max-w-2xl">
        CureLink aims to bridge the gap between customers and pharmacies by providing a smart, 
        OCR-powered coordination system. Our platform prioritizes privacy, security, and ease 
        of use for managing medicine availability and private pharmacy quotations.
      </p>
    </div>
  );
};

export default AboutPage;
