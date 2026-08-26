import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import prescriptionService from '../../../features/prescriptions/prescriptionService';
import { Card, CardContent } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
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
      const prescriptionId = result.data._id;
      
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
    <div className="mx-auto px-4 py-12 max-w-2xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-[#0B1354] tracking-tight">Upload Prescription</h1>
        <p className="mt-2 text-slate-600">
          Upload a clear image or PDF for request #{requestId}. Our AI will extract the medicine details.
        </p>
      </div>
      
      {error && <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 text-sm font-medium">{error}</div>}
      
      <Card className="border-t-4 border-t-[#0B1354] shadow-sm rounded-2xl">
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
  );
};

export default PrescriptionUploadPage;
