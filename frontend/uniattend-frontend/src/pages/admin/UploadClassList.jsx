// src/pages/admin/UploadClassList.jsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Label } from '../../components/ui/Label';
import { UploadCloud, FileText, Loader2, Table2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { uploadClassListApi } from '../../api/admin.api';
import * as XLSX from 'xlsx';

const fileSchema = z.object({
  classlist: z.instanceof(FileList).refine(files => files.length > 0, 'Class list file is required.'),
});

const UploadClassList = () => {
  const [previewData, setPreviewData] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  
  const form = useForm({
    resolver: zodResolver(fileSchema),
  });
  
  const { register, handleSubmit, formState: { errors }, reset } = form;

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) {
      setPreviewData([]);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert to JSON, skipping header (assumed row 1 is header)
        const json = XLSX.utils.sheet_to_json(worksheet, { 
          header: 1, 
          range: 1, 
          raw: false 
        });

        // Take the first few rows for preview
        const headers = ["Reg No", "Surname", "Firstname", "Department", "Level", "Option"];
        const preview = json.slice(0, 5).map(row => 
          Object.fromEntries(headers.map((key, i) => [key, row[i] || '']))
        );
        setPreviewData(preview);
      } catch (error) {
        toast.error("Error reading file. Ensure it's a valid Excel format.");
        setPreviewData([]);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const onSubmit = async (data) => {
    const file = data.classlist[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('studentListFile', file);
    
    setIsUploading(true);
    try {
      const result = await uploadClassListApi(formData);
      toast.success(`Upload complete! Roster updated: ${result.summary.userUpserted} students processed.`);
      if (result.errors.length > 0) {
        toast.error(`${result.errors.length} errors occurred. Check console for details.`);
        console.error("Upload Errors:", result.errors);
      }
      setPreviewData([]);
      reset();
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <h1 className="text-3xl font-bold">Roster Upload (Master Class List)</h1>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Upload Master List</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="classlist">Choose Excel/CSV File (Required Format)</Label>
              <Input 
                id="classlist" 
                type="file" 
                accept=".xlsx, .xls, .csv" 
                {...register('classlist', { onChange: handleFileChange })} 
                disabled={isUploading}
              />
              {errors.classlist && <p className="text-destructive text-sm mt-1">{errors.classlist.message}</p>}
            </div>
            
            <div className="p-4 border rounded-md bg-muted/50">
              <p className="font-semibold text-sm mb-2 flex items-center"><FileText className="h-4 w-4 mr-2" /> Expected Columns (in order):</p>
              <code className="block bg-background p-2 rounded text-sm text-primary">
                Reg No, Surname, Firstname, Dept Name, Level, Option
              </code>
              <p className="text-xs mt-2 text-muted-foreground">The system uses Dept Name to find the correct Department ID.</p>
            </div>

            <Button type="submit" className="w-full" disabled={isUploading || previewData.length === 0}>
              {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
              Upload and Process Roster
            </Button>
          </form>
        </CardContent>
      </Card>
      
      {previewData.length > 0 && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2"><Table2 /> File Preview (First 5 Rows)</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Simple table to show preview data */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr className="text-left font-medium text-muted-foreground">
                    {Object.keys(previewData[0]).map(key => <th key={key} className="px-4 py-2">{key}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {previewData.map((row, index) => (
                    <tr key={index} className="border-b last:border-b-0 hover:bg-muted/50">
                      {Object.values(row).map((val, i) => <td key={i} className="px-4 py-2">{val}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
};

export default UploadClassList;