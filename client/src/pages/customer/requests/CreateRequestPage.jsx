import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Sparkles } from 'lucide-react';
import requestService from '../../../features/requests/requestService';
import { Card, CardContent } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';

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
    <div className="mx-auto px-4 py-12 max-w-2xl">
      <Card>
        <CardContent className="p-10 text-center">
          <div className="mx-auto bg-primary-100 text-primary-600 w-16 h-16 rounded-full flex items-center justify-center mb-6">
            <Sparkles className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">Start a New Medicine Request</h1>
          <p className="text-slate-600 mb-8 text-lg">
            Send a request to up to 5 nearby pharmacies to check availability and get quotations for your prescriptions.
          </p>
          
          <Button
            onClick={handleStartRequest}
            disabled={loading}
            isLoading={loading}
            size="lg"
            className="w-full sm:w-auto"
          >
            Start Request Draft
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateRequestPage;
