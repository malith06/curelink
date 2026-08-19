import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import prescriptionService from '../../../features/prescriptions/prescriptionService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Badge from '../../../components/ui/Badge';
import Skeleton from '../../../components/ui/Skeleton';
import { Plus, Check, ArrowLeft, AlertCircle } from 'lucide-react';

const PrescriptionReviewPage = () => {
  const { requestId, prescriptionId } = useParams();
  const navigate = useNavigate();
  
  const [ocrData, setOcrData] = useState(null);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await prescriptionService.getOcrResults(prescriptionId);
        setOcrData(response.data);
        // Map backend schema to UI format
        const mappedEntries = (response.data.extractedMedicines || []).map(med => ({
          entryId: med.entryId,
          extractedText: med.rawDetectedText,
          medicineId: med.matchedMedicineId?._id || null,
          medicineName: med.matchedMedicineId ? med.matchedMedicineId.name : '',
          confidenceLevel: med.ocrConfidence >= 80 ? 'HIGH' : med.ocrConfidence >= 60 ? 'MEDIUM' : 'LOW',
          quantity: med.quantity || 1
        }));
        setEntries(mappedEntries);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
        setLoading(false);
      }
    };
    fetchResults();
  }, [prescriptionId]);

  const handleQuantityChange = (index, value) => {
    const updated = [...entries];
    updated[index].quantity = parseInt(value, 10) || 1;
    setEntries(updated);
  };

  const handleManualNameChange = (index, value) => {
    const updated = [...entries];
    updated[index].medicineName = value;
    updated[index].extractedText = value;
    setEntries(updated);
  };

  const handleAddManual = () => {
    setEntries([...entries, { entryId: null, extractedText: '', medicineId: null, medicineName: '', confidenceLevel: 'MANUAL', quantity: 1 }]);
  };

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      // 1. Update entries
      await prescriptionService.updateOcrEntries(prescriptionId, entries);
      // 2. Confirm and sync
      await prescriptionService.confirmPrescription(prescriptionId);
      
      navigate(`/customer/requests/${requestId}`); // Go back to request details
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="mx-auto px-4 py-12 max-w-4xl">
      <Skeleton className="h-10 w-64 mb-4" />
      <Skeleton className="h-4 w-96 mb-8" />
      <Card>
        <CardContent className="p-6 space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="mx-auto px-4 py-12 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Review Detected Medicines</h1>
        <p className="mt-2 text-slate-600">Please verify the AI-detected medicines and adjust quantities if necessary.</p>
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 flex items-center">
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Extracted Items</CardTitle>
          <CardDescription>
            Our AI has identified the following items from your prescription.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {entries.length === 0 ? (
            <div className="text-center py-8 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-slate-500 italic mb-4">No medicines detected automatically.</p>
              <Button variant="outline" onClick={handleAddManual} icon={Plus}>Add Item Manually</Button>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {entries.map((entry, idx) => (
                <li key={idx} className="py-5 flex flex-col sm:flex-row sm:items-center gap-4 first:pt-0 last:pb-0">
                  <div className="flex-1 space-y-2">
                    {entry.confidenceLevel === 'MANUAL' ? (
                       <Input 
                         placeholder="Enter medicine name..."
                         value={entry.medicineName}
                         onChange={(e) => handleManualNameChange(idx, e.target.value)}
                         className="max-w-sm"
                       />
                    ) : (
                      <>
                        <div className="font-semibold text-slate-900">{entry.medicineName || "Unknown Medicine"}</div>
                        <div className="text-sm text-slate-500">Detected as: <span className="italic">"{entry.extractedText}"</span></div>
                      </>
                    )}
                    
                    <div className="flex items-center gap-2">
                      {entry.confidenceLevel === 'HIGH' && <Badge variant="success">High Confidence</Badge>}
                      {entry.confidenceLevel === 'MEDIUM' && <Badge variant="warning">Medium Confidence</Badge>}
                      {entry.confidenceLevel === 'LOW' && <Badge variant="destructive">Low Confidence - Verify</Badge>}
                      {entry.confidenceLevel === 'MANUAL' && <Badge variant="secondary">Manually Added</Badge>}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <label className="text-sm font-medium text-slate-700 pl-2">Qty:</label>
                    <Input 
                      type="number" 
                      min="1"
                      className="w-20 text-center"
                      value={entry.quantity}
                      onChange={(e) => handleQuantityChange(idx, e.target.value)}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
          
          {entries.length > 0 && (
            <div className="mt-6 pt-6 border-t border-slate-100">
              <Button variant="outline" onClick={handleAddManual} icon={Plus} size="sm">
                Add Another Item
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row justify-end gap-4">
        <Button 
          variant="outline"
          onClick={() => navigate(`/customer/requests/${requestId}`)}
          icon={ArrowLeft}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleConfirm}
          disabled={submitting}
          loading={submitting}
          icon={Check}
        >
          Confirm and Submit
        </Button>
      </div>
    </div>
  );
};

export default PrescriptionReviewPage;
