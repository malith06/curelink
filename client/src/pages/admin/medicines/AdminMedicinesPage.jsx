import React, { useState, useEffect } from 'react';
import { Loader2, Plus, Edit2, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import adminService from '../../../features/admin/adminService';

const AdminMedicinesPage = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    genericName: '',
    brandName: '',
    category: '',
    description: '',
    requiresPrescription: false
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      const res = await adminService.getMedicines({ limit: 100 });
      setMedicines(res.data.items || res.data || []);
    } catch (error) {
      toast.error('Failed to load medicines');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (medicine = null) => {
    if (medicine) {
      setIsEditMode(true);
      setEditingId(medicine._id);
      setFormData({
        genericName: medicine.genericName || '',
        brandName: medicine.brandName || '',
        category: medicine.category || '',
        description: medicine.description || '',
        requiresPrescription: medicine.requiresPrescription || false
      });
    } else {
      setIsEditMode(false);
      setEditingId(null);
      setFormData({
        genericName: '',
        brandName: '',
        category: '',
        description: '',
        requiresPrescription: false
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      if (isEditMode) {
        await adminService.updateMedicine(editingId, formData);
        toast.success('Medicine updated successfully');
      } else {
        await adminService.createMedicine(formData);
        toast.success('Medicine added successfully');
      }
      setIsModalOpen(false);
      fetchMedicines();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save medicine');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this medicine?')) return;
    try {
      await adminService.deleteMedicine(id);
      toast.success('Medicine deleted');
      fetchMedicines();
    } catch (error) {
      toast.error('Failed to delete medicine');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Medicine Catalogue</h1>
          <p className="mt-2 text-gray-600">Manage the global database of medicines available on CureLink.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-700 flex items-center transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Medicine
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Generic Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Brand Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prescription</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {medicines.map((med) => (
                  <tr key={med._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {med.genericName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {med.brandName || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {med.category || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {med.requiresPrescription ? (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Required</span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">No</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => handleOpenModal(med)} className="text-blue-600 hover:text-blue-900 mr-4">
                        <Edit2 className="w-4 h-4 inline" />
                      </button>
                      <button onClick={() => handleDelete(med._id)} className="text-red-600 hover:text-red-900">
                        <Trash2 className="w-4 h-4 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h2 className="text-lg font-bold text-gray-900">
                {isEditMode ? 'Edit Medicine' : 'Add New Medicine'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Generic Name *</label>
                <input
                  type="text"
                  required
                  value={formData.genericName}
                  onChange={(e) => setFormData({...formData, genericName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Brand Name</label>
                <input
                  type="text"
                  value={formData.brandName}
                  onChange={(e) => setFormData({...formData, brandName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-primary outline-none"
                  placeholder="e.g. Antibiotic, Painkiller"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-primary outline-none h-24"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="requiresPrescription"
                  checked={formData.requiresPrescription}
                  onChange={(e) => setFormData({...formData, requiresPrescription: e.target.checked})}
                  className="h-4 w-4 text-primary rounded border-gray-300 focus:ring-primary"
                />
                <label htmlFor="requiresPrescription" className="ml-2 block text-sm text-gray-700">
                  Requires Prescription
                </label>
              </div>
              
              <div className="pt-4 border-t border-gray-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-700 disabled:opacity-50 flex items-center"
                >
                  {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {isEditMode ? 'Update' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMedicinesPage;
