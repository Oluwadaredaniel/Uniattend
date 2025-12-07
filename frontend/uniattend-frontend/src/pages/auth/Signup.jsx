// src/pages/auth/Signup.jsx
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/Card';
import { Label } from '../../components/ui/Label';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/Select';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { signupApi } from '../../api/auth.api';
import { useAdminStore } from '../../store/useAdminStore';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const signupSchema = z.object({
  faculty: z.string().min(1, 'Faculty is required'),
  dept: z.string().min(1, 'Department is required'),
  level: z.string().min(1, 'Level is required'),
  option: z.string().optional(),
  regNo: z.string().regex(/^[A-Z0-9\/]+$/, 'Invalid Reg No format').min(5, 'Reg No is required'),
  surname: z.string().min(2, 'Surname (used as password) is required'),
});

const Signup = () => {
  const navigate = useNavigate();
  const { faculties, departments, loading, fetchFaculties, fetchDepartments, getDepartmentById } = useAdminStore();
  const [selectedFacultyId, setSelectedFacultyId] = useState('');
  const [selectedDeptId, setSelectedDeptId] = useState('');
  
  const form = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: { faculty: '', dept: '', level: '', option: '', regNo: '', surname: '' },
  });

  const { handleSubmit, register, formState: { errors, isSubmitting }, setValue, watch } = form;
  const watchDept = watch('dept');
  
  // 1. Fetch initial faculties
  useEffect(() => {
    fetchFaculties();
  }, [fetchFaculties]);

  // 2. Fetch departments when faculty changes
  useEffect(() => {
    if (selectedFacultyId) {
      fetchDepartments(selectedFacultyId);
    } else {
      useAdminStore.setState({ departments: [] });
    }
    setValue('dept', '');
    setValue('level', '');
    setValue('option', '');
  }, [selectedFacultyId, fetchDepartments, setValue]);

  // 3. Update selectedDeptId when dept changes
  useEffect(() => {
    setSelectedDeptId(watchDept);
  }, [watchDept]);

  const departmentData = getDepartmentById(selectedDeptId);
  const levels = departmentData?.levels || [];
  const options = departmentData?.options || [];

  const onSubmit = async (data) => {
    const facultyObj = faculties.find(f => f._id === data.faculty);
    const deptObj = departments.find(d => d._id === data.dept);

    try {
      // Backend validates against uploaded roster and assigns initial password (surname)
      await signupApi({
        regNo: data.regNo,
        surname: data.surname,
        facultyId: data.faculty,
        deptId: data.dept,
        level: data.level,
        option: data.option,
      });

      toast.success("Registration successful! Please log in to set your password.");
      navigate('/login');
    } catch (error) {
      console.error(error);
      // Backend error message is handled by the interceptor
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex min-h-[80vh] items-center justify-center p-4"
    >
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl">Student Sign-up</CardTitle>
          <CardDescription>Select your details and enter your registration info. Surname is your first-time password.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Faculty Dropdown */}
            <div>
              <Label htmlFor="faculty">Faculty</Label>
              <Select onValueChange={(value) => {
                setValue('faculty', value, { shouldValidate: true });
                setSelectedFacultyId(value);
              }} value={watch('faculty')} disabled={loading || isSubmitting}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Faculty" />
                </SelectTrigger>
                <SelectContent>
                  {faculties.map((f) => (
                    <SelectItem key={f._id} value={f._id}>{f.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.faculty && <p className="text-destructive text-sm mt-1">{errors.faculty.message}</p>}
            </div>

            {/* Department Dropdown */}
            <div>
              <Label htmlFor="dept">Department</Label>
              <Select onValueChange={(value) => setValue('dept', value, { shouldValidate: true })} value={watch('dept')} disabled={!selectedFacultyId || loading || isSubmitting}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((d) => (
                    <SelectItem key={d._id} value={d._id}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.dept && <p className="text-destructive text-sm mt-1">{errors.dept.message}</p>}
            </div>

            {/* Level Dropdown */}
            <div>
              <Label htmlFor="level">Level</Label>
              <Select onValueChange={(value) => setValue('level', value, { shouldValidate: true })} value={watch('level')} disabled={!selectedDeptId || levels.length === 0 || isSubmitting}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Level" />
                </SelectTrigger>
                <SelectContent>
                  {levels.map((l) => (
                    <SelectItem key={l} value={l}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.level && <p className="text-destructive text-sm mt-1">{errors.level.message}</p>}
            </div>

            {/* Option Dropdown (Conditional) */}
            {options.length > 0 && (
              <div>
                <Label htmlFor="option">Option (if applicable)</Label>
                <Select onValueChange={(value) => setValue('option', value)} value={watch('option')} disabled={isSubmitting}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Option" />
                  </SelectTrigger>
                  <SelectContent>
                    {options.map((o) => (
                      <SelectItem key={o} value={o}>{o}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.option && <p className="text-destructive text-sm mt-1">{errors.option.message}</p>}
              </div>
            )}
            
            {/* Reg No Input */}
            <div>
              <Label htmlFor="regNo">Registration Number</Label>
              <Input id="regNo" {...register('regNo')} placeholder="E.g., CS/2021/001" className="uppercase" />
              {errors.regNo && <p className="text-destructive text-sm mt-1">{errors.regNo.message}</p>}
            </div>

            {/* Surname Input */}
            <div>
              <Label htmlFor="surname">Surname (First-time Password)</Label>
              <Input id="surname" type="password" {...register('surname')} placeholder="Your Surname" />
              {errors.surname && <p className="text-destructive text-sm mt-1">{errors.surname.message}</p>}
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Sign Up'}
            </Button>
            
            <p className="text-center text-sm text-muted-foreground mt-4">
              Already have an account? <Link to="/login" className="text-primary hover:underline">Log in</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default Signup;