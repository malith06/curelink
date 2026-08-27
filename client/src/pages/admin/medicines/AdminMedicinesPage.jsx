import React, { useState, useEffect } from 'react';
import { Pill, Plus, Edit2, Trash2, X, AlertCircle, Download } from 'lucide-react';
import { toast } from 'react-toastify';
import adminService from '../../../features/admin/adminService';
import { Card, CardContent, CardHeader } from '../../../components/ui/Card';
import Skeleton from '../../../components/ui/Skeleton';
import EmptyState from '../../../components/ui/EmptyState';
import Badge from '../../../components/ui/Badge';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { generatePDFReport } from '../../../utils/reportGenerator';

const AdminMedicinesPage = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    category: '',
    description: '',
    manufacturer: '',
    prescriptionRequired: false
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
        name: medicine.name || '',
        brand: medicine.brand || '',
        category: medicine.category || '',
        description: medicine.description || '',
        manufacturer: medicine.manufacturer || '',
        prescriptionRequired: medicine.prescriptionRequired || false
      });
    } else {
      setIsEditMode(false);
      setEditingId(null);
      setFormData({
        name: '',
        brand: '',
        category: '',
        description: '',
        manufacturer: '',
        prescriptionRequired: false
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
      const errorMsg = error.response?.data?.errors?.[0] || error.response?.data?.message || 'Failed to save medicine';
      toast.error(errorMsg);
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

  const handleDownloadReport = () => {
    const columns = ['Generic Name', 'Brand Name', 'Category', 'Manufacturer', 'Prescription Required'];
    const rows = medicines.map(med => [
      med.name,
      med.brand || '-',
      med.category || '-',
      med.manufacturer || '-',
      med.prescriptionRequired ? 'Yes' : 'No'
    ]);
    generatePDFReport(
      'Medicines Catalogue Report',
      columns,
      rows,
      `curelink_medicines_${new Date().getTime()}.pdf`
    );
    toast.success('Report downloaded successfully!');
  };

  return (
    <div className="animate-in fade-in duration-500 bg-slate-50 min-h-screen">
      {/* Modern Header Section */}
      <div className="bg-[#0B1354] pb-24 pt-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden rounded-b-[3rem] mb-[-4rem]">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500 rounded-full mix-blend-screen filter blur-[80px] opacity-30 animate-pulse"></div>
        
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">Medicine Catalogue</h1>
            <p className="mt-2 text-blue-100 font-medium">Manage the global database of medicines available on CureLink.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 shadow-lg backdrop-blur-md"
              icon={Download}
              onClick={handleDownloadReport}
              disabled={medicines.length === 0}
            >
              Download PDF
            </Button>
            <Button 
              onClick={() => handleOpenModal()}
              icon={Plus}
              className="bg-white text-[#0B1354] hover:bg-slate-100 shadow-lg font-bold"
            >
              Add Medicine
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 relative z-20">
        <Card className="overflow-hidden mb-8 border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl">
          {loading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : medicines.length === 0 ? (
            <EmptyState
              icon={Pill}
              title="No medicines found"
              message="Your medicine catalogue is currently empty. Add medicines to get started."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-100 text-xs uppercase font-bold tracking-wider">
                  <tr>
                    <th className="px-6 py-4 whitespace-nowrap">Generic Name</th>
                    <th className="px-6 py-4 whitespace-nowrap">Brand Name</th>
                    <th className="px-6 py-4 whitespace-nowrap">Category</th>
                    <th className="px-6 py-4 whitespace-nowrap">Prescription</th>
                    <th className="px-6 py-4 whitespace-nowrap text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-50">
                  {medicines.map((med) => (
                    <tr key={med._id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-slate-900 group-hover:text-primary-600 transition-colors">{med.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-slate-600">{med.brand || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-slate-600">{med.category || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {med.prescriptionRequired ? (
                          <Badge variant="destructive" className="bg-red-50 text-red-700 border-red-200 shadow-sm">Required</Badge>
                        ) : (
                          <Badge variant="success" className="bg-green-50 text-green-700 border-green-200 shadow-sm">No</Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-3 transition-opacity">
                           <button onClick={() => handleOpenModal(med)} className="p-2 text-primary-600 hover:bg-primary-50 hover:scale-110 rounded-lg transition-all shadow-sm" title="Edit">
                             <Edit2 className="w-4 h-4" />
                           </button>
                           <button onClick={() => handleDelete(med._id)} className="p-2 text-red-600 hover:bg-red-50 hover:scale-110 rounded-lg transition-all shadow-sm" title="Delete">
                             <Trash2 className="w-4 h-4" />
                           </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Pill className="w-5 h-5 text-primary-500" />
                {isEditMode ? 'Edit Medicine' : 'Add New Medicine'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-colors">
                 <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-5 mb-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Generic Name <span className="text-red-500">*</span></label>
                  <Input
                    required
                    placeholder="e.g. Paracetamol"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                 <div>
                   <label className="block text-sm font-bold text-slate-700 mb-2">Brand Name <span className="text-red-500">*</span></label>
                   <Input
                     required
                     placeholder="e.g. Panadol"
                     value={formData.brand}
                     onChange={(e) => setFormData({...formData, brand: e.target.value})}
                   />
                 </div>
              </div>
              
              <div className="grid grid-cols-2 gap-5 mb-5">
                 <div>
                   <label className="block text-sm font-bold text-slate-700 mb-2">Category <span className="text-red-500">*</span></label>
                   <Input
                     required
                     placeholder="e.g. Pain Relief"
                     value={formData.category}
                     onChange={(e) => setFormData({...formData, category: e.target.value})}
                   />
                 </div>
                 <div>
                   <label className="block text-sm font-bold text-slate-700 mb-2">Manufacturer <span className="text-red-500">*</span></label>
                   <Input
                     required
                     placeholder="e.g. GSK"
                     value={formData.manufacturer}
                     onChange={(e) => setFormData({...formData, manufacturer: e.target.value})}
                   />
                 </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                <textarea
                  placeholder="Brief description of the medicine's uses..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all duration-200 h-28 resize-none font-medium text-slate-900 placeholder:text-slate-400 placeholder:font-normal"
                />
              </div>
              
              <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                 <div className="flex items-center h-5 mt-0.5">
                   <input
                     type="checkbox"
                     id="prescriptionRequired"
                     checked={formData.prescriptionRequired}
                     onChange={(e) => setFormData({...formData, prescriptionRequired: e.target.checked})}
                     className="h-4 w-4 text-primary-600 rounded border-slate-300 focus:ring-primary-500"
                   />
                </div>
                <div>
                   <label htmlFor="prescriptionRequired" className="text-sm font-bold text-slate-900 cursor-pointer select-none">
                     Requires Prescription
                   </label>
                   <p className="text-xs text-slate-500 font-medium mt-1">Check this if the medicine requires a valid prescription to be sold.</p>
                </div>
              </div>
              
              <div className="pt-6 mt-6 border-t border-slate-100 flex justify-end gap-3">
                <Button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  isLoading={submitting}
                >
                  {isEditMode ? 'Update Medicine' : 'Save Medicine'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMedicinesPage;
