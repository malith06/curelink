import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import prescriptionService from '../../../features/prescriptions/prescriptionService';

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
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md mt-10">
      <h1 className="text-2xl font-bold mb-4">Upload Prescription</h1>
      <p className="text-gray-600 mb-6">Upload a clear image (JPG/PNG) or PDF of your prescription for request #{requestId}. Our AI will extract the medicine details for you.</p>
      
      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}
      
      <form onSubmit={handleUpload}>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select File</label>
          <input 
            type="file" 
            accept=".jpg,.jpeg,.png,.pdf" 
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>
        
        <button 
          type="submit" 
          disabled={loading || !file}
          className={`w-full py-2 px-4 rounded font-bold text-white ${loading || !file ? 'bg-blue-300' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {loading ? 'Processing OCR (This may take a moment)...' : 'Upload and Scan'}
        </button>
      </form>
    </div>
  );
};

export default PrescriptionUploadPage;
