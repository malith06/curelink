import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Loader2 } from 'lucide-react';
import requestService from '../../../features/requests/requestService';

const CreateRequestPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleStartRequest = async () => {
    try {
      setLoading(true);
      // Start a draft request and navigate to its details page to add items
      const res = await requestService.createDraftRequest();
      toast.success('Draft request created!');
      navigate(`/customer/requests/${res.data._id}`);
    } catch (error) {
      toast.error('Failed to create request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Start a New Medicine Request</h1>
        <p className="text-gray-600 mb-8">
          Send a request to up to 5 nearby pharmacies to check availability and get quotations for your prescriptions.
        </p>
        
        <button
          onClick={handleStartRequest}
          disabled={loading}
          className="px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary-700 focus:ring-4 focus:ring-primary-200 transition-colors inline-flex items-center"
        >
          {loading ? (
            <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Creating...</>
          ) : (
            'Start Request Draft'
          )}
        </button>
      </div>
    </div>
  );
};

export default CreateRequestPage;
