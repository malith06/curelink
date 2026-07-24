import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Mail, Lock, Store, Loader2, ArrowRight } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';

const pharmacyRegisterSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const PharmacyRegisterPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(pharmacyRegisterSchema),
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const res = await axiosClient.post('/auth/register/pharmacy', data);
      
      const { token, user } = res.data.data;
      // Auto login the newly registered pharmacy to continue onboarding
      login(token, user);
      
      toast.success('Pharmacy account created! Please complete your profile.');
      navigate('/pharmacy/profile'); // Redirect to profile setup
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-2">
          <div className="p-3 bg-primary-100 rounded-full">
            <Store className="w-8 h-8 text-primary" />
          </div>
        </div>
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          Partner with <span className="text-primary">CureLink</span>
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Create a pharmacy account to receive medicine requests and boost your sales
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-100">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Business Email</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('email')}
                  type="email"
                  className={`focus:ring-primary focus:border-primary block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 px-3 border outline-none transition-colors ${errors.email ? 'border-red-500' : ''}`}
                  placeholder="pharmacy@example.com"
                />
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('password')}
                  type="password"
                  className={`focus:ring-primary focus:border-primary block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 px-3 border outline-none transition-colors ${errors.password ? 'border-red-500' : ''}`}
                  placeholder="••••••••"
                />
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
            </div>
            
            <div className="bg-primary-50 p-4 rounded-md border border-primary-100 text-sm text-primary-900">
              <strong>Next steps:</strong> After creating your account, you'll be prompted to provide your pharmacy's license number, location, and operating hours to complete the verification process.
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>
                    Continue to Profile Setup
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-gray-500">Already a partner? </span>
            <Link to="/login" className="font-medium text-primary hover:text-primary-700">
              Sign in here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PharmacyRegisterPage;
