import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import prescriptionService from '../../features/prescriptions/prescriptionService';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { UploadCloud, FileText, CheckCircle } from 'lucide-react';

const PrescriptionUploadPage = () => {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a file first.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await prescriptionService.uploadPrescription(requestId, file);
      const prescriptionId = result.data.prescriptionId;
      
      // After upload, trigger OCR processing
      await prescriptionService.processOcr(prescriptionId);
      
      // Navigate to review page
      navigate(`/customer/requests/${requestId}/prescription/${prescriptionId}/review`);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Upload failed');
      setLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 bg-slate-50 min-h-screen pb-20">
      {/* Modern Header Section */}
      <div className="bg-[#0B1354] pb-24 pt-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden rounded-b-[3rem] mb-[-4rem]">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500 rounded-full mix-blend-screen filter blur-[80px] opacity-30 animate-pulse"></div>
        
        <div className="max-w-2xl mx-auto relative z-10 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">Upload Prescription</h1>
          <p className="mt-3 text-blue-100 font-medium max-w-lg mx-auto">
            Upload a clear image or PDF for request #{requestId}. Our AI will automatically extract the medicine details.
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 relative z-20">
        {error && <div className="mb-6 p-4 bg-rose-50 text-rose-700 rounded-2xl border border-rose-100 text-sm font-bold flex items-center shadow-sm">{error}</div>}
        
        <Card className="border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl overflow-hidden">
          <CardContent className="p-8">
            <form onSubmit={handleUpload} className="space-y-6">
            
            <div className="border-2 border-dashed border-slate-300 rounded-2xl p-12 text-center hover:bg-slate-50 hover:border-[#0B1354]/50 transition-colors relative group">
              <input 
                type="file" 
                accept=".jpg,.jpeg,.png,.pdf" 
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center justify-center space-y-3">
                {file ? (
                  <>
                    <div className="p-3 bg-emerald-100 text-emerald-600 rounded-full">
                      <CheckCircle className="w-8 h-8" />
                    </div>
                    <p className="text-sm font-medium text-[#0B1354]">{file.name}</p>
                    <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </>
                ) : (
                  <>
                    <div className="p-3 bg-[#0B1354]/10 text-[#0B1354] rounded-full group-hover:scale-110 transition-transform">
                      <UploadCloud className="w-8 h-8" />
                    </div>
                    <p className="text-sm font-medium text-slate-900">Click or drag file to upload</p>
                    <p className="text-xs text-slate-500">Supports JPG, PNG, PDF</p>
                  </>
                )}
              </div>
            </div>
            
            <Button 
              type="submit" 
              fullWidth 
              disabled={loading || !file}
              isLoading={loading}
              icon={FileText}
            >
              {loading ? 'Processing OCR (This may take a moment)...' : 'Upload and Scan'}
            </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PrescriptionUploadPage;
