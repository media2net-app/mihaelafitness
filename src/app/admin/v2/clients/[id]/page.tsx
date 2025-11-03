'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Mail, Phone, Calendar, Star, Users, Dumbbell, Apple, Calculator, Edit, Trash2, Download, Share2, Eye, X, Ruler, TrendingUp, Plus, Clock, Target, Award, Camera, Upload, Image as ImageIcon, BookOpen, DollarSign } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';

// Workout Plan Tab Component
function WorkoutPlanTab({ customerId }: { customerId: string }) {
  const [workoutAssignments, setWorkoutAssignments] = useState<any[]>([]);
  const [loadingWorkouts, setLoadingWorkouts] = useState(true);
  
  useEffect(() => {
    const fetchWorkoutPlan = async () => {
      try {
        const response = await fetch(`/api/customer-schedule-assignments?customerId=${customerId}`);
        if (response.ok) {
          const assignments = await response.json();
          setWorkoutAssignments(assignments);
        }
      } catch (error) {
        console.error('Error fetching workout plan:', error);
      } finally {
        setLoadingWorkouts(false);
      }
    };
    
    fetchWorkoutPlan();
  }, [customerId]);
  
  if (loadingWorkouts) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto"></div>
        <p className="text-gray-600 mt-4">Loading workout plan...</p>
      </div>
    );
  }
  
  if (workoutAssignments.length === 0) {
    return (
      <div className="text-center py-8">
        <Dumbbell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No workout plan assigned yet</p>
      </div>
    );
  }
  
  const weekdayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  return (
    <div className="space-y-4 sm:space-y-6">
      <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">Workout Plan</h3>
      
      <div className="space-y-6">
        {workoutAssignments.map((assignment) => (
          <div key={assignment.id} className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl p-6 border border-rose-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-rose-600" />
                  <span className="text-sm font-medium text-rose-600">{weekdayNames[assignment.weekday]}</span>
                </div>
                <h4 className="text-xl font-bold text-gray-800">{assignment.workout.name}</h4>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">Category</div>
                <div className="text-sm font-medium text-gray-800">{assignment.workout.category}</div>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-white rounded-lg p-3">
                <div className="text-xs text-gray-600 mb-1">Difficulty</div>
                <div className="text-sm font-semibold text-gray-800 capitalize">{assignment.workout.difficulty}</div>
              </div>
              <div className="bg-white rounded-lg p-3">
                <div className="text-xs text-gray-600 mb-1">Duration</div>
                <div className="text-sm font-semibold text-gray-800">{assignment.workout.duration} min</div>
              </div>
              <div className="bg-white rounded-lg p-3">
                <div className="text-xs text-gray-600 mb-1">Type</div>
                <div className="text-sm font-semibold text-gray-800">{assignment.workout.trainingType}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Edit Measurement Form Component
function EditMeasurementForm({ measurement, onSave, onCancel }: { measurement: any, onSave: (data: any) => void, onCancel: () => void }) {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    week: measurement.week || 1,
    date: measurement.date || new Date().toISOString().split('T')[0],
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

  const calculateBMI = (weight: string, height: string) => {
    const weightNum = parseFloat(weight);
    const heightNum = parseFloat(height);

    if (weightNum && heightNum && heightNum > 0) {
      const heightInMeters = heightNum / 100;
      const bmi = weightNum / (heightInMeters * heightInMeters);
      return bmi.toFixed(1);
    }
    return '';
  };

  const handleWeightChange = (value: string) => {
    const newFormData = { ...formData, weight: value };
    newFormData.bmi = calculateBMI(value, formData.height);
    setFormData(newFormData);
  };

  const handleHeightChange = (value: string) => {
    const newFormData = { ...formData, height: value };
    newFormData.bmi = calculateBMI(formData.weight, value);
    setFormData(newFormData);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('EditMeasurementForm submitting:', formData);
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Week</label>
          <input
            type="number"
            value={formData.week}
            onChange={(e) => setFormData({...formData, week: parseInt(e.target.value) || 1})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
            placeholder={t.dashboard.autoCalculated}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Thigh (cm)</label>
          <input
            type="number"
            step="0.1"
            value={formData.thigh}
            onChange={(e) => setFormData({...formData, thigh: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            placeholder="cm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Arm (cm)</label>
          <input
            type="number"
            step="0.1"
            value={formData.arm}
            onChange={(e) => setFormData({...formData, arm: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            placeholder="cm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Neck (cm)</label>
          <input
            type="number"
            step="0.1"
            value={formData.neck}
            onChange={(e) => setFormData({...formData, neck: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            placeholder="cm"
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
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors text-sm sm:text-base"
        >
          Save Changes
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
  const { t } = useLanguage();
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

  const handleFileChange = (position: string, file: File | null) => {
    setFormData(prev => ({
      ...prev,
      [position + 'Photo']: file
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.frontPhoto && !formData.sidePhoto && !formData.backPhoto) {
      alert('Please select at least one photo to upload');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setUploadStatus('Preparing upload...');

    try {
      const uploadedPhotos: any[] = [];
      const photos = [
        { file: formData.frontPhoto, position: 'front' },
        { file: formData.sidePhoto, position: 'side' },
        { file: formData.backPhoto, position: 'back' }
      ].filter(p => p.file);

      for (let i = 0; i < photos.length; i++) {
        setUploadStatus(`Uploading ${photos[i].position} photo... (${i + 1}/${photos.length})`);
        
        const uploadFormData = new FormData();
        uploadFormData.append('file', photos[i].file!);
        uploadFormData.append('customerId', customerId);
        uploadFormData.append('week', formData.week.toString());
        uploadFormData.append('date', formData.date);
        uploadFormData.append('position', photos[i].position);
        uploadFormData.append('notes', formData.notes);

        console.log('Uploading photo with data:', {
          customerId,
          week: formData.week,
          date: formData.date,
          position: photos[i].position,
          notes: formData.notes,
          fileName: photos[i].file!.name
        });

        const response = await fetch('/api/customer-photos', {
          method: 'POST',
          body: uploadFormData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error(`Upload failed for ${photos[i].position} photo:`, errorData);
          throw new Error(`Upload failed for ${photos[i].position} photo: ${errorData.error || 'Unknown error'}`);
        }

        const result = await response.json();
        console.log(`Successfully uploaded ${photos[i].position} photo:`, result);
        uploadedPhotos.push(result);
        setUploadProgress(((i + 1) / photos.length) * 100);
      }

      setUploadStatus('Upload complete!');
      setTimeout(() => {
        setUploading(false);
        onSave(uploadedPhotos);
        onCancel();
        window.location.reload();
      }, 1000);

    } catch (error: any) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
      setUploading(false);
    }
  };

  if (uploading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 w-full max-w-md mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Uploading Photos</h3>
            <p className="text-gray-600 mb-4">{uploadStatus}</p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-rose-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-500 mt-2">{Math.round(uploadProgress)}% complete</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Week</label>
          <input
            type="number"
            value={formData.week}
            onChange={(e) => setFormData({...formData, week: parseInt(e.target.value) || 1})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
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

      <div className="space-y-3 sm:space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Front View Photo</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange('front', e.target.files?.[0] || null)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
          />
          {formData.frontPhoto && (
            <div className="mt-2">
              <img
                src={URL.createObjectURL(formData.frontPhoto)}
                alt={t.dashboard.frontPreview}
                className="w-24 h-24 sm:w-32 sm:h-32 object-contain bg-gray-50 rounded-lg border border-gray-200"
              />
            </div>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Side View Photo</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange('side', e.target.files?.[0] || null)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
          />
          {formData.sidePhoto && (
            <div className="mt-2">
              <img
                src={URL.createObjectURL(formData.sidePhoto)}
                alt={t.dashboard.sidePreview}
                className="w-24 h-24 sm:w-32 sm:h-32 object-contain bg-gray-50 rounded-lg border border-gray-200"
              />
            </div>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Back View Photo</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange('back', e.target.files?.[0] || null)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
          />
          {formData.backPhoto && (
            <div className="mt-2">
              <img
                src={URL.createObjectURL(formData.backPhoto)}
                alt={t.dashboard.backPreview}
                className="w-24 h-24 sm:w-32 sm:h-32 object-contain bg-gray-50 rounded-lg border border-gray-200"
              />
            </div>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({...formData, notes: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
          rows={3}
          placeholder={t.dashboard.addNotesPhoto}
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!formData.frontPhoto && !formData.sidePhoto && !formData.backPhoto}
          className="flex-1 px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
        >
          Upload Photos
        </button>
      </div>
    </form>
  );
}

export default function ClientDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { t } = useLanguage();
  
  const [client, setClient] = useState<any>(null);
  const [measurements, setMeasurements] = useState<any[]>([]);
  const [photos, setPhotos] = useState<any[]>([]);
  const [customerPhotos, setCustomerPhotos] = useState<Array<{
    id: string;
    week: number;
    date: string;
    position: string;
    imageUrl: string;
    notes?: string;
  }>>([]);
  const [customerPricing, setCustomerPricing] = useState<Array<{
    id: string;
    service: string;
    duration: number;
    frequency: number;
    discount: number;
    vat: number;
    finalPrice: number;
    includeNutritionPlan: boolean;
    nutritionPlanCount: number;
    customerId: string;
    customerName: string;
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
  const [nutritionPlans, setNutritionPlans] = useState<Array<{
    id: string;
    customerId: string;
    nutritionPlanId: string;
    status: string;
    notes?: string;
    assignedAt: string;
    nutritionPlan: {
      id: string;
      name: string;
      goal: string;
      calories: number;
      protein: number;
    };
  }>>([]);
  const [payments, setPayments] = useState<Array<{
    id: string;
    amount: number;
    paymentMethod: string;
    paymentType: string;
    status: string;
    notes?: string;
    paymentDate: string;
    createdAt: string;
  }>>([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDeletePaymentModal, setShowDeletePaymentModal] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddMeasurementModal, setShowAddMeasurementModal] = useState(false);
  const [showEditMeasurementModal, setShowEditMeasurementModal] = useState(false);
  const [showPhotoUploadModal, setShowPhotoUploadModal] = useState(false);
  const [showPhotoGalleryModal, setShowPhotoGalleryModal] = useState(false);
  const [editingMeasurement, setEditingMeasurement] = useState<any>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<any>(null);
  const [galleryPhotos, setGalleryPhotos] = useState<any[]>([]);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showEditClientModal, setShowEditClientModal] = useState(false);
  const [calculation, setCalculation] = useState<any>(null);

  // Delete an entire week of photos and renumber subsequent weeks
  const deleteWeekAndRenumber = async (week: number) => {
    if (!clientId) return;
    if (!confirm(`Delete all photos for Week ${week}? Week numbers after this will shift down by 1.`)) return;

    try {
      const res = await fetch(`/api/customer-photos?customerId=${clientId}&week=${week}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to delete week');
        return;
      }
      // Refresh photos after deletion/renumbering
      const refreshed = await fetch(`/api/customer-photos?customerId=${clientId}`);
      if (refreshed.ok) {
        const refreshedPhotos = await refreshed.json();
        setCustomerPhotos(refreshedPhotos);
        setPhotos(refreshedPhotos);
      }
      alert(`Deleted Week ${week}. Updated ${data.shiftedCount || 0} subsequent photos.`);
    } catch (e) {
      console.error('Delete week error', e);
      alert('Delete failed');
    }
  };

  // Keyboard navigation for photo viewer
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!selectedPhoto) return;
      
      if (event.key === 'Escape') {
        setSelectedPhoto(null);
      } else if (event.key === 'ArrowLeft') {
        const currentIndex = customerPhotos.findIndex(p => p.id === selectedPhoto.id);
        const prevPhoto = customerPhotos[currentIndex - 1];
        if (prevPhoto) setSelectedPhoto(prevPhoto);
      } else if (event.key === 'ArrowRight') {
        const currentIndex = customerPhotos.findIndex(p => p.id === selectedPhoto.id);
        const nextPhoto = customerPhotos[currentIndex + 1];
        if (nextPhoto) setSelectedPhoto(nextPhoto);
      }
    };

    if (selectedPhoto) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [selectedPhoto, customerPhotos]);
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    phone: '',
    goal: '',
    status: 'active',
    plan: '',
    trainingFrequency: 1
  });

  const clientId = params.id as string;

  useEffect(() => {
    const loadClientData = async () => {
      try {
        setLoading(true);
        console.log('Loading client data for ID:', clientId);
        
        // Load client data
        const clientResponse = await fetch(`/api/users/${clientId}`);
        if (!clientResponse.ok) {
          throw new Error(`Failed to load client: ${clientResponse.status}`);
        }
        const clientData = await clientResponse.json();
        console.log('Client data loaded:', clientData);
        setClient(clientData);

        // Load measurements
        try {
          const measurementsResponse = await fetch(`/api/customer-measurements?customerId=${clientId}`);
          if (measurementsResponse.ok) {
            const measurementsData = await measurementsResponse.json();
            console.log('Measurements loaded:', measurementsData.length);
            setMeasurements(measurementsData);
          } else {
            console.log('No measurements found or error:', measurementsResponse.status);
            setMeasurements([]);
          }
        } catch (error) {
          console.error('Error loading measurements:', error);
          setMeasurements([]);
        }

        // Load customer photos (structured by week and position)
        try {
          console.log('Loading photos for customer ID:', clientId);
          const customerPhotosResponse = await fetch(`/api/customer-photos?customerId=${clientId}`);
          if (customerPhotosResponse.ok) {
            const customerPhotosData = await customerPhotosResponse.json();
            console.log('Customer photos loaded:', customerPhotosData.length);
            console.log('Photos data:', customerPhotosData);
            setCustomerPhotos(customerPhotosData);
            setPhotos(customerPhotosData); // Also set for legacy compatibility
          } else {
            console.log('No photos found or error:', customerPhotosResponse.status);
            setCustomerPhotos([]);
            setPhotos([]);
          }
        } catch (error) {
          console.error('Error loading photos:', error);
          setCustomerPhotos([]);
          setPhotos([]);
        }

        // Load customer pricing
        try {
          const pricingResponse = await fetch(`/api/pricing-calculations?customerId=${clientId}`);
          if (pricingResponse.ok) {
            const pricingData = await pricingResponse.json();
            console.log('Customer pricing loaded:', pricingData.length);
            setCustomerPricing(pricingData);
          } else {
            console.log('No pricing found or error:', pricingResponse.status);
            setCustomerPricing([]);
          }
        } catch (error) {
          console.error('Error loading pricing:', error);
          setCustomerPricing([]);
        }

        // Load training sessions
        try {
          const sessionsResponse = await fetch(`/api/training-sessions?customerId=${clientId}`);
          if (sessionsResponse.ok) {
            const sessionsData = await sessionsResponse.json();
            console.log('Training sessions loaded:', sessionsData.length);
            setTrainingSessions(sessionsData);
          } else {
            console.log('No training sessions found or error:', sessionsResponse.status);
            setTrainingSessions([]);
          }
        } catch (error) {
          console.error('Error loading training sessions:', error);
          setTrainingSessions([]);
        }

        // Load nutrition plans
        try {
          const nutritionPlansResponse = await fetch(`/api/customer-nutrition-plans?customerId=${clientId}`);
          if (nutritionPlansResponse.ok) {
            const nutritionPlansData = await nutritionPlansResponse.json();
            console.log('Nutrition plans loaded:', nutritionPlansData.length);
            setNutritionPlans(nutritionPlansData);
          } else {
            console.log('No nutrition plans found or error:', nutritionPlansResponse.status);
            setNutritionPlans([]);
          }
        } catch (error) {
          console.error('Error loading nutrition plans:', error);
          setNutritionPlans([]);
        }

        // Load payments (temporarily disabled until database migration)
        try {
          const paymentsResponse = await fetch(`/api/payments?customerId=${clientId}`);
          if (paymentsResponse.ok) {
            const paymentsData = await paymentsResponse.json();
            console.log('Payments loaded:', paymentsData.length);
            setPayments(paymentsData);
          } else {
            console.log('No payments found or error:', paymentsResponse.status);
            setPayments([]);
          }
        } catch (error) {
          console.error('Error loading payments:', error);
          setPayments([]);
        }

        // Load KCAL V2 calculation
        try {
          const calculationResponse = await fetch(`/api/nutrition-calculations-v2?customerId=${clientId}`);
          if (calculationResponse.ok) {
            const calculationData = await calculationResponse.json();
            // Get the most recent calculation
            if (calculationData && calculationData.length > 0) {
              setCalculation(calculationData[0]);
            }
          }
        } catch (error) {
          console.error('Error loading calculation:', error);
        }

      } catch (error) {
        console.error('Error loading client data:', error);
        alert('Failed to load client data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (clientId) {
      loadClientData();
    }
  }, [clientId]);

  // Keyboard navigation for photo viewer
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!selectedPhoto) return;
      
      const currentIndex = customerPhotos.findIndex(p => p.id === selectedPhoto.id);
      
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          const prevPhoto = customerPhotos[currentIndex - 1];
          if (prevPhoto) setSelectedPhoto(prevPhoto);
          break;
        case 'ArrowRight':
          event.preventDefault();
          const nextPhoto = customerPhotos[currentIndex + 1];
          if (nextPhoto) setSelectedPhoto(nextPhoto);
          break;
        case 'Escape':
          event.preventDefault();
          setSelectedPhoto(null);
          break;
      }
    };

    if (selectedPhoto) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [selectedPhoto, customerPhotos]);

  const handleOpenPhotoGallery = (photo: any) => {
    console.log('🖼️ Opening photo gallery for photo:', photo);
    console.log('🖼️ Current customerPhotos:', customerPhotos);
    
    // Sort all photos by week and position for better navigation
    const sortedPhotos = [...customerPhotos].sort((a, b) => {
      if (a.week !== b.week) return b.week - a.week; // Newest weeks first
      const positions = ['front', 'side', 'back'];
      return positions.indexOf(a.position) - positions.indexOf(b.position);
    });
    
    console.log('🖼️ Sorted photos:', sortedPhotos);
    
    setGalleryPhotos(sortedPhotos);
    setCurrentPhotoIndex(sortedPhotos.findIndex(p => p.id === photo.id));
    setSelectedPhoto(photo);
    setShowPhotoGalleryModal(true);
    
    console.log('🖼️ Modal should be open now');
    console.log('🖼️ showPhotoGalleryModal state:', true);
  };

  const handleAddMeasurement = async (formData: any) => {
    try {
      console.log('[Frontend] Adding measurement with data:', { ...formData, customerId: clientId });
      console.log('[Frontend] Client ID from params:', clientId);
      console.log('[Frontend] Client data:', client);
      
      if (!clientId) {
        alert('Error: No client ID found. Please refresh the page and try again.');
        return;
      }
      
      const response = await fetch('/api/customer-measurements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, customerId: clientId })
      });

      console.log('[Frontend] Response status:', response.status);
      
      if (response.ok) {
        const newMeasurement = await response.json();
        console.log('[Frontend] Measurement created successfully:', newMeasurement);
        setMeasurements([newMeasurement, ...measurements]);
        setShowAddMeasurementModal(false);
        alert('Measurement added successfully!');
      } else {
        const errorData = await response.json();
        console.error('[Frontend] Error adding measurement:', errorData);
        console.error('[Frontend] Response status:', response.status);
        alert(`Error adding measurement: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error: any) {
      console.error('[Frontend] Error adding measurement:', error);
      alert(`Failed to add measurement: ${error.message || 'Network error'}`);
    }
  };

  const handleUpdateMeasurement = async (data: any) => {
    try {
      console.log('Updating measurement:', { id: editingMeasurement.id, data });
      
      const response = await fetch(`/api/customer-measurements/${editingMeasurement.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        const updatedMeasurement = await response.json();
        setMeasurements(measurements.map(m => m.id === editingMeasurement.id ? updatedMeasurement : m));
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
      alert('Failed to update measurement');
    }
  };

  const handleDeleteMeasurement = async (id: string) => {
    if (confirm('Are you sure you want to delete this measurement?')) {
      try {
        const response = await fetch(`/api/customer-measurements/${id}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          setMeasurements(measurements.filter(m => m.id !== id));
          alert('Measurement deleted successfully!');
        } else {
          throw new Error('Failed to delete measurement');
        }
      } catch (error) {
        console.error('Error deleting measurement:', error);
        alert('Failed to delete measurement');
      }
    }
  };

  const handleDeletePaymentClick = (payment: any) => {
    setPaymentToDelete(payment);
    setShowDeletePaymentModal(true);
  };

  const handleDeletePayment = async () => {
    if (!paymentToDelete) return;
    
    try {
      const response = await fetch(`/api/payments/${paymentToDelete.id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        // Remove payment from local state
        setPayments(prev => prev.filter(p => p.id !== paymentToDelete.id));
        setShowDeletePaymentModal(false);
        setPaymentToDelete(null);
        alert('Payment deleted successfully!');
      } else {
        console.error('Failed to delete payment');
        alert('Failed to delete payment');
      }
    } catch (error) {
      console.error('Error deleting payment:', error);
      alert('Failed to delete payment');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading client data...</p>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Client Not Found</h1>
          <button
            onClick={() => router.push('/admin/clients')}
            className="bg-rose-500 text-white px-6 py-3 rounded-xl hover:bg-rose-600 transition-colors"
          >
            Back to Clients
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
      <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 max-w-full overflow-hidden">
        {/* Header */}
        <div className="mb-4 sm:mb-8">
          <div className="flex items-center gap-2 sm:gap-4 mb-3 sm:mb-6">
            <button
              onClick={() => router.push('/admin/clients')}
              className="p-1.5 sm:p-2 text-gray-600 hover:text-gray-800 hover:bg-white rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold text-gray-800 truncate">{client.name}</h1>
              <p className="text-sm sm:text-base text-gray-600">Client Details & Progress</p>
            </div>
          </div>
        </div>

        {/* Client Info Card */}
        <div className="bg-white rounded-xl shadow-lg p-3 sm:p-6 mb-4 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-rose-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-lg sm:text-2xl font-bold text-rose-600">
                  {client.name.charAt(0)}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800 truncate">{client.name}</h2>
                <p className="text-sm sm:text-base text-gray-600 truncate">{client.email}</p>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2 text-xs sm:text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Phone className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="truncate">{client.phone || 'No phone'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="truncate">Joined {new Date(client.joinDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current flex-shrink-0" />
                    <span className="truncate">{client.rating || 'No rating'}</span>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                setEditFormData({
                  name: client.name || '',
                  email: client.email || '',
                  phone: client.phone || '',
                  goal: client.goal || '',
                  status: client.status || 'active',
                  plan: client.plan || '',
                  trainingFrequency: client.trainingFrequency || 1
                });
                setShowEditClientModal(true);
              }}
              className="flex items-center gap-1 sm:gap-2 px-2 py-1.5 sm:px-4 sm:py-3 bg-rose-500 text-white rounded-lg sm:rounded-xl hover:bg-rose-600 transition-colors flex-shrink-0 text-xs sm:text-base"
            >
              <Edit className="w-3 h-3 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Edit client</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-2 sm:p-4 mb-4 sm:mb-8">
          <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-9 gap-1 sm:gap-2">
            {[
              { id: 'overview', label: 'Overview', icon: Target, shortLabel: 'Overview' },
              { id: 'measurements', label: 'Measurements', icon: Ruler, shortLabel: 'Measure' },
              { id: 'photos', label: 'Photos', icon: Camera, shortLabel: 'Photos' },
              { id: 'progress', label: 'Progress', icon: TrendingUp, shortLabel: 'Progress' },
              { id: 'workout', label: 'Workout Plan', icon: Dumbbell, shortLabel: 'Workout' },
              { id: 'schedule', label: 'Training Schedule', icon: Calendar, shortLabel: 'Schedule' },
              { id: 'nutrition', label: 'Nutrition Calculator', icon: Apple, shortLabel: 'Nutrition' },
              { id: 'pricing', label: 'Pricing', icon: DollarSign, shortLabel: 'Pricing' },
              { id: 'kcal-v2', label: 'KCAL V2', icon: Calculator, shortLabel: 'KCAL V2' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center gap-1 px-2 py-2 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-rose-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-center leading-tight">{tab.shortLabel}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-3 sm:p-6">
          {activeTab === 'overview' && (
            <div className="space-y-4 sm:space-y-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">Overview</h3>
              
              {/* Key Metrics */}
              <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Dumbbell className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
                    <span className="text-xs sm:text-sm font-medium text-gray-700">Sessions</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-gray-800">{client.scheduledSessions || 0}</div>
                  <div className="text-xs text-gray-500">Total sessions</div>
                </div>
                
                <div className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
                    <span className="text-xs sm:text-sm font-medium text-gray-700">Frequency</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-gray-800">{client.trainingFrequency || 0}x</div>
                  <div className="text-xs text-gray-500">Per week</div>
                </div>
                
                <div className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 flex-shrink-0" />
                    <span className="text-xs sm:text-sm font-medium text-gray-700">Goal</span>
                  </div>
                  <div className="text-sm font-bold text-gray-800 line-clamp-2">{client.goal || 'Not set'}</div>
                </div>
                
                <div className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 flex-shrink-0" />
                    <span className="text-xs sm:text-sm font-medium text-gray-700">Status</span>
                  </div>
                  <div className="text-sm font-bold text-gray-800 capitalize">{client.status}</div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Recent Sessions */}
                <div className="bg-white border border-gray-200 rounded-lg sm:rounded-xl p-4 sm:p-6">
                  <h4 className="text-sm sm:text-base font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                    Recent Sessions
                  </h4>
                  {trainingSessions.length > 0 ? (
                    <div className="space-y-2 sm:space-y-3">
                      {trainingSessions.slice(0, 3).map((session) => (
                        <div key={session.id} className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className={`w-2 h-2 rounded-full ${
                              session.status === 'completed' ? 'bg-green-500' :
                              session.status === 'scheduled' ? 'bg-blue-500' : 'bg-gray-400'
                            }`}></div>
                            <div>
                              <p className="text-xs sm:text-sm font-medium text-gray-800">
                                {new Date(session.date).toLocaleDateString()}
                              </p>
                              <p className="text-xs text-gray-500">
                                {session.startTime} - {session.endTime} • {session.type}
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

                {/* Financial Summary & Payment History */}
                <div className="bg-white border border-gray-200 rounded-lg sm:rounded-xl p-4 sm:p-6">
                  <h4 className="text-sm sm:text-base font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                    Payment History & Next Payment
                  </h4>
                  
                  {/* Payment Summary Cards */}
                  {customerPricing.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4">
                      <div className="bg-gray-50 rounded-lg p-2 sm:p-3 text-center">
                        <div className="text-xs text-gray-600 mb-1">Total</div>
                        <div className="text-sm sm:text-lg font-bold text-gray-800">
                          {customerPricing.reduce((sum, p) => sum + p.finalPrice, 0)} RON
                        </div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-2 sm:p-3 text-center">
                        <div className="text-xs text-green-600 mb-1">Paid</div>
                        <div className="text-sm sm:text-lg font-bold text-green-700">
                          {payments.reduce((sum, payment) => sum + payment.amount, 0)} RON
                        </div>
                      </div>
                      <div className="bg-red-50 rounded-lg p-2 sm:p-3 text-center">
                        <div className="text-xs text-red-600 mb-1">Remaining</div>
                        <div className="text-sm sm:text-lg font-bold text-red-700">
                          {customerPricing.reduce((sum, p) => sum + p.finalPrice, 0) - payments.reduce((sum, payment) => sum + payment.amount, 0)} RON
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Next Payment Info */}
                  {payments.length > 0 && (() => {
                    // Find the most recent payment
                    const sortedPayments = [...payments].sort((a, b) => 
                      new Date(b.paymentDate || b.createdAt).getTime() - new Date(a.paymentDate || a.createdAt).getTime()
                    );
                    const lastPayment = sortedPayments[0];
                    const lastPaymentDate = new Date(lastPayment.paymentDate || lastPayment.createdAt);
                    
                    // Calculate next payment date (4 weeks after last payment)
                    const nextPaymentDate = new Date(lastPaymentDate);
                    nextPaymentDate.setDate(nextPaymentDate.getDate() + 28); // 4 weeks = 28 days
                    
                    // Calculate days until next payment
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const daysUntil = Math.ceil((nextPaymentDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                    
                    // Get payment amount (from last payment or average)
                    const averagePayment = payments.length > 0 
                      ? Math.round(payments.reduce((sum, p) => sum + p.amount, 0) / payments.length)
                      : 0;
                    
                    return (
                      <div className={`mb-4 p-3 sm:p-4 rounded-lg border-2 ${
                        daysUntil <= 7 ? 'bg-red-50 border-red-300' : 
                        daysUntil <= 14 ? 'bg-yellow-50 border-yellow-300' : 
                        'bg-blue-50 border-blue-300'
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Clock className={`w-4 h-4 sm:w-5 sm:h-5 ${
                              daysUntil <= 7 ? 'text-red-600' : 
                              daysUntil <= 14 ? 'text-yellow-600' : 
                              'text-blue-600'
                            }`} />
                            <span className={`text-xs sm:text-sm font-semibold ${
                              daysUntil <= 7 ? 'text-red-800' : 
                              daysUntil <= 14 ? 'text-yellow-800' : 
                              'text-blue-800'
                            }`}>
                              Next Payment
                            </span>
                          </div>
                          <span className={`text-xs sm:text-sm font-bold ${
                            daysUntil <= 7 ? 'text-red-700' : 
                            daysUntil <= 14 ? 'text-yellow-700' : 
                            'text-blue-700'
                          }`}>
                            {averagePayment} RON
                          </span>
                        </div>
                        <div className="text-xs sm:text-sm text-gray-700">
                          <div>Date: <span className="font-semibold">{nextPaymentDate.toLocaleDateString('ro-RO')}</span></div>
                          <div className="mt-1">
                            {daysUntil < 0 ? (
                              <span className="text-red-600 font-semibold">Overdue by {Math.abs(daysUntil)} days</span>
                            ) : daysUntil === 0 ? (
                              <span className="text-red-600 font-semibold">Due today!</span>
                            ) : (
                              <span>{daysUntil} days remaining</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Payment History Table */}
                  {payments.length > 0 ? (
                    <div className="mt-4">
                      <h5 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2">Payment History</h5>
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs sm:text-sm">
                          <thead>
                            <tr className="border-b border-gray-200">
                              <th className="text-left py-2 px-1 sm:px-2 font-semibold text-gray-700">Date</th>
                              <th className="text-left py-2 px-1 sm:px-2 font-semibold text-gray-700">Amount</th>
                              <th className="text-left py-2 px-1 sm:px-2 font-semibold text-gray-700">Method</th>
                              <th className="text-left py-2 px-1 sm:px-2 font-semibold text-gray-700">Type</th>
                              <th className="text-left py-2 px-1 sm:px-2 font-semibold text-gray-700">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {[...payments].sort((a, b) => 
                              new Date(b.paymentDate || b.createdAt).getTime() - new Date(a.paymentDate || a.createdAt).getTime()
                            ).slice(0, 5).map((payment) => (
                              <tr key={payment.id} className="border-b border-gray-100">
                                <td className="py-2 px-1 sm:px-2 text-gray-600">
                                  {new Date(payment.paymentDate || payment.createdAt).toLocaleDateString('ro-RO')}
                                </td>
                                <td className="py-2 px-1 sm:px-2 font-semibold text-green-700">{payment.amount} RON</td>
                                <td className="py-2 px-1 sm:px-2 text-gray-600 capitalize">{payment.paymentMethod}</td>
                                <td className="py-2 px-1 sm:px-2 text-gray-600 capitalize">{payment.paymentType}</td>
                                <td className="py-2 px-1 sm:px-2">
                                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                                    payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                                    payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {payment.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {payments.length > 5 && (
                          <p className="text-xs text-gray-500 mt-2 text-center">
                            Showing 5 most recent payments. View all in Pricing tab.
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-500">No payments recorded yet</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Progress Overview */}
              <div className="bg-white border border-gray-200 rounded-lg sm:rounded-xl p-4 sm:p-6">
                <h4 className="text-sm sm:text-base font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                  Progress Overview
                </h4>
                <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg sm:text-xl font-bold text-gray-800">{measurements.length}</div>
                    <div className="text-xs text-gray-500">Measurements</div>
                  </div>
                  <div 
                    className="text-center p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => {
                      console.log('Progress Photos card clicked, customerPhotos:', customerPhotos);
                      setShowPhotoGalleryModal(true);
                    }}
                  >
                    <div className="text-lg sm:text-xl font-bold text-gray-800">{customerPhotos.length}</div>
                    <div className="text-xs text-gray-500">Progress Photos</div>
                    <div className="text-xs text-blue-600 mt-1">Click to view</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg sm:text-xl font-bold text-gray-800">{nutritionPlans.length}</div>
                    <div className="text-xs text-gray-500">Nutrition Plans</div>
                  </div>
                </div>
              </div>

              {/* Progress Photos - Week 1 and Week 4 (or last week) */}
              {customerPhotos.length > 0 && (() => {
                const allWeeks = Array.from(new Set(customerPhotos.map(p => p.week))).sort((a, b) => a - b);
                const firstWeek = allWeeks[0];
                const lastWeek = allWeeks[allWeeks.length - 1];
                // Show week 1 and week 4 (or last week if less than 4 weeks)
                const weeksToShow = [firstWeek];
                if (lastWeek >= 4) {
                  weeksToShow.push(4);
                } else if (lastWeek !== firstWeek) {
                  weeksToShow.push(lastWeek);
                }
                return weeksToShow.sort((a, b) => b - a);
              })().length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg sm:rounded-xl p-4 sm:p-6">
                  <h4 className="text-sm sm:text-base font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
                    <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                    Progress Photos
                  </h4>
                  <div className="space-y-4 sm:space-y-6">
                    {(() => {
                      const allWeeks = Array.from(new Set(customerPhotos.map(p => p.week))).sort((a, b) => a - b);
                      const firstWeek = allWeeks[0];
                      const lastWeek = allWeeks[allWeeks.length - 1];
                      // Show week 1 and week 4 (or last week if less than 4 weeks)
                      const weeksToShow = [firstWeek];
                      if (lastWeek >= 4) {
                        weeksToShow.push(4);
                      } else if (lastWeek !== firstWeek) {
                        weeksToShow.push(lastWeek);
                      }
                      return weeksToShow.sort((a, b) => b - a);
                    })().map(week => (
                      <div key={week} className="border border-gray-200 rounded-lg p-3 sm:p-4">
                        <h5 className="text-sm sm:text-base font-semibold text-gray-800 mb-3 sm:mb-4">Week {week}</h5>
                        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                          {['front', 'side', 'back'].map(position => {
                            const photo = customerPhotos.find(p => p.week === week && p.position === position);
                            return (
                              <div key={position} className="text-center">
                                <h6 className="text-xs sm:text-sm font-medium text-gray-600 mb-2 capitalize">{position} View</h6>
                                {photo ? (
                                  <div className="relative group">
                                    <img
                                      src={photo.url}
                                      alt={`Week ${week} - ${position}`}
                                      className="w-full h-48 sm:h-64 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
                                      onClick={() => {
                                        const allPhotosForWeek = customerPhotos.filter(p => p.week === week);
                                        const startIndex = allPhotosForWeek.findIndex(p => p.id === photo.id);
                                        setSelectedPhotoIndex(startIndex >= 0 ? startIndex : 0);
                                        setShowPhotoGalleryModal(true);
                                      }}
                                    />
                                  </div>
                                ) : (
                                  <div className="w-full h-48 sm:h-64 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                                    <ImageIcon className="w-8 h-8 text-gray-400" />
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'measurements' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800">Measurements</h3>
                <button
                  onClick={() => setShowAddMeasurementModal(true)}
                  className="bg-rose-500 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-rose-600 transition-colors flex items-center gap-2 text-sm"
                >
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Add Measurement</span>
                  <span className="sm:hidden">Add</span>
                </button>
              </div>

              {measurements.length > 0 ? (
                <div className="space-y-4">
                  {measurements.map((measurement) => (
                    <div key={measurement.id} className="border border-gray-200 rounded-lg p-3 sm:p-4">
                      <div className="flex items-center justify-between mb-2 sm:mb-3">
                        <h4 className="font-semibold text-gray-800 text-sm sm:text-base">
                          {new Date(measurement.date).toLocaleDateString()}
                        </h4>
                        <div className="flex gap-1 sm:gap-2">
                          <button
                            onClick={() => {
                              setEditingMeasurement(measurement);
                              setShowEditMeasurementModal(true);
                            }}
                            className="p-1.5 sm:p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteMeasurement(measurement.id)}
                            className="p-1.5 sm:p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 text-xs sm:text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Week:</span>
                          <span className="font-medium">{measurement.week}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Weight:</span>
                          <span className="font-medium">{measurement.weight} kg</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Height:</span>
                          <span className="font-medium">{measurement.height} cm</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Age:</span>
                          <span className="font-medium">{measurement.age} years</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">BMI:</span>
                          <span className="font-medium">{measurement.bmi}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Body Fat:</span>
                          <span className="font-medium">{measurement.bodyFat}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Muscle Mass:</span>
                          <span className="font-medium">{measurement.muscleMass} kg</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Chest:</span>
                          <span className="font-medium">{measurement.chest} cm</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Waist:</span>
                          <span className="font-medium">{measurement.waist} cm</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Hips:</span>
                          <span className="font-medium">{measurement.hips} cm</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Thigh:</span>
                          <span className="font-medium">{measurement.thigh} cm</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Arm:</span>
                          <span className="font-medium">{measurement.arm} cm</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Neck:</span>
                          <span className="font-medium">{measurement.neck} cm</span>
                        </div>
                      </div>
                      {measurement.notes && (
                        <div className="mt-3">
                          <span className="text-gray-500 text-sm">Notes:</span>
                          <p className="text-gray-800 text-sm mt-1">{measurement.notes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Ruler className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No measurements recorded yet</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'photos' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800">Progress Photos</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      console.log('🧪 Test button clicked');
                      setShowPhotoGalleryModal(true);
                    }}
                    className="bg-blue-500 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 text-sm"
                  >
                    <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Test Gallery</span>
                    <span className="sm:hidden">Test</span>
                  </button>
                  <button
                    onClick={() => setShowPhotoUploadModal(true)}
                    className="bg-rose-500 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-rose-600 transition-colors flex items-center gap-2 text-sm"
                  >
                    <Upload className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Upload Photos</span>
                    <span className="sm:hidden">Upload</span>
                  </button>
                </div>
              </div>

              {customerPhotos.length > 0 ? (
                <div className="space-y-4 sm:space-y-6">
                  {(() => {
                    // Show ALL weeks in Photos tab
                    const allWeeks = Array.from(new Set(customerPhotos.map(p => p.week))).sort((a, b) => a - b);
                    return allWeeks.sort((a, b) => b - a);
                  })().map(week => (
                    <div key={week} className="border border-gray-200 rounded-lg p-3 sm:p-4">
                      <div className="flex items-center justify-between mb-3 sm:mb-4">
                        <h4 className="text-base sm:text-lg font-semibold text-gray-800">Week {week}</h4>
                        <button
                          className="text-red-600 text-sm hover:underline"
                          onClick={() => deleteWeekAndRenumber(week)}
                        >
                          Delete Week
                        </button>
                      </div>
                      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                        {['front', 'side', 'back'].map(position => {
                          const photo = customerPhotos.find(p => p.week === week && p.position === position);
                          return (
                            <div key={position} className="text-center">
                              <h5 className="text-sm font-medium text-gray-600 mb-2 capitalize">{position} View</h5>
                              {photo ? (
                                <div className="relative group">
                                  <img
                                    src={photo.imageUrl}
                                    alt={`${position} view week ${week}`}
                                    className="w-full h-48 object-contain bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
                                    onClick={() => handleOpenPhotoGallery(photo)}
                                  />
                                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg flex items-center justify-center">
                                    <Eye className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                  </div>
                                </div>
                              ) : (
                                <div className="w-full h-48 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                                  <span className="text-gray-400 text-sm">No {position} photo</span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      {customerPhotos.find(p => p.week === week && p.notes) && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600">
                            <strong>Notes:</strong> {customerPhotos.find(p => p.week === week && p.notes)?.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Camera className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No progress photos uploaded yet</p>
                  <p className="text-gray-400 text-sm mt-2">Upload front, side, and back view photos to track progress</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'progress' && (
            <div className="space-y-4 sm:space-y-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800">Progress Tracking</h3>
              
              {measurements.length > 1 ? (
                <div className="space-y-4 sm:space-y-6">
                  {/* Progress Overview Cards */}
                  <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                    {(() => {
                      const sortedMeasurements = [...measurements].sort((a, b) => a.week - b.week);
                      const first = sortedMeasurements[0];
                      const last = sortedMeasurements[sortedMeasurements.length - 1];
                      
                      const weightDiff = last.weight && first.weight ? last.weight - first.weight : 0;
                      const bmiDiff = last.bmi && first.bmi ? last.bmi - first.bmi : 0;
                      const bodyFatDiff = last.bodyFat && first.bodyFat ? last.bodyFat - first.bodyFat : 0;
                      
                      return (
                        <>
                          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-3 sm:p-4 border border-blue-200">
                            <div className="flex items-center justify-between mb-1 sm:mb-2">
                              <h4 className="font-semibold text-blue-800 text-sm sm:text-base">Weight Change</h4>
                              <TrendingUp className={`w-4 h-4 sm:w-5 sm:h-5 ${weightDiff >= 0 ? 'text-red-500' : 'text-green-500'}`} />
                            </div>
                            <div className="text-lg sm:text-2xl font-bold text-blue-900">
                              {weightDiff > 0 ? '+' : ''}{weightDiff.toFixed(1)} kg
                            </div>
                            <div className="text-xs sm:text-sm text-blue-600">
                              Week 1 → Week {sortedMeasurements.length}
                            </div>
                            <div className="text-xs text-blue-500 mt-1">
                              {first.weight} kg → {last.weight} kg
                            </div>
                          </div>
                          
                          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-3 sm:p-4 border border-green-200">
                            <div className="flex items-center justify-between mb-1 sm:mb-2">
                              <h4 className="font-semibold text-green-800 text-sm sm:text-base">BMI Change</h4>
                              <TrendingUp className={`w-4 h-4 sm:w-5 sm:h-5 ${bmiDiff >= 0 ? 'text-red-500' : 'text-green-500'}`} />
                            </div>
                            <div className="text-lg sm:text-2xl font-bold text-green-900">
                              {bmiDiff > 0 ? '+' : ''}{bmiDiff.toFixed(1)}
                            </div>
                            <div className="text-xs sm:text-sm text-green-600">
                              Week 1 → Week {sortedMeasurements.length}
                            </div>
                            <div className="text-xs text-green-500 mt-1">
                              {first.bmi} → {last.bmi}
                            </div>
                          </div>
                          
                          <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-3 sm:p-4 border border-purple-200">
                            <div className="flex items-center justify-between mb-1 sm:mb-2">
                              <h4 className="font-semibold text-purple-800 text-sm sm:text-base">Body Fat Change</h4>
                              <TrendingUp className={`w-4 h-4 sm:w-5 sm:h-5 ${bodyFatDiff >= 0 ? 'text-red-500' : 'text-green-500'}`} />
                            </div>
                            <div className="text-lg sm:text-2xl font-bold text-purple-900">
                              {bodyFatDiff > 0 ? '+' : ''}{bodyFatDiff.toFixed(1)}%
                            </div>
                            <div className="text-xs sm:text-sm text-purple-600">
                              Week 1 → Week {sortedMeasurements.length}
                            </div>
                            <div className="text-xs text-purple-500 mt-1">
                              {first.bodyFat}% → {last.bodyFat}%
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>

                  {/* Weekly Progress Chart */}
                  <div className="bg-white rounded-lg p-6 border border-gray-200">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Weekly Progress Overview</h4>
                    <div className="space-y-4">
                      {[...measurements].sort((a, b) => a.week - b.week).map((measurement, index) => {
                        const prevMeasurement = index > 0 ? measurements.sort((a, b) => a.week - b.week)[index - 1] : null;
                        
                        return (
                          <div key={measurement.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h5 className="font-semibold text-gray-800">Week {index + 1}</h5>
                              <span className="text-sm text-gray-500">{new Date(measurement.date).toLocaleDateString()}</span>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div className="text-center">
                                <div className="text-lg font-bold text-gray-800">{measurement.weight} kg</div>
                                <div className="text-xs text-gray-500">Weight</div>
                                {prevMeasurement && (
                                  <div className={`text-xs ${measurement.weight - prevMeasurement.weight >= 0 ? 'text-red-500' : 'text-green-500'}`}>
                                    {measurement.weight - prevMeasurement.weight > 0 ? '+' : ''}{(measurement.weight - prevMeasurement.weight).toFixed(1)} kg
                                  </div>
                                )}
                              </div>
                              
                              <div className="text-center">
                                <div className="text-lg font-bold text-gray-800">{measurement.bmi}</div>
                                <div className="text-xs text-gray-500">BMI</div>
                                {prevMeasurement && (
                                  <div className={`text-xs ${measurement.bmi - prevMeasurement.bmi >= 0 ? 'text-red-500' : 'text-green-500'}`}>
                                    {measurement.bmi - prevMeasurement.bmi > 0 ? '+' : ''}{(measurement.bmi - prevMeasurement.bmi).toFixed(1)}
                                  </div>
                                )}
                              </div>
                              
                              <div className="text-center">
                                <div className="text-lg font-bold text-gray-800">{measurement.bodyFat}%</div>
                                <div className="text-xs text-gray-500">Body Fat</div>
                                {prevMeasurement && (
                                  <div className={`text-xs ${measurement.bodyFat - prevMeasurement.bodyFat >= 0 ? 'text-red-500' : 'text-green-500'}`}>
                                    {measurement.bodyFat - prevMeasurement.bodyFat > 0 ? '+' : ''}{(measurement.bodyFat - prevMeasurement.bodyFat).toFixed(1)}%
                                  </div>
                                )}
                              </div>
                              
                              <div className="text-center">
                                <div className="text-lg font-bold text-gray-800">{measurement.muscleMass} kg</div>
                                <div className="text-xs text-gray-500">Muscle Mass</div>
                                {prevMeasurement && (
                                  <div className={`text-xs ${measurement.muscleMass - prevMeasurement.muscleMass >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                    {measurement.muscleMass - prevMeasurement.muscleMass > 0 ? '+' : ''}{(measurement.muscleMass - prevMeasurement.muscleMass).toFixed(1)} kg
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Body Measurements Progress */}
                  <div className="bg-white rounded-lg p-6 border border-gray-200">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Body Measurements Progress</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {['chest', 'waist', 'hips', 'thigh', 'arm', 'neck'].map(measurementType => {
                        const sortedMeasurements = [...measurements].sort((a, b) => a.week - b.week);
                        const first = sortedMeasurements[0];
                        const last = sortedMeasurements[sortedMeasurements.length - 1];
                        const diff = last[measurementType] && first[measurementType] ? last[measurementType] - first[measurementType] : 0;
                        
                        return (
                          <div key={measurementType} className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="font-semibold text-gray-800 capitalize">{measurementType}</h5>
                              <div className={`text-sm ${diff >= 0 ? 'text-red-500' : 'text-green-500'}`}>
                                {diff > 0 ? '+' : ''}{diff.toFixed(1)} cm
                              </div>
                            </div>
                            <div className="text-2xl font-bold text-gray-800">{last[measurementType]} cm</div>
                            <div className="text-xs text-gray-500">
                              Week {first.week}: {first[measurementType]} cm
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Add more measurements to see progress tracking</p>
                  <p className="text-gray-400 text-sm mt-2">Progress charts will appear after multiple measurements are recorded</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Training Schedule Tab */}
        {activeTab === 'schedule' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800">Training Schedule</h3>
              <button
                onClick={() => router.push('/admin/schedule')}
                className="bg-rose-500 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-rose-600 transition-colors flex items-center gap-2 text-sm"
              >
                <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Add Session</span>
                <span className="sm:hidden">Add</span>
              </button>
            </div>

            {/* Training Statistics */}
            {trainingSessions.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 sm:p-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Training Statistics</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {trainingSessions.length}
                    </div>
                    <div className="text-sm text-blue-800">Total Sessions</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {trainingSessions.filter(session => session.status === 'completed').length}
                    </div>
                    <div className="text-sm text-green-800">Completed</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {trainingSessions.filter(session => session.status === 'scheduled').length}
                    </div>
                    <div className="text-sm text-orange-800">Scheduled</div>
                  </div>
            </div>
          </div>
        )}

            {trainingSessions.length > 0 ? (
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-3 sm:p-6">
                <div className="space-y-4">
                  {trainingSessions.map((session) => (
                    <div key={session.id} className={`border rounded-lg p-3 sm:p-4 ${
                      session.status === 'completed' 
                        ? 'bg-green-100 border-green-200' 
                        : 'border-gray-200 bg-white'
                    }`}>
                      <div className="flex items-center justify-between mb-2 sm:mb-3">
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
                            <h4 className={`font-semibold text-sm sm:text-base ${
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
                            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm">
                        <div className="flex justify-between">
                          <span className={session.status === 'completed' ? 'text-green-600' : 'text-gray-500'}>Type:</span>
                          <span className={`font-medium ${session.status === 'completed' ? 'text-green-800' : 'text-gray-800'}`}>{session.type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className={session.status === 'completed' ? 'text-green-600' : 'text-gray-500'}>Duration:</span>
                          <span className={`font-medium ${session.status === 'completed' ? 'text-green-800' : 'text-gray-800'}`}>
                            {(() => {
                              const start = new Date(`2000-01-01T${session.startTime}`);
                              const end = new Date(`2000-01-01T${session.endTime}`);
                              const diff = end.getTime() - start.getTime();
                              const hours = Math.floor(diff / (1000 * 60 * 60));
                              const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                              return `${hours}h ${minutes}m`;
                            })()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className={session.status === 'completed' ? 'text-green-600' : 'text-gray-500'}>Status:</span>
                          <span className={`font-medium capitalize ${session.status === 'completed' ? 'text-green-800' : 'text-gray-800'}`}>{session.status}</span>
                        </div>
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

        {/* Nutrition Plans Tab */}
        {activeTab === 'nutrition' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800">Nutrition Plans</h3>
              <button
                onClick={() => router.push('/admin/voedingsplannen')}
                className="bg-rose-500 text-white px-4 py-2 rounded-lg hover:bg-rose-600 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Assign Plan
              </button>
            </div>

            {nutritionPlans.length > 0 ? (
              <div className="grid gap-4">
                {nutritionPlans.map((assignment) => (
                  <div key={assignment.id} className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-pink-600 rounded-full flex items-center justify-center">
                            <Apple className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h4 className="text-lg font-semibold text-gray-800">{assignment.nutritionPlan.name}</h4>
                            <p className="text-sm text-gray-600">{assignment.nutritionPlan.goal}</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                          <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <div className="text-lg font-bold text-rose-600">{assignment.nutritionPlan.calories}</div>
                            <div className="text-xs text-gray-600">Calories</div>
                          </div>
                          <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <div className="text-lg font-bold text-blue-600">{assignment.nutritionPlan.protein}g</div>
                            <div className="text-xs text-gray-600">Protein</div>
                          </div>
                          <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <div className="text-sm font-medium text-gray-600 capitalize">{assignment.status}</div>
                            <div className="text-xs text-gray-500">Status</div>
                          </div>
                          <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <div className="text-sm font-medium text-gray-600">
                              {new Date(assignment.assignedAt).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-gray-500">Assigned</div>
                          </div>
                        </div>

                        {assignment.notes && (
                          <div className="mb-4">
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Notes:</span> {assignment.notes}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => router.push(`/admin/voedingsplannen/${assignment.nutritionPlan.id}`)}
                          className="bg-rose-500 text-white px-4 py-2 rounded-lg hover:bg-rose-600 transition-colors flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          View Plan
                        </button>
                        <button
                          onClick={async () => {
                            if (confirm('Are you sure you want to remove this nutrition plan assignment?')) {
                              try {
                                const response = await fetch(`/api/customer-nutrition-plans?id=${assignment.id}`, {
                                  method: 'DELETE'
                                });
                                if (response.ok) {
                                  setNutritionPlans(nutritionPlans.filter(p => p.id !== assignment.id));
                                  alert('Nutrition plan assignment removed successfully');
                                } else {
                                  alert('Failed to remove nutrition plan assignment');
                                }
                              } catch (error) {
                                console.error('Error removing nutrition plan assignment:', error);
                                alert('Error removing nutrition plan assignment');
                              }
                            }
                          }}
                          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <Apple className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-gray-600 mb-2">No Nutrition Plans Assigned</h4>
                <p className="text-gray-500 mb-4">This client doesn't have any nutrition plans assigned yet.</p>
              <button
                  onClick={() => router.push('/admin/voedingsplannen')}
                className="bg-rose-500 text-white px-4 py-2 rounded-lg hover:bg-rose-600 transition-colors"
              >
                  Assign Nutrition Plan
              </button>
            </div>
            )}
          </div>
        )}

        {/* Workout Plan Tab */}
        {activeTab === 'workout' && (
          <WorkoutPlanTab customerId={Array.isArray(params.id) ? params.id[0] : params.id || ''} />
        )}

        {/* Pricing & Payments Tab */}
        {activeTab === 'pricing' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800">Pricing & Payments</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowPaymentModal(true)}
                  className="bg-green-500 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2 text-sm"
                >
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Record Payment</span>
                  <span className="sm:hidden">Payment</span>
                </button>
              <button
                onClick={() => router.push('/admin/tarieven')}
                  className="bg-rose-500 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-rose-600 transition-colors flex items-center gap-2 text-sm"
              >
                  <Calculator className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">New Calculation</span>
                  <span className="sm:hidden">New</span>
              </button>
            </div>
            </div>

            {/* Pricing Summary Table */}
            {customerPricing.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 sm:p-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Pricing Summary</h4>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-2 font-semibold text-gray-700">Service</th>
                        <th className="text-left py-3 px-2 font-semibold text-gray-700">Duration</th>
                        <th className="text-left py-3 px-2 font-semibold text-gray-700">Frequency</th>
                        <th className="text-left py-3 px-2 font-semibold text-gray-700">Discount</th>
                        <th className="text-left py-3 px-2 font-semibold text-gray-700">Total Price</th>
                        <th className="text-left py-3 px-2 font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customerPricing.map((pricing) => (
                        <tr key={pricing.id} className="border-b border-gray-100">
                          <td className="py-3 px-2 text-gray-800">{pricing.service}</td>
                          <td className="py-3 px-2 text-gray-600">{pricing.duration} weeks</td>
                          <td className="py-3 px-2 text-gray-600">{pricing.frequency}x per week</td>
                          <td className="py-3 px-2 text-gray-600">{pricing.discount}%</td>
                          <td className="py-3 px-2 font-bold text-rose-600">{pricing.finalPrice} RON</td>
                          <td className="py-3 px-2">
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
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
            </div>
              </div>
            )}

            {/* Payment History Table */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 sm:p-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Payment History</h4>
              {payments.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-2 font-semibold text-gray-700">Date</th>
                        <th className="text-left py-3 px-2 font-semibold text-gray-700">Amount</th>
                        <th className="text-left py-3 px-2 font-semibold text-gray-700">Method</th>
                        <th className="text-left py-3 px-2 font-semibold text-gray-700">Type</th>
                        <th className="text-left py-3 px-2 font-semibold text-gray-700">Status</th>
                        <th className="text-left py-3 px-2 font-semibold text-gray-700">Notes</th>
                        <th className="text-left py-3 px-2 font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((payment) => (
                        <tr key={payment.id} className="border-b border-gray-100">
                          <td className="py-3 px-2 text-gray-800">
                            {new Date(payment.paymentDate).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-2 font-bold text-green-600">{payment.amount} RON</td>
                          <td className="py-3 px-2 text-gray-600 capitalize">{payment.paymentMethod}</td>
                          <td className="py-3 px-2 text-gray-600 capitalize">{payment.paymentType}</td>
                          <td className="py-3 px-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                              payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {payment.status}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-gray-600">{payment.notes || '-'}</td>
                          <td className="py-3 px-2">
                            <button
                              onClick={() => handleDeletePaymentClick(payment)}
                              className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded-lg transition-colors"
                              title="Delete Payment"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No Payments Recorded</h3>
                  <p className="text-gray-500 mb-6">Record the first payment for this client</p>
                  <button
                    onClick={() => setShowPaymentModal(true)}
                    className="bg-green-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-green-600 transition-colors"
                  >
                    Record Payment
                  </button>
                </div>
              )}
            </div>

            {/* Payment Summary */}
            {customerPricing.length > 0 && (
              <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl p-4 sm:p-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Payment Summary</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-white rounded-lg">
                    <div className="text-2xl font-bold text-gray-800">
                      {customerPricing.reduce((sum, pricing) => sum + pricing.finalPrice, 0)} RON
                    </div>
                    <div className="text-sm text-gray-600">Total Amount</div>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {payments.reduce((sum, payment) => sum + payment.amount, 0)} RON
                    </div>
                    <div className="text-sm text-gray-600">Paid</div>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {customerPricing.reduce((sum, pricing) => sum + pricing.finalPrice, 0) - payments.reduce((sum, payment) => sum + payment.amount, 0)} RON
                    </div>
                    <div className="text-sm text-gray-600">Remaining</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modals */}
        {showAddMeasurementModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50">
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 w-full max-w-2xl max-h-[90vh] sm:max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800">Add Measurement</h2>
                <button
                  onClick={() => setShowAddMeasurementModal(false)}
                  className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
              <EditMeasurementForm
                measurement={{}}
                onSave={handleAddMeasurement}
                onCancel={() => setShowAddMeasurementModal(false)}
              />
            </div>
          </div>
        )}

        {showEditMeasurementModal && editingMeasurement && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50">
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 w-full max-w-2xl max-h-[90vh] sm:max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800">Edit Measurement</h2>
                <button
                  onClick={() => {
                    setShowEditMeasurementModal(false);
                    setEditingMeasurement(null);
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
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

        {showPhotoUploadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50">
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 w-full max-w-2xl max-h-[90vh] sm:max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800">Upload Progress Photos</h2>
                <button
                  onClick={() => setShowPhotoUploadModal(false)}
                  className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
              <PhotoUploadForm
                customerId={clientId}
                onSave={(photos) => {
                  console.log('Photos saved:', photos);
                  setCustomerPhotos([...customerPhotos, ...photos]);
                  setPhotos([...photos, ...photos]); // Also update legacy photos
                  setShowPhotoUploadModal(false);
                }}
                onCancel={() => setShowPhotoUploadModal(false)}
                existingPhotos={customerPhotos}
              />
            </div>
          </div>
        )}

        {showPhotoGalleryModal && (
          <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-50">
            <div className="relative w-full max-w-6xl max-h-[90vh] bg-black rounded-2xl overflow-hidden">
              {/* Header */}
              <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/70 to-transparent p-6">
                <div className="flex items-center justify-between">
                  <div className="text-white">
                    <h2 className="text-2xl font-bold">Photo Gallery</h2>
                    <p className="text-sm text-gray-300">
                      {customerPhotos.length} photos • {Array.from(new Set(customerPhotos.map(p => p.week))).length} weeks
                    </p>
                  </div>
                <button
                  onClick={() => setShowPhotoGalleryModal(false)}
                  className="p-2 rounded-lg text-white hover:bg-white/20 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

              {/* Photo Grid */}
              <div className="p-6 pt-20 pb-4 overflow-y-auto max-h-[90vh]">
                {Array.from(new Set(customerPhotos.map(p => p.week))).sort((a, b) => b - a).map(week => (
                  <div key={week} className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold text-white">Week {week}</h3>
                      <button
                        className="text-red-400 hover:text-red-300 text-sm"
                        onClick={() => deleteWeekAndRenumber(week)}
                      >
                        Delete Week
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {['front', 'side', 'back'].map(position => {
                        const photo = customerPhotos.find(p => p.week === week && p.position === position);
                        return (
                          <div key={position} className="relative group">
                            <div className="bg-gray-800 rounded-lg p-4">
                              <h4 className="text-lg font-medium text-white mb-3 capitalize flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${
                                  position === 'front' ? 'bg-green-500' :
                                  position === 'side' ? 'bg-blue-500' : 'bg-purple-500'
                                }`}></div>
                                {position} View
                              </h4>
                              {photo ? (
                                <div className="relative">
                                  <img
                                    src={photo.imageUrl}
                                    alt={`${position} view week ${week}`}
                                    className="w-full h-64 object-contain bg-gray-900 rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                    onClick={() => {
                                      // Open individual photo view
                                      setSelectedPhoto(photo);
                                      setShowPhotoGalleryModal(false);
                                      // The individual photo viewer will be shown automatically when selectedPhoto is set
                                    }}
                                  />
                                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg flex items-center justify-center">
                                    <Eye className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                  </div>
                                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                                    {new Date(photo.date).toLocaleDateString()}
                                  </div>
                                </div>
                              ) : (
                                <div className="w-full h-64 bg-gray-700 rounded-lg border-2 border-dashed border-gray-600 flex items-center justify-center">
                                  <div className="text-center text-gray-400">
                                    <div className="w-12 h-12 mx-auto mb-2 opacity-50">
                                      <svg fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                      </svg>
                                    </div>
                                    <p className="text-sm">No {position} photo</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Individual Photo Viewer Modal - Full Screen */}
        {selectedPhoto && (
          <div className="fixed inset-0 bg-black z-50 flex flex-col">
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/90 to-transparent p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="text-white">
                  <h3 className="text-xl sm:text-2xl font-bold capitalize flex items-center gap-2 sm:gap-3">
                    <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full ${
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
                  onClick={() => setSelectedPhoto(null)}
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
                alt={`${selectedPhoto.position} view week ${selectedPhoto.week}`}
                className="max-w-full max-h-full object-contain"
                style={{
                  maxWidth: '100vw',
                  maxHeight: '100vh',
                  width: 'auto',
                  height: 'auto'
                }}
              />
            </div>

            {/* Navigation */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 sm:p-6">
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center gap-2 sm:gap-4">
                  <button
                    onClick={() => {
                      const currentIndex = customerPhotos.findIndex(p => p.id === selectedPhoto.id);
                      const prevPhoto = customerPhotos[currentIndex - 1];
                      if (prevPhoto) setSelectedPhoto(prevPhoto);
                    }}
                    className="p-2 sm:p-3 rounded-lg bg-white/20 hover:bg-white/30 transition-colors disabled:opacity-50"
                    disabled={customerPhotos.findIndex(p => p.id === selectedPhoto.id) === 0}
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <span className="text-xs sm:text-sm">
                    {customerPhotos.findIndex(p => p.id === selectedPhoto.id) + 1} of {customerPhotos.length}
                  </span>
                  <button
                    onClick={() => {
                      const currentIndex = customerPhotos.findIndex(p => p.id === selectedPhoto.id);
                      const nextPhoto = customerPhotos[currentIndex + 1];
                      if (nextPhoto) setSelectedPhoto(nextPhoto);
                    }}
                    className="p-2 sm:p-3 rounded-lg bg-white/20 hover:bg-white/30 transition-colors disabled:opacity-50"
                    disabled={customerPhotos.findIndex(p => p.id === selectedPhoto.id) === customerPhotos.length - 1}
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
                <div className="text-xs sm:text-sm text-gray-300 max-w-xs">
                  {selectedPhoto.notes && (
                    <p className="truncate" title={selectedPhoto.notes}>
                      {selectedPhoto.notes}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* KCAL V2 Tab */}
        {activeTab === 'kcal-v2' && (
          <div className="space-y-6">
            {calculation ? (
              <>
                {/* Calculation Summary */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">Calculație KCAL V2</h2>
                    <span className="text-sm text-gray-500">
                      {new Date(calculation.createdAt).toLocaleDateString('ro-RO')}
                    </span>
                  </div>

                  {/* Final Result */}
                  <div className="bg-gradient-to-r from-rose-500 to-pink-600 text-white p-6 rounded-lg shadow-lg mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold">KCAL TOTALE ZILNICE</span>
                      <span className="text-4xl font-bold">{calculation.finalCalories} kcal</span>
                    </div>
                  </div>

                  {/* Steps */}
                  <div className="space-y-4 mb-6">
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold text-blue-900">Pasul 1: Metabolism Bazal (MB)</span>
                        <span className="text-2xl font-bold text-blue-700">{calculation.step1_mb} kcal</span>
                      </div>
                      <p className="text-sm text-blue-700">KG × 24 = {calculation.weight} × 24</p>
                    </div>

                    <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold text-purple-900">
                          Pasul 2: Genul ({calculation.gender === 'male' ? 'Bărbat' : 'Femeie'})
                        </span>
                        <span className="text-2xl font-bold text-purple-700">{calculation.step2_gender} kcal</span>
                      </div>
                      <p className="text-sm text-purple-700">
                        {calculation.gender === 'female' ? `${calculation.step1_mb} × 0.9 = -10%` : 'Fără ajustare'}
                      </p>
                    </div>

                    <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold text-green-900">Pasul 3: Vârstă</span>
                        <span className="text-2xl font-bold text-green-700">{calculation.step3_age} kcal</span>
                      </div>
                      <p className="text-sm text-green-700">
                        {calculation.age > 40 
                          ? `Pentru fiecare decadă peste 40 ani: -10% din MB (${Math.max(0, Math.floor((calculation.age - 40) / 10))} decenii)`
                          : 'Fără ajustare (< 40 ani)'}
                      </p>
                    </div>

                    <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold text-yellow-900">
                          Pasul 4: Tipul Somatic ({calculation.bodyType})
                        </span>
                        <span className="text-2xl font-bold text-yellow-700">{calculation.step4_bodyType} kcal</span>
                      </div>
                      <p className="text-sm text-yellow-700">
                        {calculation.bodyType === 'ectomorf' ? '+5%' : calculation.bodyType === 'endomorf' ? '-5%' : 'Fără ajustare (Mezomorf)'}
                      </p>
                    </div>

                    <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold text-indigo-900">
                          Pasul 5: Obiectiv ({calculation.objective === 'crestere' ? 'Creștere' : calculation.objective === 'scadere' ? 'Scădere' : 'Menținere'})
                        </span>
                        <span className="text-2xl font-bold text-indigo-700">{calculation.step5_objective} kcal</span>
                      </div>
                      <p className="text-sm text-indigo-700">
                        {calculation.objective === 'mentinere' 
                          ? 'Fără ajustare'
                          : `${calculation.objective === 'crestere' ? '+' : '-'}${calculation.objectivePercentage}% din MB`}
                      </p>
                    </div>

                    <div className="bg-teal-50 border-l-4 border-teal-500 p-4 rounded">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold text-teal-900">Pasul 6: Activitate Zilnică</span>
                        <span className="text-2xl font-bold text-teal-700">{calculation.step6_dailyActivity} kcal</span>
                      </div>
                      <p className="text-sm text-teal-700">+{calculation.dailyActivity}% din MB</p>
                    </div>

                    <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold text-orange-900">Pasul 7: Antrenament</span>
                        <span className="text-2xl font-bold text-orange-700">{calculation.step7_training} kcal</span>
                      </div>
                      <p className="text-sm text-orange-700">
                        +{calculation.trainingHours || 0} ore/săptămână × {calculation.trainingIntensity} cal/Kg/h
                      </p>
                    </div>
                  </div>

                  {/* Macronutrients */}
                  <div className="border-t pt-4">
                    <h3 className="font-semibold text-gray-900 mb-4">Macronutrienți</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                        <div className="text-sm text-red-700 mb-1">Proteine</div>
                        <div className="text-2xl font-bold text-red-900">{calculation.protein} g</div>
                        <div className="text-xs text-red-600 mt-1">
                          {calculation.gender === 'male' ? '2.2 g/Kg' : '1.6 g/Kg'}
                        </div>
                      </div>
                      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                        <div className="text-sm text-yellow-700 mb-1">Grăsimi</div>
                        <div className="text-2xl font-bold text-yellow-900">{calculation.fat} g</div>
                        <div className="text-xs text-yellow-600 mt-1">0.8 g/Kg (min 0.5-1)</div>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <div className="text-sm text-green-700 mb-1">Carbohidrați</div>
                        <div className="text-2xl font-bold text-green-900">{calculation.carbs} g</div>
                        <div className="text-xs text-green-600 mt-1">Min 2-6 g/Kg</div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="text-center py-12">
                  <Calculator className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">Nu există calculație salvată pentru acest client</p>
                  <button
                    onClick={() => router.push('/admin/kcal-calculator-v2')}
                    className="px-6 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors"
                  >
                    Creează Calculație
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Edit Client Modal */}
        {showEditClientModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50">
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 w-full max-w-2xl max-h-[90vh] sm:max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800">Edit Client</h2>
                <button
                  onClick={() => setShowEditClientModal(false)}
                  className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
              
              <form onSubmit={async (e) => {
                e.preventDefault();
                try {
                  const response = await fetch(`/api/users/${clientId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(editFormData)
                  });
                  
                  if (response.ok) {
                    const updatedClient = await response.json();
                    setClient(updatedClient);
                    setShowEditClientModal(false);
                    alert('Client updated successfully!');
                  } else {
                    const errorData = await response.json();
                    alert(`Error updating client: ${errorData.error || 'Unknown error'}`);
                  }
                } catch (error: any) {
                  console.error('Error updating client:', error);
                  alert(`Error updating client: ${error.message}`);
                }
              }} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                    <input
                      type="text"
                      value={editFormData.name}
                      onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={editFormData.email}
                      onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={editFormData.phone}
                      onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Goal</label>
                    <input
                      type="text"
                      value={editFormData.goal}
                      onChange={(e) => setEditFormData({...editFormData, goal: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      value={editFormData.status}
                      onChange={(e) => setEditFormData({...editFormData, status: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="paused">Paused</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Training Frequency</label>
                    <select
                      value={editFormData.trainingFrequency}
                      onChange={(e) => setEditFormData({...editFormData, trainingFrequency: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                    >
                      <option value={1}>1x per week</option>
                      <option value={2}>2x per week</option>
                      <option value={3}>3x per week</option>
                      <option value={4}>4x per week</option>
                      <option value={5}>5x per week</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Plan</label>
                  <input
                    type="text"
                    value={editFormData.plan}
                    onChange={(e) => setEditFormData({...editFormData, plan: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEditClientModal(false)}
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
            </div>
          </div>
        )}

        {/* Payment Modal */}
        {showPaymentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50">
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 w-full max-w-2xl max-h-[90vh] sm:max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800">Record Payment</h2>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
              
              <form onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                const paymentData = {
                  customerId: clientId,
                  amount: parseFloat(formData.get('amount') as string),
                  paymentMethod: formData.get('paymentMethod') as string,
                  paymentType: formData.get('paymentType') as string,
                  notes: formData.get('notes') as string,
                  paymentDate: formData.get('paymentDate') as string
                };

                try {
                  const response = await fetch('/api/payments', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(paymentData)
                  });

                  if (response.ok) {
                    const newPayment = await response.json();
                    setPayments([newPayment, ...payments]);
                    setShowPaymentModal(false);
                    alert('Payment recorded successfully!');
                  } else {
                    const errorData = await response.json();
                    alert(`Error: ${errorData.error || 'Failed to record payment'}`);
                  }
                } catch (error) {
                  console.error('Error recording payment:', error);
                  alert('Failed to record payment. Please try again.');
                }
              }} className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Amount (RON)</label>
                    <input
                      type="number"
                      name="amount"
                      step="0.01"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Payment Date</label>
                    <input
                      type="date"
                      name="paymentDate"
                      required
                      defaultValue={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                    <select
                      name="paymentMethod"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                    >
                      <option value="">Select method</option>
                      <option value="cash">Cash</option>
                      <option value="card">Card</option>
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="online">Online</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Payment Type</label>
                    <select
                      name="paymentType"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                    >
                      <option value="">Select type</option>
                      <option value="full">Full Payment (1x)</option>
                      <option value="installment">Installment (2x)</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
                  <textarea
                    name="notes"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                    placeholder="Additional notes about this payment..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowPaymentModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    Record Payment
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Payment Modal */}
        {showDeletePaymentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50">
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800">Delete Payment</h2>
                <button
                  onClick={() => setShowDeletePaymentModal(false)}
                  className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
              
              <div className="mb-6">
                <p className="text-gray-600 mb-4">
                  Are you sure you want to delete this payment?
                </p>
                {paymentToDelete && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600">
                      <strong>Amount:</strong> {paymentToDelete.amount} RON<br/>
                      <strong>Date:</strong> {new Date(paymentToDelete.paymentDate).toLocaleDateString()}<br/>
                      <strong>Method:</strong> {paymentToDelete.paymentMethod}<br/>
                      <strong>Type:</strong> {paymentToDelete.paymentType}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeletePaymentModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeletePayment}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Delete Payment
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
