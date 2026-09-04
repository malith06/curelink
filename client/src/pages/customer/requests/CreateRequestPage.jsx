import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Sparkles, AlertTriangle } from 'lucide-react';
import requestService from '../../../features/requests/requestService';
import { Card, CardContent } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';

const CreateRequestPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  // Detect medicines that are UNAVAILABLE at the pre-selected pharmacy
  const medicineStatuses = location.state?.medicineStatuses || [];
  const unavailableMedicines = medicineStatuses.filter(ms => ms.status === 'UNAVAILABLE');

  const handleStartRequest = async () => {
    try {
      setLoading(true);
      // Start a draft request
      const res = await requestService.createDraftRequest();
      const draftId = res.data._id;
      
      // If there are preselected medicines from the nearby pharmacies search, add them automatically
      if (location.state?.preselectedMedicines?.length > 0) {
        for (const med of location.state.preselectedMedicines) {
          try {
            await requestService.addItemToRequest(draftId, {
              medicineId: med._id,
              quantity: 1,
              prescriptionRequired: med.prescriptionRequired || false
            });
          } catch (err) {
            console.error('Failed to pre-add medicine', med.name, err);
          }
        }
      }

      toast.success('Draft request created!');
      // Navigate to its details page to continue, passing the preselected pharmacy
      navigate(`/customer/requests/${draftId}`, { 
        state: { preselectedPharmacyId: location.state?.preselectedPharmacyId } 
      });
    } catch (error) {
      toast.error('Failed to create request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto px-4 py-12 max-w-2xl">
      {/* Unavailable medicines warning banner */}
      {unavailableMedicines.length > 0 && (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-amber-800 mb-1">
                Some medicines may not be available
              </h3>
              <p className="text-sm text-amber-700 mb-3">
                The following medicine{unavailableMedicines.length > 1 ? 's are' : ' is'} currently marked as <span className="font-semibold">unavailable</span> at this pharmacy. Your request may be declined.
              </p>
              <ul className="space-y-1">
                {unavailableMedicines.map(ms => (
                  <li key={ms.medicineId} className="flex items-center gap-2 text-sm text-amber-800">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                    <span className="font-medium">{ms.name}</span>
                    <span className="text-amber-600 font-normal">— marked unavailable</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-amber-600">
                You can still proceed — the pharmacy will review your request and respond.
              </p>
            </div>
          </div>
        </div>
      )}

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
