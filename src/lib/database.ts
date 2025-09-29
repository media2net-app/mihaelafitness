// Real database service with API calls
// This now connects to the actual database through API routes

// User operations
export const userService = {
  async getAllUsers() {
    try {
      const response = await fetch('/api/users');
      console.log('Fetching from URL: /api/users');
      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      console.log('userService.getAllUsers() returned:', data);
      return data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error; // Re-throw error instead of returning mock data
    }
  },

  async getUserById(id: string) {
    try {
      const response = await fetch(`/api/users/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  },

  async createUser(data: Record<string, unknown>) {
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to create user');
      }
      return await response.json();
    } catch (error) {
      console.error('Error creating user:', error);
      throw error; // Re-throw error instead of returning fake data
    }
  },

  async updateUser(id: string, data: Record<string, unknown>) {
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to update user');
      }
      return await response.json();
    } catch (error) {
      console.error('Error updating user:', error);
      throw error; // Re-throw error instead of returning fake data
    }
  },

  async deleteUser(id: string) {
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete user');
      }
      return await response.json();
    } catch (error) {
      console.error('Error deleting user:', error);
      return { id };
    }
  }
}

// Workout operations
export const workoutService = {
  async getAllWorkouts() {
    try {
      const response = await fetch('/api/workouts');
      if (!response.ok) {
        throw new Error('Failed to fetch workouts');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching workouts:', error);
      throw error; // Re-throw error instead of returning mock data
    }
  },

  async getWorkoutById(id: string) {
    try {
      const response = await fetch(`/api/workouts/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch workout');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching workout:', error);
      return null;
    }
  },

  async createWorkout(data: Record<string, unknown>) {
    try {
      const response = await fetch('/api/workouts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to create workout');
      }
      return await response.json();
    } catch (error) {
      console.error('Error creating workout:', error);
      throw error; // Re-throw error instead of returning fake data
    }
  },

  async updateWorkout(id: string, data: Record<string, unknown>) {
    try {
      const response = await fetch(`/api/workouts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to update workout');
      }
      return await response.json();
    } catch (error) {
      console.error('Error updating workout:', error);
      throw error; // Re-throw error instead of returning fake data
    }
  },

  async deleteWorkout(id: string) {
    try {
      const response = await fetch(`/api/workouts/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete workout');
      }
      return await response.json();
    } catch (error) {
      console.error('Error deleting workout:', error);
      return { id };
    }
  }
}

// Nutrition Plan operations
export const nutritionService = {
  async getAllNutritionPlans() {
    try {
      const response = await fetch('/api/nutrition-plans');
      if (!response.ok) {
        throw new Error('Failed to fetch nutrition plans');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching nutrition plans:', error);
      throw error; // Re-throw error instead of returning mock data
    }
  },

  async getNutritionPlanById(id: string) {
    try {
      const response = await fetch(`/api/nutrition-plans/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch nutrition plan');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching nutrition plan:', error);
      return null;
    }
  },

  async createNutritionPlan(data: Record<string, unknown>) {
    try {
      const response = await fetch('/api/nutrition-plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to create nutrition plan');
      }
      return await response.json();
    } catch (error) {
      console.error('Error creating nutrition plan:', error);
      throw error; // Re-throw error instead of returning fake data
    }
  },

  async updateNutritionPlan(id: string, data: Record<string, unknown>) {
    try {
      const response = await fetch(`/api/nutrition-plans/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to update nutrition plan');
      }
      return await response.json();
    } catch (error) {
      console.error('Error updating nutrition plan:', error);
      throw error; // Re-throw error instead of returning fake data
    }
  },

  async deleteNutritionPlan(id: string) {
    try {
      const response = await fetch(`/api/nutrition-plans/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete nutrition plan');
      }
      return await response.json();
    } catch (error) {
      console.error('Error deleting nutrition plan:', error);
      return { id };
    }
  }
}

// Service operations
export const serviceService = {
  async getAllServices() {
    try {
      const response = await fetch('/api/services');
      if (!response.ok) {
        throw new Error('Failed to fetch services');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching services:', error);
      throw error; // Re-throw error instead of returning mock data
    }
  },

  async getServiceById(id: string) {
    try {
      const response = await fetch(`/api/services/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch service');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching service:', error);
      return null;
    }
  },

  async createService(data: Record<string, unknown>) {
    try {
      const response = await fetch('/api/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to create service');
      }
      return await response.json();
    } catch (error) {
      console.error('Error creating service:', error);
      throw error; // Re-throw error instead of returning fake data
    }
  },

  async updateService(id: string, data: Record<string, unknown>) {
    try {
      const response = await fetch(`/api/services/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to update service');
      }
      return await response.json();
    } catch (error) {
      console.error('Error updating service:', error);
      throw error; // Re-throw error instead of returning fake data
    }
  },

  async deleteService(id: string) {
    try {
      const response = await fetch(`/api/services/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete service');
      }
      return await response.json();
    } catch (error) {
      console.error('Error deleting service:', error);
      return { id };
    }
  }
}

// Pricing Calculation operations
export const pricingService = {
  async saveCalculation(data: Record<string, unknown>) {
    try {
      const response = await fetch('/api/pricing-calculations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to save calculation');
      }
      return await response.json();
    } catch (error) {
      console.error('Error saving calculation:', error);
      throw error; // Re-throw error instead of returning fake data
    }
  },

  async getAllCalculations() {
    try {
      const response = await fetch('/api/pricing-calculations');
      if (!response.ok) {
        throw new Error('Failed to fetch calculations');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching calculations:', error);
      return [];
    }
  },

  async getCalculationsByCustomer(customerId: string) {
    try {
      const response = await fetch(`/api/pricing-calculations?customerId=${customerId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch customer calculations');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching customer calculations:', error);
      throw error; // Re-throw error instead of returning mock data
    }
  },

  async getCalculationById(id: string) {
    try {
      const response = await fetch(`/api/pricing-calculations/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch calculation');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching calculation:', error);
      return null;
    }
  }
}

// Customer Assignment Services
export const customerAssignmentService = {
  // Workout Assignments
  async assignWorkoutToCustomer(customerId: string, workoutId: string, notes?: string) {
    try {
      const response = await fetch('/api/customer-workouts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId,
          workoutId,
          status: 'active',
          notes
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to assign workout to customer');
      }

      return await response.json();
    } catch (error) {
      console.error('Error assigning workout to customer:', error);
      throw error;
    }
  },

  async getCustomerWorkouts(customerId?: string) {
    try {
      const url = customerId 
        ? `/api/customer-workouts?customerId=${customerId}`
        : '/api/customer-workouts';
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch customer workouts');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching customer workouts:', error);
      return [];
    }
  },

  async updateCustomerWorkout(assignmentId: string, status: string, notes?: string) {
    try {
      const response = await fetch('/api/customer-workouts', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: assignmentId,
          status,
          notes
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update customer workout');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating customer workout:', error);
      throw error;
    }
  },

  async removeWorkoutFromCustomer(assignmentId: string) {
    try {
      const response = await fetch(`/api/customer-workouts?id=${assignmentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to remove workout from customer');
      }

      return await response.json();
    } catch (error) {
      console.error('Error removing workout from customer:', error);
      throw error;
    }
  },

  // Nutrition Plan Assignments
  async assignNutritionPlanToCustomer(customerId: string, nutritionPlanId: string, notes?: string) {
    try {
      const response = await fetch('/api/customer-nutrition-plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId,
          nutritionPlanId,
          status: 'active',
          notes
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to assign nutrition plan to customer');
      }

      return await response.json();
    } catch (error) {
      console.error('Error assigning nutrition plan to customer:', error);
      throw error;
    }
  },

  async getCustomerNutritionPlans(customerId?: string) {
    try {
      const url = customerId 
        ? `/api/customer-nutrition-plans?customerId=${customerId}`
        : '/api/customer-nutrition-plans';
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch customer nutrition plans');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching customer nutrition plans:', error);
      return [];
    }
  },

  async updateCustomerNutritionPlan(assignmentId: string, status: string, notes?: string) {
    try {
      const response = await fetch('/api/customer-nutrition-plans', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: assignmentId,
          status,
          notes
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update customer nutrition plan');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating customer nutrition plan:', error);
      throw error;
    }
  },

  async removeNutritionPlanFromCustomer(assignmentId: string) {
    try {
      const response = await fetch(`/api/customer-nutrition-plans?id=${assignmentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to remove nutrition plan from customer');
      }

      return await response.json();
    } catch (error) {
      console.error('Error removing nutrition plan from customer:', error);
      throw error;
    }
  }
};

// Training Session Services
export const trainingSessionService = {
  async createTrainingSession(sessionData: {
    customerId: string;
    date: string;
    startTime: string;
    endTime: string;
    type?: string;
    status?: string;
    notes?: string;
  }) {
    try {
      const response = await fetch('/api/training-sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sessionData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create training session');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating training session:', error);
      throw error;
    }
  },

  async getTrainingSessions(customerId?: string, date?: string, startDate?: string, endDate?: string) {
    try {
      const params = new URLSearchParams();
      if (customerId) params.append('customerId', customerId);
      if (date) params.append('date', date);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await fetch(`/api/training-sessions?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch training sessions');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching training sessions:', error);
      return [];
    }
  },

  async updateTrainingSession(sessionId: string, sessionData: {
    customerId?: string;
    date?: string;
    startTime?: string;
    endTime?: string;
    type?: string;
    status?: string;
    notes?: string;
  }) {
    try {
      const response = await fetch('/api/training-sessions', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: sessionId,
          ...sessionData
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update training session');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating training session:', error);
      throw error;
    }
  },

  async deleteTrainingSession(sessionId: string) {
    try {
      const response = await fetch(`/api/training-sessions?id=${sessionId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete training session');
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting training session:', error);
      throw error;
    }
  }
};

// Nutrition Calculation Services
export const nutritionCalculationService = {
  async saveNutritionCalculation(calculationData: {
    customerId: string;
    customerName: string;
    gender: string;
    age: number;
    height: number;
    weight: number;
    activityLevel: string;
    bmr: number;
    maintenanceCalories: number;
    protein: number;
    carbs: number;
    fat: number;
  }) {
    try {
      const response = await fetch('/api/nutrition-calculations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(calculationData),
      });

      if (!response.ok) {
        throw new Error('Failed to save nutrition calculation');
      }

      return await response.json();
    } catch (error) {
      console.error('Error saving nutrition calculation:', error);
      throw error;
    }
  },

  async getNutritionCalculations(customerId?: string) {
    try {
      const url = customerId 
        ? `/api/nutrition-calculations?customerId=${customerId}`
        : '/api/nutrition-calculations';
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch nutrition calculations');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching nutrition calculations:', error);
      return [];
    }
  },

  async deleteNutritionCalculation(calculationId: string) {
    try {
      const response = await fetch(`/api/nutrition-calculations?id=${calculationId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete nutrition calculation');
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting nutrition calculation:', error);
      throw error;
    }
  }
};

// Statistics
export const statsService = {
  async getDashboardStats(retryCount = 0) {
    try {
      console.log(`Fetching stats (attempt ${retryCount + 1})...`);
      const response = await fetch('/api/stats');
      if (!response.ok) {
        throw new Error(`Failed to fetch stats: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      console.log('Stats fetched successfully:', data);
      return data;
    } catch (error) {
      console.error('Error fetching stats:', error);
      
      // Retry up to 3 times with exponential backoff
      if (retryCount < 3) {
        const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.getDashboardStats(retryCount + 1);
      }
      
      // After 3 retries, return fallback data
      console.warn('All retry attempts failed, returning fallback stats');
      return {
        totalUsers: 0,
        activeUsers: 0,
        totalWorkouts: 0,
        totalNutritionPlans: 0,
        totalServices: 0
      };
    }
  }
}