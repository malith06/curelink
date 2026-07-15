import React from 'react';

const LoginPlaceholderPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Sign In
        </h1>
        <p className="text-gray-500 mb-8">
          Welcome back to CureLink
        </p>
        
        <div className="bg-blue-50 text-blue-800 p-4 rounded-lg text-sm mb-6">
          Authentication module is scheduled for future development phases.
        </div>

        <button 
          disabled
          className="w-full bg-blue-400 text-white font-medium py-2.5 rounded-lg cursor-not-allowed"
        >
          Login (Coming Soon)
        </button>
      </div>
    </div>
  );
};

export default LoginPlaceholderPage;
