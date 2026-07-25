import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import prescriptionService from '../../../features/prescriptions/prescriptionService';

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

  const handleAddManual = () => {
    setEntries([...entries, { entryId: null, extractedText: '', medicineId: null, medicineName: '', confidenceLevel: 'LOW', quantity: 1 }]);
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

  if (loading) return <div className="p-8 text-center">Loading OCR results...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md mt-10">
      <h1 className="text-2xl font-bold mb-2">Review Detected Medicines</h1>
      <p className="text-gray-600 mb-6">Please verify the AI-detected medicines and adjust quantities if necessary.</p>
      
      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Extracted Items</h2>
        {entries.length === 0 ? (
          <p className="text-gray-500 italic">No medicines detected. Please add them manually.</p>
        ) : (
          <ul className="divide-y divide-gray-200 border rounded-md">
            {entries.map((entry, idx) => (
              <li key={idx} className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="font-medium">{entry.medicineName || "Unknown Medicine"}</div>
                  <div className="text-sm text-gray-500">Detected as: "{entry.extractedText}"</div>
                  {entry.confidenceLevel === 'HIGH' && <span className="inline-block mt-1 px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded">High Confidence</span>}
                  {entry.confidenceLevel === 'MEDIUM' && <span className="inline-block mt-1 px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded">Medium Confidence</span>}
                  {entry.confidenceLevel === 'LOW' && <span className="inline-block mt-1 px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded">Low Confidence - Please Verify</span>}
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-700">Qty:</label>
                  <input 
                    type="number" 
                    min="1"
                    className="w-16 p-1 border rounded"
                    value={entry.quantity}
                    onChange={(e) => handleQuantityChange(idx, e.target.value)}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
        
        <button onClick={handleAddManual} className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium">
          + Add Manual Item
        </button>
      </div>

      <div className="flex justify-end gap-4">
        <button 
          onClick={() => navigate(`/customer/requests/${requestId}`)}
          className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button 
          onClick={handleConfirm}
          disabled={submitting}
          className={`px-4 py-2 rounded font-bold text-white ${submitting ? 'bg-blue-300' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {submitting ? 'Confirming...' : 'Confirm and Submit'}
        </button>
      </div>
    </div>
  );
};

export default PrescriptionReviewPage;
