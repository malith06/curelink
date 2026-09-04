import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckSquare, XSquare, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import prescriptionService from '../../../features/prescriptions/prescriptionService';
import { Card, CardContent, CardHeader } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';

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

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0B1354] mx-auto mb-4"></div>
        <p className="text-slate-600 font-medium">Loading prescription data...</p>
      </div>
    </div>
  );

  if (error && !ocrData) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-red-50 text-red-700 p-6 rounded-2xl border border-red-100 max-w-md text-center">
        <AlertCircle className="w-10 h-10 mx-auto mb-3" />
        <p className="font-bold text-lg mb-1">Failed to Load</p>
        <p className="text-sm">{error}</p>
      </div>
    </div>
  );

  return (
    <div className="animate-in fade-in duration-500 bg-slate-50 min-h-screen pb-20">
      {/* Modern Header Section */}
      <div className="bg-[#0B1354] pb-24 pt-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden rounded-b-[3rem] mb-[-4rem]">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500 rounded-full mix-blend-screen filter blur-[80px] opacity-30 animate-pulse"></div>
        
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col gap-6">
          <button onClick={() => navigate(`/pharmacy/requests/${requestId}`)} className="text-blue-200 hover:text-white flex items-center text-sm font-medium w-fit group transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1 transition-transform group-hover:-translate-x-1" /> Back to Request
          </button>
          
          <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
            <div className="flex items-center gap-4">
               <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-lg">
                  <CheckSquare className="w-7 h-7 text-white" />
               </div>
               <div>
                 <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight flex items-center gap-4">
                   Prescription Verification
                 </h1>
                 <p className="mt-1 text-blue-100 font-medium">
                   Review the uploaded prescription against requested items.
                 </p>
               </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left side: Prescription Image */}
          <Card className="flex flex-col h-[700px]">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary-500" />
                Original Prescription
              </h2>
            </CardHeader>
            <CardContent className="p-0 flex-1 relative bg-slate-100">
              {fileUrl ? (
                <iframe src={fileUrl} className="w-full h-full absolute inset-0" title="Prescription File" />
              ) : (
                <div className="flex items-center justify-center h-full text-slate-500 font-medium">Failed to load prescription file</div>
              )}
            </CardContent>
          </Card>

          {/* Right side: Verification Form */}
          <Card className="flex flex-col h-[700px] overflow-hidden">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4 shadow-sm z-10">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary-500" />
                Pharmacist Verification
              </h2>
              <p className="text-slate-500 mt-2 text-sm font-medium">Review the items requested by the customer against the uploaded prescription document.</p>
            </CardHeader>
            
            <CardContent className="p-0 flex-1 flex flex-col overflow-hidden">
                {error && <div className="p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl text-sm font-medium flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  {error}
                </div>}

              <div className="flex-1 overflow-y-auto mb-6 pr-2">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Requested Items</h3>
                
                {medicines.length === 0 ? (
                  <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-white">
                    <p className="text-slate-500 font-medium">No specific items were extracted.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {medicines.map((med, idx) => (
                      <div key={idx} className={`p-5 border-2 rounded-2xl transition-all ${med.isVerified ? 'border-green-400 bg-green-50/50 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                        <div className="flex items-start justify-between gap-4 mb-4">
                          <div>
                            <div className="font-bold text-slate-900 text-lg">{med.name}</div>
                            <div className="text-sm font-medium text-slate-500 mt-1">Requested Qty: {med.quantity}</div>
                          </div>
                          <label className="flex items-center gap-3 cursor-pointer select-none group bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-sm hover:border-green-300 transition-colors">
                            <input 
                              type="checkbox" 
                              checked={med.isVerified}
                              onChange={() => handleMedicineVerifyToggle(idx)}
                              className="w-5 h-5 text-green-600 rounded-md border-slate-300 focus:ring-green-500 focus:ring-offset-0"
                            />
                            <span className={`font-bold text-sm ${med.isVerified ? 'text-green-700' : 'text-slate-600 group-hover:text-slate-900'}`}>Verified</span>
                          </label>
                        </div>
                        
                        <div>
                          <input 
                            type="text" 
                            placeholder="Optional notes for this item (e.g., substitute applied)"
                            value={med.pharmacistNotes}
                            onChange={(e) => handleNotesChange(idx, e.target.value)}
                            className="w-full text-sm p-3 border rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all placeholder:text-slate-400 font-medium"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-8 space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">General Notes</label>
                    <textarea 
                      rows="3"
                      value={generalNotes}
                      onChange={(e) => setGeneralNotes(e.target.value)}
                      className="w-full p-4 border rounded-2xl border-slate-200 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white placeholder:text-slate-400 font-medium resize-none shadow-sm"
                      placeholder="Any overall notes about this prescription..."
                    />
                  </div>

                  <div className="p-5 bg-red-50 rounded-2xl border border-red-100">
                    <label className="block text-sm font-bold text-red-700 mb-2 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" /> Rejection Reason <span className="font-medium opacity-80">(if applicable)</span>
                    </label>
                    <textarea 
                      rows="2"
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="w-full p-3 border rounded-xl border-red-200 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white placeholder:text-red-300 font-medium resize-none shadow-sm"
                      placeholder="If you cannot fulfill this prescription, please provide a reason..."
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center p-6 border-t border-slate-100 bg-white shadow-[0_-4px_20px_rgb(0,0,0,0.02)] z-10">
                <Button 
                  onClick={() => handleSubmit('REJECTED')}
                  disabled={submitting}
                  variant="outline"
                  className="!text-red-600 !border-red-200 hover:!bg-red-50 hover:!border-red-300 font-bold"
                >
                  Reject Prescription
                </Button>
                
                <Button 
                  onClick={() => handleSubmit('APPROVED')}
                  disabled={submitting || !medicines.some(m => m.isVerified)}
                  isLoading={submitting}
                  size="lg"
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Approve & Verify
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionVerificationPage;
