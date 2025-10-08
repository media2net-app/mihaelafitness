'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Save, X, Ruler, Weight, TrendingUp, Calendar, User } from 'lucide-react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';

export default function MeasurementsPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const customerId = Array.isArray(params?.id) ? params.id[0] : (params?.id || '');
  
  const [customer, setCustomer] = useState<{
    id: string;
    name: string;
    email: string;
  } | null>(null);
  
  const [actualCustomerId, setActualCustomerId] = useState(customerId);
  
  const [formData, setFormData] = useState({
    week: 1,
    date: new Date().toISOString().split('T')[0],
    weight: '',
    height: '',
    age: '',
    chest: '',
    waist: '',
    hips: '',
    thigh: '',
    arm: '',
    neck: '',
    bodyFat: '',
    muscleMass: '',
    bmi: '',
    notes: ''
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchCustomerAndMeasurements = async () => {
      try {
        // Check for URL parameters for pre-filling
        const clientId = searchParams.get('clientId');
        const clientName = searchParams.get('clientName');
        const week = searchParams.get('week');
        const date = searchParams.get('date');
        
        // Use clientId from URL if available, otherwise use customerId from params
        const resolvedCustomerId = clientId || customerId;
        
        if (!resolvedCustomerId) {
          console.error('No customer ID found in URL params or search params');
          alert('Error: No customer ID found. Please go back and try again.');
          router.push('/admin/clients');
          return;
        }
        
        setActualCustomerId(resolvedCustomerId);
        
        // Fetch customer data
        const customerResponse = await fetch(`/api/users/${resolvedCustomerId}`);
        if (customerResponse.ok) {
          const customerData = await customerResponse.json();
          setCustomer(customerData);
          console.log('Customer data loaded:', customerData);
          
          // Pre-fill form data if URL parameters are provided
          if (week || date) {
            setFormData(prev => ({
              ...prev,
              week: week ? parseInt(week) : prev.week,
              date: date || prev.date
            }));
          }
        } else {
          console.error('Failed to load customer:', customerResponse.status);
          alert(`Error: Customer not found (ID: ${resolvedCustomerId}). Please check if the customer exists.`);
          router.push('/admin/clients');
          return;
        }

        // Fetch existing measurements to get next week number
        const measurementsResponse = await fetch(`/api/customer-measurements?customerId=${resolvedCustomerId}`);
        if (measurementsResponse.ok) {
          const measurements = await measurementsResponse.json();
          const nextWeek = measurements.length > 0 ? Math.max(...measurements.map((m: any) => m.week)) + 1 : 1;
          setFormData(prev => ({ ...prev, week: nextWeek }));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerAndMeasurements();
  }, [customerId]);

  const handleInputChange = (field: string, value: string) => {
    const newFormData = { ...formData, [field]: value };
    
    // Auto-calculate BMI if weight and height are provided
    if (field === 'weight' || field === 'height') {
      const weight = field === 'weight' ? parseFloat(value) : parseFloat(newFormData.weight);
      const height = field === 'height' ? parseFloat(value) : parseFloat(newFormData.height);
      
      if (weight && height && height > 0) {
        // BMI = weight (kg) / height (m)²
        // Height is in cm, so convert to meters
        const heightInMeters = height / 100;
        const bmi = (weight / (heightInMeters * heightInMeters)).toFixed(1);
        newFormData.bmi = bmi;
      } else {
        newFormData.bmi = '';
      }
    }
    
    setFormData(newFormData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      console.log('[Measurements] Submitting measurement for customer:', actualCustomerId);
      console.log('[Measurements] Form data:', formData);
      
      if (!actualCustomerId) {
        alert('Error: No customer ID found. Please go back and try again.');
        return;
      }

      const response = await fetch('/api/customer-measurements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: actualCustomerId,
          week: parseInt(formData.week.toString()),
          date: formData.date,
          weight: formData.weight ? parseFloat(formData.weight) : null,
          height: formData.height ? parseFloat(formData.height) : null,
          age: formData.age ? parseInt(formData.age) : null,
          chest: formData.chest ? parseFloat(formData.chest) : null,
          waist: formData.waist ? parseFloat(formData.waist) : null,
          hips: formData.hips ? parseFloat(formData.hips) : null,
          thigh: formData.thigh ? parseFloat(formData.thigh) : null,
          arm: formData.arm ? parseFloat(formData.arm) : null,
          neck: formData.neck ? parseFloat(formData.neck) : null,
          bodyFat: formData.bodyFat ? parseFloat(formData.bodyFat) : null,
          muscleMass: formData.muscleMass ? parseFloat(formData.muscleMass) : null,
          bmi: formData.bmi ? parseFloat(formData.bmi) : null,
          notes: formData.notes || null
        }),
      });

      console.log('[Measurements] Response status:', response.status);

      if (response.ok) {
        const newMeasurement = await response.json();
        console.log('[Measurements] Measurement saved successfully:', newMeasurement);
        router.push(`/admin/klanten/${actualCustomerId}`);
      } else {
        const error = await response.json();
        console.error('[Measurements] Error saving measurement:', error);
        alert(`Error: ${error.error || 'Failed to save measurement'}`);
      }
    } catch (error) {
      console.error('[Measurements] Error saving measurement:', error);
      alert('Failed to save measurement');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.push(`/admin/klanten/${customerId}`)}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Add Measurement</h1>
            <p className="text-gray-600">{customer?.name}</p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Basic Information
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Week</label>
                  <input
                    type="number"
                    value={formData.week}
                    onChange={(e) => handleInputChange('week', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    required
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Body Measurements */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Ruler className="w-5 h-5" />
                Body Measurements (cm)
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Chest</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.chest}
                    onChange={(e) => handleInputChange('chest', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    placeholder="cm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Waist</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.waist}
                    onChange={(e) => handleInputChange('waist', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    placeholder="cm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hips</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.hips}
                    onChange={(e) => handleInputChange('hips', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    placeholder="cm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Thigh</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.thigh}
                    onChange={(e) => handleInputChange('thigh', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    placeholder="cm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Arm</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.arm}
                    onChange={(e) => handleInputChange('arm', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    placeholder="cm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Neck</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.neck}
                    onChange={(e) => handleInputChange('neck', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    placeholder="cm"
                  />
                </div>
              </div>
            </div>

            {/* Weight & Composition */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Weight className="w-5 h-5" />
                Weight & Body Composition
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.weight}
                    onChange={(e) => handleInputChange('weight', e.target.value)}
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
                    onChange={(e) => handleInputChange('height', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    placeholder="cm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => handleInputChange('age', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    placeholder="years"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    BMI (Auto-calculated)
                    <span className="text-xs text-gray-500 ml-2 block">
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Body Fat (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.bodyFat}
                    onChange={(e) => handleInputChange('bodyFat', e.target.value)}
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
                    onChange={(e) => handleInputChange('muscleMass', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    placeholder="kg"
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Additional Notes
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  placeholder="Any additional observations or notes..."
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.push(`/admin/klanten/${customerId}`)}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-4 py-3 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Measurement
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
