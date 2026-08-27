import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Mail, Lock, Store, ArrowRight, User, Phone } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Card, CardContent } from '../../components/ui/Card';

const pharmacyRegisterSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name cannot be more than 100 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(5, 'Please provide a valid phone number'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string({ required_error: "Confirm password is required" }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
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
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-slate-50">
      {/* Modern Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-200/50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
      <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-indigo-200/50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-20%] left-[20%] w-[40%] h-[40%] bg-blue-200/50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>

      <div className="w-full max-w-md z-10 mt-10">
        <div className="text-center mb-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-600 to-indigo-700 text-white shadow-lg shadow-primary-500/30 mb-6 transform transition-transform hover:scale-105">
            <Store className="h-8 w-8" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Partner with CureLink
          </h2>
          <p className="mt-3 text-sm text-slate-600 font-medium">
            Create a pharmacy account to receive medicine requests
          </p>
        </div>

        <Card className="border-0 shadow-[0_8px_30px_rgb(0,0,0,0.08)] bg-white/80 backdrop-blur-xl rounded-3xl overflow-hidden mb-8">
          <CardContent className="p-8">
            <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Pharmacy Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Store className="h-5 w-5 text-slate-400" />
                  </div>
                  <Input
                    {...register('fullName')}
                    type="text"
                    className="pl-10"
                    placeholder="Health First Pharmacy"
                    error={errors.fullName}
                  />
                </div>
                {errors.fullName && <p className="text-sm text-red-600">{errors.fullName.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Business Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <Input
                    {...register('email')}
                    type="email"
                    className="pl-10"
                    placeholder="pharmacy@example.com"
                    error={errors.email}
                  />
                </div>
                {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Business Phone</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-slate-400" />
                  </div>
                  <Input
                    {...register('phone')}
                    type="tel"
                    className="pl-10"
                    placeholder="0712345678"
                    error={errors.phone}
                  />
                </div>
                {errors.phone && <p className="text-sm text-red-600">{errors.phone.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <Input
                    {...register('password')}
                    type="password"
                    className="pl-10"
                    placeholder="••••••••"
                    error={errors.password}
                  />
                </div>
                {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Confirm Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <Input
                    {...register('confirmPassword')}
                    type="password"
                    className="pl-10"
                    placeholder="••••••••"
                    error={errors.confirmPassword}
                  />
                </div>
                {errors.confirmPassword && <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>}
              </div>
              
              <div className="bg-primary-50 p-4 rounded-lg border border-primary-100 text-sm text-primary-900 mt-2">
                <strong>Next steps:</strong> After creating your account, you'll be prompted to provide your pharmacy's license number, location, and operating hours to complete the verification process.
              </div>

              <Button
                type="submit"
                className="w-full mt-4"
                isLoading={loading}
              >
                Continue to Profile Setup <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>

            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-slate-500">Already a partner?</span>
                </div>
              </div>

              <div className="mt-6">
                <Link to="/login">
                  <Button variant="outline" className="w-full text-slate-700">
                    Sign in here
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PharmacyRegisterPage;
