// src/pages/auth/ForceChangePassword.jsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/Card';
import { Label } from '../../components/ui/Label';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Loader2, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

const passwordSchema = z.object({
  oldPassword: z.string().min(1, 'Old password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Confirmation is required'),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const ForceChangePassword = () => {
  const navigate = useNavigate();
  const { user, changePassword } = useAuth();
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: { oldPassword: '', newPassword: '', confirmPassword: '' },
  });

  const onSubmit = async (data) => {
    try {
      await changePassword(data.oldPassword, data.newPassword);
      // Success is handled by useAuthStore
      navigate('/'); // Redirect to the user's main dashboard
    } catch (error) {
      console.error("Change Password Error:", error);
      // Error toast is handled by axios interceptor
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex min-h-[80vh] items-center justify-center p-4"
    >
      <Card className="w-full max-w-md shadow-xl border-4 border-destructive/50">
        <CardHeader className="text-center">
          <Lock className="h-10 w-10 text-destructive mx-auto mb-2" />
          <CardTitle className="text-3xl text-destructive">Password Required!</CardTitle>
          <CardDescription>
            You are logging in for the first time. Please set a secure password immediately.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            <div>
              <Label htmlFor="oldPassword">Current Password (Your Surname)</Label>
              <Input id="oldPassword" type="password" {...register('oldPassword')} placeholder="Surname or Current Password" />
              {errors.oldPassword && <p className="text-destructive text-sm mt-1">{errors.oldPassword.message}</p>}
            </div>

            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <Input id="newPassword" type="password" {...register('newPassword')} placeholder="Minimum 6 characters" />
              {errors.newPassword && <p className="text-destructive text-sm mt-1">{errors.newPassword.message}</p>}
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input id="confirmPassword" type="password" {...register('confirmPassword')} placeholder="Repeat new password" />
              {errors.confirmPassword && <p className="text-destructive text-sm mt-1">{errors.confirmPassword.message}</p>}
            </div>

            <Button type="submit" className="w-full bg-destructive hover:bg-destructive/90" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Set New Password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ForceChangePassword;