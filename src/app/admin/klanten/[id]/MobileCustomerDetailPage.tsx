'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Mail, Phone, Calendar, Star, Users, Dumbbell, Apple, Calculator, Edit, Trash2, Download, Share2, Eye, X, Ruler, TrendingUp, Plus, Clock, Target, Award, Camera, Upload, Image as ImageIcon, DollarSign } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';

// Edit Pricing Form Component
function EditPricingForm({ pricing, onSave, onCancel }: { pricing: any, onSave: (data: any) => void, onCancel: () => void }) {
  const [formData, setFormData] = useState({
    service: pricing.service || '',
    duration: pricing.duration || '',
    frequency: pricing.frequency || '',
    discount: pricing.discount || '',
    includeNutritionPlan: pricing.includeNutritionPlan || false,
    nutritionPlanCount: pricing.nutritionPlanCount || 0,
    finalPrice: pricing.finalPrice || 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Service</label>
        <input
          type="text"
          value={formData.service}
          onChange={(e) => setFormData({...formData, service: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Duration (weeks)</label>
          <input
            type="number"
            value={formData.duration}
            onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value) || 0})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Frequency (per week)</label>
          <input
            type="number"
            value={formData.frequency}
            onChange={(e) => setFormData({...formData, frequency: parseInt(e.target.value) || 0})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Discount (%)</label>
          <input
            type="number"
            value={formData.discount}
            onChange={(e) => setFormData({...formData, discount: parseInt(e.target.value) || 0})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Final Price (RON)</label>
          <input
            type="number"
            value={formData.finalPrice}
            onChange={(e) => setFormData({...formData, finalPrice: parseFloat(e.target.value) || 0})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            required
          />
        </div>
      </div>

      <div>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.includeNutritionPlan}
            onChange={(e) => setFormData({...formData, includeNutritionPlan: e.target.checked})}
            className="mr-2"
          />
          <span className="text-sm font-medium text-gray-700">Include Nutrition Plan</span>
        </label>
      </div>

      {formData.includeNutritionPlan && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Number of Nutrition Plans</label>
          <input
            type="number"
            value={formData.nutritionPlanCount}
            onChange={(e) => setFormData({...formData, nutritionPlanCount: parseInt(e.target.value) || 0})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            min="1"
          />
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors"
        >
          Save Changes
        </button>
      </div>
    </form>
  );
}

// Edit Measurement Form Component
function EditMeasurementForm({ measurement, onSave, onCancel }: { measurement: any, onSave: (data: any) => void, onCancel: () => void }) {
  const [formData, setFormData] = useState({
    week: measurement.week || 1,
    date: measurement.date ? new Date(measurement.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    weight: measurement.weight || '',
    height: measurement.height || '',
    age: measurement.age || '',
    chest: measurement.chest || '',
    waist: measurement.waist || '',
    hips: measurement.hips || '',
    thigh: measurement.thigh || '',
    arm: measurement.arm || '',
    neck: measurement.neck || '',
    bodyFat: measurement.bodyFat || '',
    muscleMass: measurement.muscleMass || '',
    bmi: measurement.bmi || '',
    notes: measurement.notes || ''
  });

  // Calculate BMI automatically
  const calculateBMI = (weight: string, height: string) => {
    const weightNum = parseFloat(weight);
    const heightNum = parseFloat(height);
    
    if (weightNum && heightNum && heightNum > 0) {
      // BMI = weight (kg) / height (m)²
      // Height is in cm, so convert to meters
      const heightInMeters = heightNum / 100;
      const bmi = weightNum / (heightInMeters * heightInMeters);
      return bmi.toFixed(1);
    }
    return '';
  };

  // Update BMI when weight or height changes
  const handleWeightChange = (value: string) => {
    const newFormData = { ...formData, weight: value };
    const calculatedBMI = calculateBMI(value, formData.height);
    newFormData.bmi = calculatedBMI;
    setFormData(newFormData);
  };

  const handleHeightChange = (value: string) => {
    const newFormData = { ...formData, height: value };
    const calculatedBMI = calculateBMI(formData.weight, value);
    newFormData.bmi = calculatedBMI;
    setFormData(newFormData);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('EditMeasurementForm submitting:', formData);
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Week</label>
          <input
            type="number"
            value={formData.week}
            onChange={(e) => setFormData({...formData, week: parseInt(e.target.value) || 1})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            min="1"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({...formData, date: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
          <input
            type="number"
            step="0.1"
            value={formData.weight}
            onChange={(e) => handleWeightChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            placeholder="kg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Height (cm)</label>
          <input
            type="number"
            step="0.1"
            value={formData.height}
            onChange={(e) => handleHeightChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            placeholder="cm"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
          <input
            type="number"
            value={formData.age}
            onChange={(e) => setFormData({...formData, age: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            placeholder="years"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            BMI (Auto-calculated)
            <span className="text-xs text-gray-500 ml-2">
              Formula: weight(kg) ÷ height(m)²
            </span>
          </label>
          <input
            type="text"
            value={formData.bmi || 'Enter weight & height'}
            readOnly
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed"
            placeholder="Auto-calculated"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Chest (cm)</label>
          <input
            type="number"
            step="0.1"
            value={formData.chest}
            onChange={(e) => setFormData({...formData, chest: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            placeholder="cm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Waist (cm)</label>
          <input
            type="number"
            step="0.1"
            value={formData.waist}
            onChange={(e) => setFormData({...formData, waist: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            placeholder="cm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Hips (cm)</label>
          <input
            type="number"
            step="0.1"
            value={formData.hips}
            onChange={(e) => setFormData({...formData, hips: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            placeholder="cm"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Body Fat (%)</label>
          <input
            type="number"
            step="0.1"
            value={formData.bodyFat}
            onChange={(e) => setFormData({...formData, bodyFat: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            placeholder="%"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Muscle Mass (kg)</label>
          <input
            type="number"
            step="0.1"
            value={formData.muscleMass}
            onChange={(e) => setFormData({...formData, muscleMass: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            placeholder="kg"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({...formData, notes: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
          rows={3}
          placeholder="Additional notes..."
        />
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors"
        >
          Save Changes
        </button>
      </div>
    </form>
  );
}

// Edit Customer Form Component
function EditCustomerForm({ customer, onSave, onCancel }: { customer: any, onSave: (data: any) => void, onCancel: () => void }) {
  const [formData, setFormData] = useState({
    name: customer.name || '',
    email: customer.email || '',
    phone: customer.phone || '',
    goal: customer.goal || '',
    status: customer.status || 'active',
    plan: customer.plan || '',
    trainingFrequency: customer.trainingFrequency || 0,
    totalSessions: customer.totalSessions || 0,
    rating: customer.rating || 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            placeholder="Phone number"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({...formData, status: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Plan</label>
          <input
            type="text"
            value={formData.plan}
            onChange={(e) => setFormData({...formData, plan: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            placeholder="Training plan"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Training Frequency (per week)</label>
          <input
            type="number"
            value={formData.trainingFrequency}
            onChange={(e) => setFormData({...formData, trainingFrequency: parseInt(e.target.value) || 0})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            min="0"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Total Sessions</label>
          <input
            type="number"
            value={formData.totalSessions}
            onChange={(e) => setFormData({...formData, totalSessions: parseInt(e.target.value) || 0})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            min="0"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
          <input
            type="number"
            step="0.1"
            value={formData.rating}
            onChange={(e) => setFormData({...formData, rating: parseFloat(e.target.value) || 0})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            min="0"
            max="5"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Goal</label>
        <textarea
          value={formData.goal}
          onChange={(e) => setFormData({...formData, goal: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
          rows={3}
          placeholder="Customer's fitness goals..."
        />
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors"
        >
          Save Changes
        </button>
      </div>
    </form>
  );
}

// Edit Photo Form Component
function EditPhotoForm({ photo, onSave, onCancel }: { photo: any, onSave: (data: any) => void, onCancel: () => void }) {
  const [formData, setFormData] = useState({
    file: null as File | null,
    notes: photo.notes || ''
  });
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (file: File | null) => {
    setFormData(prev => ({
      ...prev,
      file
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      const formDataUpload = new FormData();
      formDataUpload.append('photoId', photo.id);
      formDataUpload.append('notes', formData.notes);
      
      if (formData.file) {
        formDataUpload.append('file', formData.file);
      }

      const response = await fetch('/api/customer-photos', {
        method: 'PUT',
        body: formDataUpload,
      });

      if (response.ok) {
        const updatedPhoto = await response.json();
        onSave(updatedPhoto);
      } else {
        console.error('Error updating photo');
        alert('Error updating photo');
      }
    } catch (error) {
      console.error('Error updating photo:', error);
      alert('Error updating photo');
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Edit Photo</h3>
        <div className="text-sm text-gray-600 mb-4">
          <strong>Position:</strong> {photo.position} | <strong>Week:</strong> {photo.week}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Replace Photo (Optional)
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
        />
        {formData.file && (
          <div className="mt-2">
            <img
              src={URL.createObjectURL(formData.file)}
              alt="Preview"
              className="w-32 h-32 object-contain bg-gray-50 rounded-lg border border-gray-200"
            />
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({...formData, notes: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
          rows={3}
          placeholder="Add notes about this photo..."
        />
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={uploading}
          className="flex-1 px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? 'Updating...' : 'Update Photo'}
        </button>
      </div>
    </form>
  );
}

// Photo Upload Form Component
function PhotoUploadForm({ customerId, onSave, onCancel, existingPhotos }: { 
  customerId: string, 
  onSave: (photos: any[]) => void, 
  onCancel: () => void,
  existingPhotos: any[]
}) {
  // Calculate next week based on existing photos
  const getNextWeek = () => {
    if (existingPhotos.length === 0) return 1;
    const maxWeek = Math.max(...existingPhotos.map(p => p.week));
    return maxWeek + 1;
  };

  const [formData, setFormData] = useState({
    week: getNextWeek(),
    date: new Date().toISOString().split('T')[0],
    frontPhoto: null as File | null,
    sidePhoto: null as File | null,
    backPhoto: null as File | null,
    notes: ''
  });

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('');

  const handleFileChange = async (position: string, file: File | null) => {
    if (!file) {
      setFormData(prev => ({
        ...prev,
        [position + 'Photo']: null
      }));
      return;
    }

    // Validate file
    const { validateImageFile } = await import('@/lib/image-compression');
    const validation = validateImageFile(file, 10);
    
    if (!validation.isValid) {
      alert(validation.error || 'Ongeldig bestand');
      return;
    }

    // Compress image if it's larger than 1MB
    const sizeMB = file.size / (1024 * 1024);
    let processedFile = file;
    
    if (sizeMB > 1) {
      try {
        setUploadStatus(`Comprimeren van ${position} foto...`);
        const { compressImage } = await import('@/lib/image-compression');
        processedFile = await compressImage(file, {
          maxWidth: 1920,
          maxHeight: 1920,
          quality: 0.85,
          maxSizeMB: 2
        });
        console.log(`Compressed ${position} photo: ${(file.size / 1024 / 1024).toFixed(2)}MB -> ${(processedFile.size / 1024 / 1024).toFixed(2)}MB`);
      } catch (error) {
        console.error('Compression error:', error);
        // Continue with original file if compression fails
      }
    }

    setFormData(prev => ({
      ...prev,
      [position + 'Photo']: processedFile
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    setUploadProgress(0);
    setUploadStatus('Preparing upload...');

    try {
      const photos = [];
      const selectedPhotos = ['front', 'side', 'back'].filter(position => 
        formData[`${position}Photo` as keyof typeof formData] as File | null
      );
      
      if (selectedPhotos.length === 0) {
        alert('No photos were selected. Please select at least one photo.');
        setUploading(false);
        return;
      }

      // Upload each photo with progress tracking
      for (let i = 0; i < selectedPhotos.length; i++) {
        const position = selectedPhotos[i];
        const file = formData[`${position}Photo` as keyof typeof formData] as File | null;
        
        if (file) {
          setUploadStatus(`Uploading ${position} photo... (${i + 1}/${selectedPhotos.length})`);
          setUploadProgress((i / selectedPhotos.length) * 100);

          const formDataUpload = new FormData();
          formDataUpload.append('file', file);
          formDataUpload.append('customerId', customerId);
          formDataUpload.append('week', formData.week.toString());
          formDataUpload.append('position', position);
          formDataUpload.append('date', formData.date);

          // Create abort controller for timeout
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

          try {
            const response = await fetch('/api/customer-photos', {
              method: 'POST',
              body: formDataUpload,
              signal: controller.signal,
            });
            clearTimeout(timeoutId);

            if (response.ok) {
              const photoData = await response.json();
              photos.push(photoData);
              console.log(`Successfully uploaded ${position} photo for week ${formData.week}`);
              
              // Update progress after each successful upload
              setUploadProgress(((i + 1) / selectedPhotos.length) * 100);
            } else {
              const errorData = await response.json().catch(() => ({ error: 'Upload mislukt' }));
              console.error(`Failed to upload ${position} photo:`, errorData);
              setUploadStatus(`Fout bij uploaden ${position} foto`);
              alert(`Upload mislukt voor ${position} foto: ${errorData.error || errorData.details || 'Onbekende fout'}`);
              setUploading(false);
              return;
            }
          } catch (error: any) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
              console.error(`Upload timeout for ${position} photo`);
              setUploadStatus(`Timeout bij uploaden ${position} foto`);
              alert(`Upload timeout voor ${position} foto. Controleer je internetverbinding en probeer het opnieuw.`);
            } else {
              console.error(`Upload error for ${position} photo:`, error);
              setUploadStatus(`Fout bij uploaden ${position} foto`);
              alert(`Upload mislukt voor ${position} foto: ${error.message || 'Onbekende fout'}`);
            }
            setUploading(false);
            return;
          }
        }
      }

      // Complete upload
      setUploadProgress(100);
      setUploadStatus('Upload complete!');
      
      // Wait a moment to show completion
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (photos.length > 0) {
        onSave(photos);
        console.log(`Successfully uploaded ${photos.length} photos for week ${formData.week}`);
        
        // Close modal and refresh page after successful upload
        onCancel();
        window.location.reload();
      } else {
        alert('No photos were uploaded. Please select at least one photo.');
      }
    } catch (error) {
      console.error('Error uploading photos:', error);
      alert('Error uploading photos: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setUploading(false);
      setUploadProgress(0);
      setUploadStatus('');
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Week</label>
          <input
            type="number"
            value={formData.week}
            onChange={(e) => setFormData({...formData, week: parseInt(e.target.value) || 1})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            min="1"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            {existingPhotos.length > 0 
              ? `Next available week (existing: ${existingPhotos.map(p => p.week).join(', ')})`
              : 'First week photos'
            }
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({...formData, date: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            required
          />
        </div>
      </div>

      {/* Photo Guidelines */}
      <div className="bg-blue-50 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-3">Photo Guidelines</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-blue-800">
          <div>
            <strong>Front View:</strong><br />
            • Arms at sides<br />
            • Feet together<br />
            • Straight posture
          </div>
          <div>
            <strong>Side View:</strong><br />
            • Arms relaxed<br />
            • Profile view<br />
            • Natural stance
          </div>
          <div>
            <strong>Back View:</strong><br />
            • Arms at sides<br />
            • Back straight<br />
            • Feet together
          </div>
        </div>
      </div>

      {/* Photo Upload Sections */}
      <div className="space-y-4">
        {['front', 'side', 'back'].map(position => (
          <div key={position} className="border border-gray-200 rounded-lg p-4">
            <h5 className="text-lg font-medium text-gray-800 mb-3 capitalize">{position} View</h5>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload {position} photo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(position, e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Grote foto's worden automatisch gecomprimeerd voor snellere upload
                </p>
              </div>
              {formData[`${position}Photo` as keyof typeof formData] && (
                <div className="mt-2">
                  <img
                    src={URL.createObjectURL(formData[`${position}Photo` as keyof typeof formData] as File)}
                    alt={`${position} preview`}
                    className="w-32 h-32 object-contain bg-gray-50 rounded-lg border border-gray-200"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {(formData[`${position}Photo` as keyof typeof formData] as File).size > 0 
                      ? `${((formData[`${position}Photo` as keyof typeof formData] as File).size / 1024 / 1024).toFixed(2)}MB`
                      : ''}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({...formData, notes: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
          rows={3}
          placeholder="Add any notes about this week's photos..."
        />
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={uploading}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={uploading || (!formData.frontPhoto && !formData.sidePhoto && !formData.backPhoto)}
          className="flex-1 px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? 'Uploading...' : 'Upload Photos'}
        </button>
      </div>
    </form>

    {/* Upload Progress Overlay */}
    {uploading && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-6 w-full max-w-sm mx-4">
          <div className="text-center">
            {/* Spinning loader */}
            <div className="w-16 h-16 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin mx-auto mb-4"></div>
            
            {/* Status text */}
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Uploading Photos</h3>
            <p className="text-sm text-gray-600 mb-4">{uploadStatus}</p>
            
            {/* Progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div 
                className="bg-rose-500 h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            
            {/* Progress percentage */}
            <p className="text-xs text-gray-500">{Math.round(uploadProgress)}%</p>
          </div>
        </div>
      </div>
    )}
  </>
  );
}

export default function MobileCustomerDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { t } = useLanguage();
  const customerId = Array.isArray(params?.id) ? params.id[0] : (params?.id || '1');
  
  const [customer, setCustomer] = useState<{
    id: string;
    name: string;
    email: string;
    phone?: string;
    goal?: string;
    joinDate: string;
    status: string;
    trainingFrequency?: number;
    totalSessions: number;
    rating: number;
    lastWorkout?: string | null;
    notes?: string;
    goals?: string[];
  } | null>(null);
  const [customerWorkouts, setCustomerWorkouts] = useState<Array<{
    id: string;
    status: string;
    assignedAt: string;
    notes?: string;
    workout: {
      id: string;
      name: string;
      category: string;
      difficulty: string;
      duration: number;
      exercises: number;
      lastUsed: string;
    };
  }>>([]);
  const [customerNutritionPlans, setCustomerNutritionPlans] = useState<Array<{
    id: string;
    status: string;
    assignedAt: string;
    notes?: string;
    nutritionPlan: {
      id: string;
      name: string;
      goal: string;
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
    };
  }>>([]);
  const [customerMeasurements, setCustomerMeasurements] = useState<Array<{
    id: string;
    week: number;
    date: string;
    weight: number;
    height: number;
    age: number;
    chest: number;
    waist: number;
    hips: number;
    thigh: number;
    arm: number;
    neck: number;
    bodyFat: number;
    muscleMass: number;
    bmi: number;
    notes?: string;
  }>>([]);
  const [customerPricing, setCustomerPricing] = useState<Array<{
    id: string;
    service: string;
    duration: number;
    frequency: number;
    discount: number;
    finalPrice: number;
    includeNutritionPlan: boolean;
    createdAt: string;
  }>>([]);
  const [trainingSessions, setTrainingSessions] = useState<Array<{
    id: string;
    date: string;
    startTime: string;
    endTime: string;
    type: string;
    status: string;
    notes?: string;
    customerName?: string;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showAssignWorkoutModal, setShowAssignWorkoutModal] = useState(false);
  const [showAssignNutritionPlanModal, setShowAssignNutritionPlanModal] = useState(false);
  const [showEditPricingModal, setShowEditPricingModal] = useState(false);
  const [editingPricing, setEditingPricing] = useState<any>(null);
  const [showEditMeasurementModal, setShowEditMeasurementModal] = useState(false);
  const [editingMeasurement, setEditingMeasurement] = useState<any>(null);
  const [showEditCustomerModal, setShowEditCustomerModal] = useState(false);
  const [showEditPhotoModal, setShowEditPhotoModal] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<any>(null);
  const [customerPhotos, setCustomerPhotos] = useState<Array<{
    id: string;
    week: number;
    date: string;
    position: string;
    imageUrl: string;
    notes?: string;
  }>>([]);
  const [showPhotoUploadModal, setShowPhotoUploadModal] = useState(false);
  const [showPhotoGalleryModal, setShowPhotoGalleryModal] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<any>(null);
  const [galleryPhotos, setGalleryPhotos] = useState<any[]>([]);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [availableWorkouts, setAvailableWorkouts] = useState<Array<{
    id: string;
    name: string;
    category: string;
    difficulty: string;
    duration: number;
    exercises: number;
  }>>([]);
  const [availableNutritionPlans, setAvailableNutritionPlans] = useState<Array<{
    id: string;
    name: string;
    goal: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }>>([]);
  const [selectedWorkoutId, setSelectedWorkoutId] = useState('');
  const [selectedNutritionPlanId, setSelectedNutritionPlanId] = useState('');
  const [workoutNotes, setWorkoutNotes] = useState('');
  const [nutritionPlanNotes, setNutritionPlanNotes] = useState('');

  useEffect(() => {
    const loadCustomerData = async () => {
      try {
        setLoading(true);
        
        // Load customer data
        const customerResponse = await fetch(`/api/users/${customerId}`);
        if (customerResponse.ok) {
          const customerData = await customerResponse.json();
          setCustomer(customerData);
        }

        // Load customer workouts
        const workoutsResponse = await fetch(`/api/customer-workouts?customerId=${customerId}`);
        if (workoutsResponse.ok) {
          const workoutsData = await workoutsResponse.json();
          setCustomerWorkouts(workoutsData);
        }

        // Load customer nutrition plans
        const nutritionResponse = await fetch(`/api/customer-nutrition-plans?customerId=${customerId}`);
        if (nutritionResponse.ok) {
          const nutritionData = await nutritionResponse.json();
          setCustomerNutritionPlans(nutritionData);
        }

        // Load customer measurements
        const measurementsResponse = await fetch(`/api/customer-measurements?customerId=${customerId}`);
        if (measurementsResponse.ok) {
          const measurementsData = await measurementsResponse.json();
          setCustomerMeasurements(measurementsData);
        }

        // Load customer pricing
        const pricingResponse = await fetch(`/api/pricing-calculations?customerId=${customerId}`);
        if (pricingResponse.ok) {
          const pricingData = await pricingResponse.json();
          setCustomerPricing(pricingData);
        }

        // Load training sessions
        const sessionsResponse = await fetch(`/api/training-sessions?customerId=${customerId}`);
        if (sessionsResponse.ok) {
          const sessionsData = await sessionsResponse.json();
          setTrainingSessions(sessionsData);
        }

        // Load customer photos
        const photosResponse = await fetch(`/api/customer-photos?customerId=${customerId}`);
        if (photosResponse.ok) {
          const photosData = await photosResponse.json();
          setCustomerPhotos(photosData);
        }

        // Load available workouts
        const availableWorkoutsResponse = await fetch('/api/workouts');
        if (availableWorkoutsResponse.ok) {
          const availableWorkoutsData = await availableWorkoutsResponse.json();
          setAvailableWorkouts(availableWorkoutsData);
        }

        // Load available nutrition plans
        const availableNutritionResponse = await fetch('/api/nutrition-plans');
        if (availableNutritionResponse.ok) {
          const availableNutritionData = await availableNutritionResponse.json();
          setAvailableNutritionPlans(availableNutritionData);
        }

      } catch (error) {
        console.error('Error loading customer data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCustomerData();
  }, [customerId]);

  const handleAssignWorkout = async () => {
    if (!selectedWorkoutId) {
      alert('Please select a workout');
      return;
    }

    try {
      const response = await fetch('/api/customer-workouts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId,
          workoutId: selectedWorkoutId,
          notes: workoutNotes
        }),
      });

      if (response.ok) {
        const newWorkout = await response.json();
        setCustomerWorkouts([...customerWorkouts, newWorkout]);
        setShowAssignWorkoutModal(false);
        setSelectedWorkoutId('');
        setWorkoutNotes('');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to assign workout');
      }
    } catch (error) {
      console.error('Error assigning workout:', error);
      alert('Failed to assign workout');
    }
  };

  const handleAssignNutritionPlan = async () => {
    if (!selectedNutritionPlanId) {
      alert('Please select a nutrition plan');
      return;
    }

    try {
      const response = await fetch('/api/customer-nutrition-plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId,
          nutritionPlanId: selectedNutritionPlanId,
          notes: nutritionPlanNotes
        }),
      });

      if (response.ok) {
        const newNutritionPlan = await response.json();
        setCustomerNutritionPlans([...customerNutritionPlans, newNutritionPlan]);
        setShowAssignNutritionPlanModal(false);
        setSelectedNutritionPlanId('');
        setNutritionPlanNotes('');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to assign nutrition plan');
      }
    } catch (error) {
      console.error('Error assigning nutrition plan:', error);
      alert('Failed to assign nutrition plan');
    }
  };

  const handleRemoveWorkout = async (workoutId: string) => {
    if (confirm('Are you sure you want to remove this workout assignment?')) {
      try {
        const response = await fetch(`/api/customer-workouts/${workoutId}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          setCustomerWorkouts(customerWorkouts.filter(w => w.id !== workoutId));
        } else {
          console.error('Error removing workout');
        }
      } catch (error) {
        console.error('Error removing workout:', error);
      }
    }
  };

  const handleRemoveNutritionPlan = async (nutritionPlanId: string) => {
    if (confirm('Are you sure you want to remove this nutrition plan assignment?')) {
      try {
        const response = await fetch(`/api/customer-nutrition-plans/${nutritionPlanId}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          setCustomerNutritionPlans(customerNutritionPlans.filter(n => n.id !== nutritionPlanId));
        } else {
          console.error('Error removing nutrition plan');
        }
      } catch (error) {
        console.error('Error removing nutrition plan:', error);
      }
    }
  };

  const handleEditPricing = (pricing: any) => {
    setEditingPricing(pricing);
    setShowEditPricingModal(true);
  };

  const handleEditMeasurement = (measurement: any) => {
    setEditingMeasurement(measurement);
    setShowEditMeasurementModal(true);
  };

  const handleUpdateMeasurement = async (data: any) => {
    try {
      console.log('Updating measurement:', { id: editingMeasurement.id, data });
      
      const response = await fetch(`/api/customer-measurements/${editingMeasurement.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const updatedMeasurement = await response.json();
        setCustomerMeasurements(customerMeasurements.map(m => 
          m.id === editingMeasurement.id ? updatedMeasurement : m
        ));
        setShowEditMeasurementModal(false);
        setEditingMeasurement(null);
        alert('Measurement updated successfully!');
      } else {
        const errorData = await response.json();
        console.error('Error updating measurement:', errorData);
        alert(`Error updating measurement: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating measurement:', error);
      alert(`Error updating measurement: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleEditCustomer = () => {
    setShowEditCustomerModal(true);
  };

  const handleUpdateCustomer = async (data: any) => {
    try {
      const response = await fetch(`/api/users/${customerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const updatedCustomer = await response.json();
        setCustomer(updatedCustomer);
        setShowEditCustomerModal(false);
      } else {
        console.error('Error updating customer');
      }
    } catch (error) {
      console.error('Error updating customer:', error);
    }
  };

  const handleDeletePricing = async (pricingId: string) => {
    if (confirm('Are you sure you want to delete this pricing record?')) {
      try {
        const response = await fetch(`/api/pricing-calculations/${pricingId}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          setCustomerPricing(customerPricing.filter(p => p.id !== pricingId));
        } else {
          console.error('Error deleting pricing record');
        }
      } catch (error) {
        console.error('Error deleting pricing record:', error);
      }
    }
  };

  const handleEditPhoto = (photo: any) => {
    setEditingPhoto(photo);
    setShowEditPhotoModal(true);
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (confirm('Are you sure you want to delete this photo?')) {
      try {
        const response = await fetch(`/api/customer-photos?photoId=${photoId}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          setCustomerPhotos(customerPhotos.filter(p => p.id !== photoId));
        } else {
          console.error('Error deleting photo');
        }
      } catch (error) {
        console.error('Error deleting photo:', error);
      }
    }
  };

  const handleUpdatePhoto = async (updatedPhoto: any) => {
    setCustomerPhotos(customerPhotos.map(p => p.id === updatedPhoto.id ? updatedPhoto : p));
    setShowEditPhotoModal(false);
    setEditingPhoto(null);
  };

  const handleOpenPhotoGallery = (photo: any) => {
    // Get all photos from the same week for gallery
    const weekPhotos = customerPhotos.filter(p => p.week === photo.week);
    const sortedPhotos = weekPhotos.sort((a, b) => {
      const positions = ['front', 'side', 'back'];
      return positions.indexOf(a.position) - positions.indexOf(b.position);
    });
    
    setGalleryPhotos(sortedPhotos);
    setCurrentPhotoIndex(sortedPhotos.findIndex(p => p.id === photo.id));
    setSelectedPhoto(photo);
    setShowPhotoGalleryModal(true);
  };

  const handlePreviousPhoto = () => {
    if (currentPhotoIndex > 0) {
      setCurrentPhotoIndex(currentPhotoIndex - 1);
      setSelectedPhoto(galleryPhotos[currentPhotoIndex - 1]);
    }
  };

  const handleNextPhoto = () => {
    if (currentPhotoIndex < galleryPhotos.length - 1) {
      setCurrentPhotoIndex(currentPhotoIndex + 1);
      setSelectedPhoto(galleryPhotos[currentPhotoIndex + 1]);
    }
  };

  // Keyboard navigation for gallery
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!showPhotoGalleryModal) return;
      
      switch (event.key) {
        case 'ArrowLeft':
          handlePreviousPhoto();
          break;
        case 'ArrowRight':
          handleNextPhoto();
          break;
        case 'Escape':
          setShowPhotoGalleryModal(false);
          setSelectedPhoto(null);
          setGalleryPhotos([]);
          setCurrentPhotoIndex(0);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showPhotoGalleryModal, currentPhotoIndex, galleryPhotos.length]);

  const handleUpdatePricing = async (updatedPricing: any) => {
    try {
      const response = await fetch(`/api/pricing-calculations/${editingPricing.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedPricing),
      });

      if (response.ok) {
        const updated = await response.json();
        setCustomerPricing(customerPricing.map(p => p.id === editingPricing.id ? updated : p));
        setShowEditPricingModal(false);
        setEditingPricing(null);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update pricing record');
      }
    } catch (error) {
      console.error('Error updating pricing record:', error);
      alert('Failed to update pricing record');
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Eye },
    { id: 'workouts', label: 'Workouts', icon: Dumbbell },
    { id: 'nutrition', label: 'Nutrition', icon: Apple },
    { id: 'measurements', label: 'Measurements', icon: Ruler },
    { id: 'progress', label: 'Progress', icon: TrendingUp },
    { id: 'photos', label: 'Photos', icon: Camera },
    { id: 'schedule', label: 'Schedule', icon: Calendar },
    { id: 'pricing', label: 'Pricing', icon: Calculator }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading customer data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Customer Not Found</h1>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header - Consistent with klanten page */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-bold text-gray-800 truncate">{customer.name}</h1>
              <p className="text-base text-gray-600">Customer Details</p>
            </div>
          </div>

          {/* Customer Info Card - Consistent with klanten page */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-8">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-gradient-to-r from-rose-400 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                {customer.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold text-gray-800 truncate">{customer.name}</h2>
                <p className="text-base text-gray-600">Since {new Date(customer.joinDate).toLocaleDateString()}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    customer.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : customer.status === 'inactive'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {customer.status}
                  </span>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium text-gray-800">{customer.rating}</span>
                  </div>
                  </div>
                </div>
              </div>
              <button
                onClick={handleEditCustomer}
                className="p-3 text-blue-500 hover:bg-blue-100 rounded-xl transition-colors"
                title="Edit customer details"
              >
                <Edit className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {/* Contact Information */}
              <div className="flex items-center text-gray-600">
                <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="text-gray-800 text-sm">{customer.email}</span>
              </div>
              {customer.phone && (
                <div className="flex items-center text-gray-600">
                  <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="text-gray-800 text-sm">{customer.phone}</span>
                </div>
              )}
              
              {/* Training Information */}
              <div className="flex items-center text-gray-600">
                <Dumbbell className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="text-gray-800 text-sm">{customer.totalSessions} sessions</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="text-gray-800 text-sm">{customer.trainingFrequency}x per week</span>
              </div>

              {/* Goal */}
              {customer.goal && (
                <div className="flex items-start text-gray-600">
                  <Target className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-gray-500 text-sm">Goal:</span>
                    <p className="text-gray-800 text-sm whitespace-pre-wrap">{customer.goal}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs - Consistent with klanten page */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 mb-8">
          <div className="flex overflow-x-auto gap-2 scrollbar-hide">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? 'bg-rose-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content - Consistent with klanten page */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Overview</h3>
              
              {/* Key Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Dumbbell className="w-5 h-5 text-blue-500" />
                    <span className="font-medium text-gray-800 text-sm">Workouts</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-800">{customerWorkouts.length}</p>
                  <p className="text-sm text-gray-600">Assigned</p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Apple className="w-5 h-5 text-green-500" />
                    <span className="font-medium text-gray-800 text-sm">Nutrition</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-800">{customerNutritionPlans.length}</p>
                  <p className="text-sm text-gray-600">Assigned</p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Ruler className="w-5 h-5 text-purple-500" />
                    <span className="font-medium text-gray-800 text-sm">Measurements</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-800">{customerMeasurements.length}</p>
                  <p className="text-sm text-gray-600">Records</p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calculator className="w-5 h-5 text-orange-500" />
                    <span className="font-medium text-gray-800 text-sm">Pricing</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-800">{customerPricing.length}</p>
                  <p className="text-sm text-gray-600">Calculations</p>
                </div>
              </div>

              {/* Progress Photos Section */}
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Camera className="w-4 h-4 text-purple-600" />
                  Progress Photos
                </h4>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-gray-800">{customerPhotos.length}</p>
                    <p className="text-sm text-gray-600">Photos uploaded</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('photos')}
                    className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    View Photos
                  </button>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="space-y-4">
                {/* Recent Sessions */}
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    Recent Sessions
                  </h4>
                  {trainingSessions.length > 0 ? (
                    <div className="space-y-2">
                      {trainingSessions.slice(0, 3).map((session) => (
                        <div key={session.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${
                              session.status === 'completed' ? 'bg-green-500' :
                              session.status === 'scheduled' ? 'bg-blue-500' : 'bg-gray-400'
                            }`}></div>
                            <div>
                              <p className="text-xs font-medium text-gray-800">
                                {new Date(session.date).toLocaleDateString()}
                              </p>
                              <p className="text-xs text-gray-500">
                                {session.startTime} - {session.endTime}
                              </p>
                            </div>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            session.status === 'completed' ? 'bg-green-100 text-green-800' :
                            session.status === 'scheduled' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {session.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No recent sessions</p>
                  )}
                </div>

                {/* Financial Summary */}
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    Financial Summary
                  </h4>
                  {customerPricing.length > 0 ? (
                    <div className="space-y-2">
                      {customerPricing.slice(0, 2).map((pricing) => (
                        <div key={pricing.id} className="p-2 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-gray-800">{pricing.service}</span>
                            <span className="text-xs font-bold text-green-600">{pricing.finalPrice} RON</span>
                          </div>
                          <div className="text-xs text-gray-500">
                            {pricing.duration} weeks • {pricing.frequency}x/week
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No pricing information</p>
                  )}
                </div>
              </div>

              {customer.notes && (
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Notes</h4>
                  <p className="text-gray-600 bg-gray-50 rounded-lg p-3">{customer.notes}</p>
                </div>
              )}

              {customer.goals && customer.goals.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Goals</h4>
                  <div className="space-y-2">
                    {customer.goals.map((goal, index) => (
                      <div key={index} className="flex items-center gap-2 text-gray-600">
                        <Target className="w-4 h-4 text-rose-500" />
                        <span>{goal}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'workouts' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">Assigned Workouts</h3>
                <button
                  onClick={() => setShowAssignWorkoutModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Assign Workout
                </button>
              </div>

              {customerWorkouts.length > 0 ? (
                <div className="space-y-3">
                  {customerWorkouts.map((workout) => (
                    <div key={workout.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-800">{workout.workout.name}</h4>
                        <button
                          onClick={() => handleRemoveWorkout(workout.id)}
                          className="p-1 text-red-500 hover:bg-red-100 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                        <div>Category: {workout.workout.category}</div>
                        <div>Difficulty: {workout.workout.difficulty}</div>
                        <div>Duration: {workout.workout.duration} min</div>
                        <div>Exercises: {workout.workout.exercises}</div>
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        Assigned: {new Date(workout.assignedAt).toLocaleDateString()}
                      </div>
                      {workout.notes && (
                        <div className="text-sm text-gray-600 mt-2 bg-gray-50 rounded p-2">
                          {workout.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Dumbbell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No workouts assigned yet.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'nutrition' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">Assigned Nutrition Plans</h3>
                <button
                  onClick={() => setShowAssignNutritionPlanModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Assign Plan
                </button>
              </div>

              {customerNutritionPlans.length > 0 ? (
                <div className="space-y-3">
                  {customerNutritionPlans.map((nutritionPlan) => (
                    <div key={nutritionPlan.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-800">{nutritionPlan.nutritionPlan.name}</h4>
                        <button
                          onClick={() => handleRemoveNutritionPlan(nutritionPlan.id)}
                          className="p-1 text-red-500 hover:bg-red-100 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                        <div>Goal: {nutritionPlan.nutritionPlan.goal}</div>
                        <div>Calories: {nutritionPlan.nutritionPlan.calories}</div>
                        <div>Protein: {nutritionPlan.nutritionPlan.protein}g</div>
                        <div>Carbs: {nutritionPlan.nutritionPlan.carbs}g</div>
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        Assigned: {new Date(nutritionPlan.assignedAt).toLocaleDateString()}
                      </div>
                      {nutritionPlan.notes && (
                        <div className="text-sm text-gray-600 mt-2 bg-gray-50 rounded p-2">
                          {nutritionPlan.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Apple className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No nutrition plans assigned yet.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'measurements' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">Body Measurements</h3>
                <button
                  onClick={() => router.push(`/admin/klanten/${customerId}/measurements`)}
                  className="flex items-center gap-2 px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add Measurement
                </button>
              </div>

              {customerMeasurements.length > 0 ? (
                <div className="space-y-3">
                  {customerMeasurements.map((measurement) => (
                    <div key={measurement.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-800">
                            Week {measurement.week} - {new Date(measurement.date).toLocaleDateString()}
                          </h4>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditMeasurement(measurement)}
                            className="p-1 text-blue-500 hover:bg-blue-100 rounded transition-colors"
                            title="Edit measurement"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this measurement?')) {
                                fetch(`/api/customer-measurements/${measurement.id}`, {
                                  method: 'DELETE'
                                }).then(response => {
                                  if (response.ok) {
                                    setCustomerMeasurements(customerMeasurements.filter(m => m.id !== measurement.id));
                                  } else {
                                    console.error('Error deleting measurement');
                                  }
                                }).catch(error => {
                                  console.error('Error deleting measurement:', error);
                                });
                              }
                            }}
                            className="p-1 text-red-500 hover:bg-red-100 rounded transition-colors"
                            title="Delete measurement"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                        <div>Weight: {measurement.weight} kg</div>
                        <div>Height: {measurement.height} cm</div>
                        <div>Age: {measurement.age} years</div>
                        <div>BMI: {measurement.bmi}</div>
                        <div>Chest: {measurement.chest} cm</div>
                        <div>Waist: {measurement.waist} cm</div>
                        <div>Hips: {measurement.hips} cm</div>
                        <div>Thigh: {measurement.thigh} cm</div>
                        <div>Arm: {measurement.arm} cm</div>
                        <div>Neck: {measurement.neck} cm</div>
                        <div>Body Fat: {measurement.bodyFat}%</div>
                        <div>Muscle Mass: {measurement.muscleMass} kg</div>
                      </div>
                      {measurement.notes && (
                        <div className="text-sm text-gray-600 mt-2 bg-gray-50 rounded p-2">
                          {measurement.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Ruler className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No measurements recorded yet.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'progress' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Progress Tracking</h3>
              
              {customerMeasurements.length > 0 ? (
                <div className="space-y-4">
                  {/* Progress Summary */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
                    <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-3 sm:p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-800">Weight Loss</span>
                      </div>
                      <p className="text-lg sm:text-xl font-bold text-green-900">
                        {customerMeasurements.length > 1 
                          ? `${(customerMeasurements[0].weight - customerMeasurements[customerMeasurements.length - 1].weight).toFixed(1)} kg`
                          : '0.0 kg'
                        }
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-3 sm:p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Ruler className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">Waist Loss</span>
                      </div>
                      <p className="text-lg sm:text-xl font-bold text-blue-900">
                        {customerMeasurements.length > 1 
                          ? `${(customerMeasurements[0].waist - customerMeasurements[customerMeasurements.length - 1].waist).toFixed(1)} cm`
                          : '0.0 cm'
                        }
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-3 sm:p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Target className="w-4 h-4 text-purple-600" />
                        <span className="text-sm font-medium text-purple-800">Hips Loss</span>
                      </div>
                      <p className="text-lg sm:text-xl font-bold text-purple-900">
                        {customerMeasurements.length > 1 
                          ? `${(customerMeasurements[0].hips - customerMeasurements[customerMeasurements.length - 1].hips).toFixed(1)} cm`
                          : '0.0 cm'
                        }
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-3 sm:p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Award className="w-4 h-4 text-orange-600" />
                        <span className="text-sm font-medium text-orange-800">BMI Change</span>
                      </div>
                      <p className="text-lg sm:text-xl font-bold text-orange-900">
                        {customerMeasurements.length > 1 
                          ? `${(customerMeasurements[0].bmi - customerMeasurements[customerMeasurements.length - 1].bmi).toFixed(1)}`
                          : '0.0'
                        }
                      </p>
                    </div>
                  </div>

                  {/* Progress Table */}
                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-700">Week</th>
                            <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-700">Date</th>
                            <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-700">Weight</th>
                            <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-700">Waist</th>
                            <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-700">Hips</th>
                            <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-700">BMI</th>
                            <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-700">Change</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {customerMeasurements
                            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                            .map((measurement, index) => {
                              const previousMeasurement = index > 0 ? customerMeasurements
                                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[index - 1] : null;
                              
                              const weightChange = previousMeasurement 
                                ? (measurement.weight - previousMeasurement.weight).toFixed(1)
                                : '0.0';
                              
                              const waistChange = previousMeasurement 
                                ? (measurement.waist - previousMeasurement.waist).toFixed(1)
                                : '0.0';
                              
                              const hipsChange = previousMeasurement 
                                ? (measurement.hips - previousMeasurement.hips).toFixed(1)
                                : '0.0';
                              
                              const bmiChange = previousMeasurement 
                                ? (measurement.bmi - previousMeasurement.bmi).toFixed(1)
                                : '0.0';

                              return (
                                <tr key={measurement.id} className="hover:bg-gray-50">
                                  <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900 font-medium">
                                    Week {measurement.week}
                                  </td>
                                  <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-600">
                                    {new Date(measurement.date).toLocaleDateString()}
                                  </td>
                                  <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900">
                                    {measurement.weight} kg
                                  </td>
                                  <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900">
                                    {measurement.waist} cm
                                  </td>
                                  <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900">
                                    {measurement.hips} cm
                                  </td>
                                  <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900">
                                    {measurement.bmi}
                                  </td>
                                  <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">
                                    <div className="space-y-1">
                                      <div className={`flex items-center gap-1 ${
                                        parseFloat(weightChange) < 0 ? 'text-green-600' : 
                                        parseFloat(weightChange) > 0 ? 'text-red-600' : 'text-gray-600'
                                      }`}>
                                        <span>{weightChange} kg</span>
                                      </div>
                                      <div className={`flex items-center gap-1 ${
                                        parseFloat(waistChange) < 0 ? 'text-green-600' : 
                                        parseFloat(waistChange) > 0 ? 'text-red-600' : 'text-gray-600'
                                      }`}>
                                        <span>{waistChange} cm</span>
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Ruler className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Progress Data</h3>
                  <p className="text-gray-600 mb-4">Start tracking progress by adding measurements.</p>
                  <button
                    onClick={() => router.push(`/admin/klanten/${customerId}/measurements`)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add First Measurement
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'photos' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">Progress Photos</h3>
                <button
                  onClick={() => setShowPhotoUploadModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors text-sm"
                >
                  <Camera className="w-4 h-4" />
                  Add Photos
                </button>
              </div>

              {customerPhotos.length > 0 ? (
                <div className="space-y-6">
                  {/* Photo Positions Guide */}
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">Photo Guidelines</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-blue-800">
                      <div>
                        <strong>Front View:</strong> Arms at sides, feet together, straight posture
                      </div>
                      <div>
                        <strong>Side View:</strong> Arms relaxed, profile view, natural stance
                      </div>
                      <div>
                        <strong>Back View:</strong> Arms at sides, back straight, feet together
                      </div>
                    </div>
                  </div>

                  {/* Weekly Photo Comparison */}
                  {Array.from(new Set(customerPhotos.map(photo => photo.week))).sort((a, b) => b - a).map(week => (
                    <div key={week} className="bg-white rounded-lg border border-gray-200 p-4">
                      <h4 className="text-lg font-semibold text-gray-800 mb-4">Week {week}</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {['front', 'side', 'back'].map(position => {
                          const photo = customerPhotos.find(p => p.week === week && p.position === position);
                          return (
                            <div key={position} className="text-center">
                              <h5 className="text-sm font-medium text-gray-700 mb-2 capitalize">{position} View</h5>
                              {photo ? (
                                <div className="relative group">
                                  <img
                                    src={photo.imageUrl}
                                    alt={`Week ${week} ${position} view`}
                                    className="w-full h-48 object-contain bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
                                    onClick={() => handleOpenPhotoGallery(photo)}
                                  />
                                  <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                                    {new Date(photo.date).toLocaleDateString()}
                                  </div>
                                  <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="flex gap-1">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleEditPhoto(photo);
                                        }}
                                        className="p-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                                        title="Edit photo"
                                      >
                                        <Edit className="w-3 h-3" />
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeletePhoto(photo.id);
                                        }}
                                        className="p-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                                        title="Delete photo"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>
                                  <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                                      Click to view
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="w-full h-48 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                                  <div className="text-center">
                                    <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                    <p className="text-sm text-gray-500">No photo</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Progress Photos</h3>
                  <p className="text-gray-600 mb-4">Start tracking visual progress by adding photos.</p>
                  <button
                    onClick={() => setShowPhotoUploadModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors"
                  >
                    <Camera className="w-4 h-4" />
                    Add First Photos
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'schedule' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">Training Schedule</h3>
                <button
                  onClick={() => router.push('/admin/schedule')}
                  className="bg-rose-500 text-white px-3 py-2 rounded-lg hover:bg-rose-600 transition-colors flex items-center gap-2 text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add Session
                </button>
              </div>

              {/* Training Statistics */}
              {trainingSessions.length > 0 && (
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Training Statistics</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-xl font-bold text-blue-600">
                        {trainingSessions.length}
                      </div>
                      <div className="text-xs text-blue-800">Total</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-xl font-bold text-green-600">
                        {trainingSessions.filter(session => session.status === 'completed').length}
                      </div>
                      <div className="text-xs text-green-800">Completed</div>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <div className="text-xl font-bold text-orange-600">
                        {trainingSessions.filter(session => session.status === 'scheduled').length}
                      </div>
                      <div className="text-xs text-orange-800">Scheduled</div>
                    </div>
                  </div>
                </div>
              )}

              {trainingSessions.length > 0 ? (
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4">
                  <div className="space-y-3">
                    {trainingSessions.map((session) => (
                      <div key={session.id} className={`border rounded-lg p-4 ${
                        session.status === 'completed' 
                          ? 'bg-green-100 border-green-200' 
                          : 'border-gray-200 bg-white'
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              session.status === 'completed' 
                                ? 'bg-green-200' 
                                : 'bg-rose-100'
                            }`}>
                              <Calendar className={`w-5 h-5 ${
                                session.status === 'completed' 
                                  ? 'text-green-700' 
                                  : 'text-rose-600'
                              }`} />
                            </div>
                            <div>
                              <h4 className={`font-semibold ${
                                session.status === 'completed' 
                                  ? 'text-green-800' 
                                  : 'text-gray-800'
                              }`}>
                                {new Date(session.date).toLocaleDateString('en-US', { 
                                  weekday: 'long', 
                                  year: 'numeric', 
                                  month: 'long', 
                                  day: 'numeric' 
                                })}
                              </h4>
                              <p className={`text-sm ${
                                session.status === 'completed' 
                                  ? 'text-green-600' 
                                  : 'text-gray-600'
                              }`}>
                                {session.startTime} - {session.endTime}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              session.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                              session.status === 'completed' ? 'bg-green-200 text-green-800' :
                              session.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {session.status}
                            </span>
                            <button
                              onClick={async () => {
                                if (confirm('Are you sure you want to delete this training session?')) {
                                  try {
                                    const response = await fetch(`/api/training-sessions/${session.id}`, {
                                      method: 'DELETE'
                                    });
                                    
                                    if (response.ok) {
                                      setTrainingSessions(trainingSessions.filter(s => s.id !== session.id));
                                      alert('Training session deleted successfully!');
                                    } else {
                                      const errorData = await response.json();
                                      console.error('Error deleting training session:', errorData);
                                      alert(`Error deleting training session: ${errorData.error || 'Unknown error'}`);
                                    }
                                  } catch (error) {
                                    console.error('Error deleting training session:', error);
                                    alert('Failed to delete training session. Please try again.');
                                  }
                                }
                              }}
                              className="p-1 text-red-500 hover:bg-red-100 rounded transition-colors"
                              title="Delete session"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        
                        <div className={`grid grid-cols-2 gap-2 text-sm ${
                          session.status === 'completed' 
                            ? 'text-green-600' 
                            : 'text-gray-600'
                        }`}>
                          <div>Type: {session.type}</div>
                          <div>Duration: {(() => {
                            const start = new Date(`2000-01-01T${session.startTime}`);
                            const end = new Date(`2000-01-01T${session.endTime}`);
                            const diff = end.getTime() - start.getTime();
                            const hours = Math.floor(diff / (1000 * 60 * 60));
                            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                            return `${hours}h ${minutes}m`;
                          })()}</div>
                        </div>
                        
                        {session.notes && (
                          <div className={`mt-3 p-3 rounded-lg ${
                            session.status === 'completed' 
                              ? 'bg-green-50' 
                              : 'bg-gray-50'
                          }`}>
                            <p className={`text-sm ${
                              session.status === 'completed' 
                                ? 'text-green-700' 
                                : 'text-gray-600'
                            }`}>
                              <strong>Notes:</strong> {session.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 text-center">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No training sessions scheduled</p>
                  <p className="text-gray-400 text-sm mt-2">Add training sessions to create a schedule for this client</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'pricing' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Pricing History</h3>

              {customerPricing.length > 0 ? (
                <div className="space-y-3">
                  {customerPricing.map((pricing) => (
                    <div key={pricing.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-800">{pricing.service}</h4>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-rose-600">{pricing.finalPrice} RON</span>
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleEditPricing(pricing)}
                              className="p-1 text-blue-500 hover:bg-blue-100 rounded transition-colors"
                              title="Edit pricing"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={async () => {
                                if (confirm('Are you sure you want to delete this pricing record?')) {
                                  try {
                                    const response = await fetch(`/api/pricing-calculations/${pricing.id}`, {
                                      method: 'DELETE'
                                    });
                                    
                                    if (response.ok) {
                                      setCustomerPricing(customerPricing.filter(p => p.id !== pricing.id));
                                      alert('Pricing record deleted successfully!');
                                    } else {
                                      const errorData = await response.json();
                                      console.error('Error deleting pricing record:', errorData);
                                      alert(`Error deleting pricing record: ${errorData.error || 'Unknown error'}`);
                                    }
                                  } catch (error) {
                                    console.error('Error deleting pricing record:', error);
                                    alert('Failed to delete pricing record. Please try again.');
                                  }
                                }
                              }}
                              className="p-1 text-red-500 hover:bg-red-100 rounded transition-colors"
                              title="Delete pricing"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                        <div>Duration: {pricing.duration} weeks</div>
                        <div>Frequency: {pricing.frequency}x per week</div>
                        <div>Discount: {pricing.discount}%</div>
                        <div>Nutrition Plan: {pricing.includeNutritionPlan ? 'Yes' : 'No'}</div>
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        Created: {new Date(pricing.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calculator className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No pricing history found.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Assign Workout Modal */}
        {showAssignWorkoutModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">Assign Workout</h3>
                <button
                  onClick={() => setShowAssignWorkoutModal(false)}
                  className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Workout</label>
                  <select
                    value={selectedWorkoutId}
                    onChange={(e) => setSelectedWorkoutId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  >
                    <option value="">Choose a workout</option>
                    {availableWorkouts.map(workout => (
                      <option key={workout.id} value={workout.id}>
                        {workout.name} ({workout.category})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
                  <textarea
                    value={workoutNotes}
                    onChange={(e) => setWorkoutNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    rows={3}
                    placeholder="Add any notes for this workout assignment..."
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAssignWorkoutModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignWorkout}
                  className="flex-1 px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors"
                >
                  Assign Workout
                </button>
              </div>
          </div>
        </div>
        )}

        {/* Assign Nutrition Plan Modal */}
        {showAssignNutritionPlanModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">Assign Nutrition Plan</h3>
                <button
                  onClick={() => setShowAssignNutritionPlanModal(false)}
                  className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Nutrition Plan</label>
                  <select
                    value={selectedNutritionPlanId}
                    onChange={(e) => setSelectedNutritionPlanId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  >
                    <option value="">Choose a nutrition plan</option>
                    {availableNutritionPlans.map(plan => (
                      <option key={plan.id} value={plan.id}>
                        {plan.name} ({plan.goal})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
                  <textarea
                    value={nutritionPlanNotes}
                    onChange={(e) => setNutritionPlanNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    rows={3}
                    placeholder="Add any notes for this nutrition plan assignment..."
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAssignNutritionPlanModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignNutritionPlan}
                  className="flex-1 px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors"
                >
                  Assign Plan
                </button>
              </div>
          </div>
        </div>
        )}

        {/* Edit Pricing Modal */}
        {showEditPricingModal && editingPricing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">Edit Pricing</h3>
                <button
                  onClick={() => {
                    setShowEditPricingModal(false);
                    setEditingPricing(null);
                  }}
                  className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <EditPricingForm 
                pricing={editingPricing}
                onSave={handleUpdatePricing}
                onCancel={() => {
                  setShowEditPricingModal(false);
                  setEditingPricing(null);
                }}
              />
            </div>
          </div>
        )}

        {/* Edit Measurement Modal */}
        {showEditMeasurementModal && editingMeasurement && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">Edit Measurement</h3>
                <button
                  onClick={() => {
                    setShowEditMeasurementModal(false);
                    setEditingMeasurement(null);
                  }}
                  className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <EditMeasurementForm 
                measurement={editingMeasurement}
                onSave={handleUpdateMeasurement}
                onCancel={() => {
                  setShowEditMeasurementModal(false);
                  setEditingMeasurement(null);
                }}
              />
            </div>
          </div>
        )}

        {/* Edit Customer Modal */}
        {showEditCustomerModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">Edit Customer</h3>
                <button
                  onClick={() => setShowEditCustomerModal(false)}
                  className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <EditCustomerForm 
                customer={customer}
                onSave={handleUpdateCustomer}
                onCancel={() => setShowEditCustomerModal(false)}
              />
            </div>
          </div>
        )}

        {/* Photo Upload Modal */}
        {showPhotoUploadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">Add Progress Photos</h3>
                <button
                  onClick={() => setShowPhotoUploadModal(false)}
                  className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <PhotoUploadForm 
                customerId={customerId}
                existingPhotos={customerPhotos}
                onSave={(photos) => {
                  setCustomerPhotos(prev => [...prev, ...photos]);
                  setShowPhotoUploadModal(false);
                }}
                onCancel={() => setShowPhotoUploadModal(false)}
              />
            </div>
          </div>
        )}

        {/* Edit Photo Modal */}
        {showEditPhotoModal && editingPhoto && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">Edit Photo</h3>
                <button
                  onClick={() => {
                    setShowEditPhotoModal(false);
                    setEditingPhoto(null);
                  }}
                  className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <EditPhotoForm 
                photo={editingPhoto}
                onSave={handleUpdatePhoto}
                onCancel={() => {
                  setShowEditPhotoModal(false);
                  setEditingPhoto(null);
                }}
              />
            </div>
          </div>
        )}

        {/* Photo Gallery Modal - Full Screen */}
        {showPhotoGalleryModal && selectedPhoto && (
          <div className="fixed inset-0 bg-black z-50 flex flex-col">
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/90 to-transparent p-4">
              <div className="flex items-center justify-between">
                <div className="text-white">
                  <h3 className="text-lg sm:text-xl font-bold capitalize flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      selectedPhoto.position === 'front' ? 'bg-green-500' :
                      selectedPhoto.position === 'side' ? 'bg-blue-500' : 'bg-purple-500'
                    }`}></div>
                    {selectedPhoto.position} View
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-300">
                    Week {selectedPhoto.week} • {new Date(selectedPhoto.date).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowPhotoGalleryModal(false);
                    setSelectedPhoto(null);
                    setGalleryPhotos([]);
                    setCurrentPhotoIndex(0);
                  }}
                  className="p-2 rounded-lg text-white hover:bg-white/20 transition-colors"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>
            </div>

            {/* Main Photo - Full Screen */}
            <div className="flex-1 flex items-center justify-center p-2 sm:p-4 pt-16 sm:pt-20">
              <img
                src={selectedPhoto.imageUrl}
                alt={`Week ${selectedPhoto.week} ${selectedPhoto.position} view`}
                className="max-w-full max-h-full object-contain"
                style={{
                  maxWidth: '100vw',
                  maxHeight: '100vh',
                  width: 'auto',
                  height: 'auto'
                }}
                loading="eager"
              />
              
              {/* Navigation Arrows */}
              {galleryPhotos.length > 1 && (
                <>
                  <button
                    onClick={handlePreviousPhoto}
                    disabled={currentPhotoIndex === 0}
                    className={`absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 p-2 sm:p-3 rounded-full text-white transition-colors ${
                      currentPhotoIndex === 0 
                        ? 'bg-gray-600 cursor-not-allowed opacity-50' 
                        : 'bg-black/50 hover:bg-black/70'
                    }`}
                  >
                    <ArrowLeft className="w-4 h-4 sm:w-6 sm:h-6" />
                  </button>
                  <button
                    onClick={handleNextPhoto}
                    disabled={currentPhotoIndex === galleryPhotos.length - 1}
                    className={`absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 p-2 sm:p-3 rounded-full text-white transition-colors ${
                      currentPhotoIndex === galleryPhotos.length - 1 
                        ? 'bg-gray-600 cursor-not-allowed opacity-50' 
                        : 'bg-black/50 hover:bg-black/70'
                    }`}
                  >
                    <ArrowLeft className="w-4 h-4 sm:w-6 sm:h-6 rotate-180" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Navigation */}
            {galleryPhotos.length > 1 && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-2 sm:p-4">
                <div className="flex justify-center gap-1 sm:gap-2">
                  {galleryPhotos.map((photo, index) => (
                    <button
                      key={photo.id}
                      onClick={() => {
                        setCurrentPhotoIndex(index);
                        setSelectedPhoto(photo);
                      }}
                      className={`relative w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden border-2 transition-all ${
                        index === currentPhotoIndex 
                          ? 'border-rose-500 ring-2 ring-rose-500' 
                          : 'border-gray-600 hover:border-gray-400'
                      }`}
                    >
                      <img
                        src={photo.imageUrl}
                        alt={`${photo.position} thumbnail`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs px-1 py-0.5 text-center">
                        {photo.position}
                      </div>
                    </button>
                  ))}
                </div>
                <div className="text-center text-white text-xs sm:text-sm mt-2">
                  {currentPhotoIndex + 1} of {galleryPhotos.length}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
  );
}
