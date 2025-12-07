// src/pages/auth/Login.jsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/Card';
import { Label } from '../../components/ui/Label';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const loginSchema = z.object({
  regNo: z.string().min(1, 'Registration Number is required'),
  password: z.string().min(1, 'Password is required'),
});

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { regNo: '', password: '' },
  });

  const onSubmit = async (data) => {
    try {
      const userData = await login(data.regNo, data.password);
      
      if (userData.requiresPasswordChange) {
        navigate('/force-change-password');
      } else {
        // Redirect based on role (handled by App.jsx, which redirects to '/')
        navigate('/');
      }
    } catch (error) {
      console.error("Login Error:", error);
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
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl">UniAttend Login</CardTitle>
          <CardDescription>Enter your Registration Number and Password.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            <div>
              <Label htmlFor="regNo">Registration Number</Label>
              <Input id="regNo" {...register('regNo')} placeholder="E.g., CS/2021/001" className="uppercase" />
              {errors.regNo && <p className="text-destructive text-sm mt-1">{errors.regNo.message}</p>}
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" {...register('password')} placeholder="Password or Surname" />
              {errors.password && <p className="text-destructive text-sm mt-1">{errors.password.message}</p>}
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Log In'}
            </Button>
            
            <p className="text-center text-sm text-muted-foreground mt-4">
              First time logging in? <Link to="/signup" className="text-primary hover:underline">Sign Up</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default Login;