import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import prescriptionService from '../../../features/prescriptions/prescriptionService';

const PrescriptionVerificationPage = () => {
  const { requestId, prescriptionId } = useParams();
  const navigate = useNavigate();
  
  const [ocrData, setOcrData] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [fileUrl, setFileUrl] = useState(null);
  
  const [generalNotes, setGeneralNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ocrResponse, accessResponse] = await Promise.all([
          prescriptionService.getOcrResults(prescriptionId),
          prescriptionService.getPrescriptionAccessUrl(prescriptionId)
        ]);

        setOcrData(ocrResponse.data);
        
        // Initialize verification state
        const initialMedicines = (ocrResponse.data.extractedMedicines || []).map(med => ({
          medicineId: med.matchedMedicineId?._id || null,
          isVerified: false,
          pharmacistNotes: '',
          name: med.matchedMedicineId ? med.matchedMedicineId.name : med.rawDetectedText,
          quantity: med.quantity || 1
        }));
        
        setMedicines(initialMedicines);
        setFileUrl(accessResponse.data.url);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
        setLoading(false);
      }
    };
    fetchData();
  }, [prescriptionId]);

  const handleMedicineVerifyToggle = (index) => {
    const updated = [...medicines];
    updated[index].isVerified = !updated[index].isVerified;
    setMedicines(updated);
  };

  const handleNotesChange = (index, notes) => {
    const updated = [...medicines];
    updated[index].pharmacistNotes = notes;
    setMedicines(updated);
  };

  const handleSubmit = async (status) => {
    if (status === 'REJECTED' && !rejectionReason.trim()) {
      setError("Please provide a reason for rejecting this prescription.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const verificationData = {
      verificationStatus: status,
      generalNotes,
      rejectionReason: status === 'REJECTED' ? rejectionReason : undefined,
      verifiedMedicines: medicines.map(m => ({
        medicineId: m.medicineId,
        isVerified: m.isVerified,
        pharmacistNotes: m.pharmacistNotes
      }))
    };

    try {
      await prescriptionService.submitVerification(prescriptionId, verificationData);
      navigate(`/pharmacy/requests/${requestId}`); // Go back to request details
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading prescription data...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 mt-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left side: Prescription Image */}
      <div className="bg-white p-4 rounded-lg shadow-md flex flex-col">
        <h2 className="text-xl font-bold mb-4">Original Prescription</h2>
        <div className="flex-1 bg-gray-100 rounded border border-gray-300 overflow-hidden min-h-[500px]">
          {fileUrl ? (
            <iframe src={fileUrl} className="w-full h-full min-h-[500px]" title="Prescription File" />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">Failed to load prescription file</div>
          )}
        </div>
      </div>

      {/* Right side: Verification Form */}
      <div className="bg-white p-6 rounded-lg shadow-md flex flex-col">
        <h2 className="text-xl font-bold mb-2">Pharmacist Verification</h2>
        <p className="text-gray-600 mb-6 text-sm">Review the items requested by the customer against the uploaded prescription document.</p>
        
        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">{error}</div>}

        <div className="flex-1 overflow-y-auto mb-6 pr-2">
          <h3 className="text-lg font-semibold mb-3 border-b pb-2">Requested Items</h3>
          
          {medicines.length === 0 ? (
            <p className="text-gray-500 italic text-sm">No specific items were extracted.</p>
          ) : (
            <div className="space-y-4">
              {medicines.map((med, idx) => (
                <div key={idx} className={`p-4 border rounded-md ${med.isVerified ? 'border-green-400 bg-green-50' : 'border-gray-200'}`}>
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <div className="font-bold">{med.name}</div>
                      <div className="text-sm text-gray-600">Requested Qty: {med.quantity}</div>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={med.isVerified}
                        onChange={() => handleMedicineVerifyToggle(idx)}
                        className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                      />
                      <span className="font-medium text-sm">Verified</span>
                    </label>
                  </div>
                  
                  <div>
                    <input 
                      type="text" 
                      placeholder="Optional notes for this item (e.g., substitute applied)"
                      value={med.pharmacistNotes}
                      onChange={(e) => handleNotesChange(idx, e.target.value)}
                      className="w-full text-sm p-2 border rounded border-gray-300"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6">
            <label className="block text-sm font-semibold mb-1">General Notes</label>
            <textarea 
              rows="2"
              value={generalNotes}
              onChange={(e) => setGeneralNotes(e.target.value)}
              className="w-full p-2 border rounded border-gray-300 text-sm"
              placeholder="Any overall notes about this prescription..."
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm font-semibold mb-1 text-red-600">Rejection Reason (if applicable)</label>
            <textarea 
              rows="2"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full p-2 border rounded border-gray-300 text-sm"
              placeholder="If you cannot fulfill this prescription, please provide a reason..."
            />
          </div>
        </div>

        <div className="flex justify-between items-center border-t pt-4">
          <button 
            onClick={() => handleSubmit('REJECTED')}
            disabled={submitting}
            className={`px-4 py-2 rounded font-bold text-red-700 bg-red-100 hover:bg-red-200 ${submitting ? 'opacity-50' : ''}`}
          >
            Reject Prescription
          </button>
          
          <button 
            onClick={() => handleSubmit('APPROVED')}
            disabled={submitting || !medicines.some(m => m.isVerified)}
            className={`px-6 py-2 rounded font-bold text-white ${submitting || !medicines.some(m => m.isVerified) ? 'bg-green-300' : 'bg-green-600 hover:bg-green-700'}`}
          >
            Approve & Verify
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionVerificationPage;
