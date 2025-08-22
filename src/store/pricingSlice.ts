import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { PricingState, EstimateEntity, DeliveryOption, LocationData } from '@/types';
import { calculateEstimates, PROVIDERS } from '@/utils/pricing';
import { deliveryService, PricingRequest } from '@/services/deliveryService';

const initialState: PricingState = {
  providers: PROVIDERS,
  estimates: [],
  deliveryOptions: [],
  selectedDistance: 5,
  loading: false,
  error: null,
  lastUpdate: null,
};

// New async thunk for real-time delivery options
export const fetchRealTimeDeliveryOptions = createAsyncThunk(
  'pricing/fetchRealTimeDeliveryOptions',
  async (request: PricingRequest, { rejectWithValue }) => {
    try {
      const options = await deliveryService.fetchDeliveryOptions(request);
      return options;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch delivery options');
    }
  }
);

// Update pricing with real-time factors
export const updateRealTimePricing = createAsyncThunk(
  'pricing/updateRealTimePricing',
  async (options: DeliveryOption[], { rejectWithValue }) => {
    try {
      const updatedOptions = await deliveryService.updateRealTimePricing(options);
      return updatedOptions;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update pricing');
    }
  }
);

export const calculateDeliveryEstimates = createAsyncThunk(
  'pricing/calculateEstimates',
  async (distance: number) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return calculateEstimates(distance);
  }
);

export const fetchDeliveryEstimates = createAsyncThunk(
  'pricing/fetchDeliveryEstimates',
  async ({
    distance,
    restaurantLocation,
    userLocation,
  }: {
    distance: number;
    restaurantLocation: { lat: number; lng: number };
    userLocation: { lat: number; lng: number };
  }) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Calculate actual distance between points
    const actualDistance = Math.sqrt(
      Math.pow(restaurantLocation.lat - userLocation.lat, 2) +
      Math.pow(restaurantLocation.lng - userLocation.lng, 2)
    ) * 111; // Rough conversion to km
    
    return calculateEstimates(Math.max(distance, actualDistance));
  }
);

const pricingSlice = createSlice({
  name: 'pricing',
  initialState,
  reducers: {
    setDistance: (state, action: PayloadAction<number>) => {
      state.selectedDistance = action.payload;
    },
    setEstimates: (state, action: PayloadAction<EstimateEntity[]>) => {
      state.estimates = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    selectDeliveryProvider: (state, action: PayloadAction<string>) => {
      // Mark the selected provider in estimates
      state.estimates = state.estimates.map(estimate => ({
        ...estimate,
        isSelected: estimate.providerId === action.payload,
      }));
    },
    setDeliveryOptions: (state, action: PayloadAction<DeliveryOption[]>) => {
      state.deliveryOptions = action.payload;
      state.lastUpdate = new Date();
    },
    clearDeliveryOptions: (state) => {
      state.deliveryOptions = [];
      state.lastUpdate = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(calculateDeliveryEstimates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(calculateDeliveryEstimates.fulfilled, (state, action) => {
        state.loading = false;
        state.estimates = action.payload;
      })
      .addCase(calculateDeliveryEstimates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to calculate estimates';
      })
      .addCase(fetchDeliveryEstimates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDeliveryEstimates.fulfilled, (state, action) => {
        state.loading = false;
        state.estimates = action.payload;
      })
      .addCase(fetchDeliveryEstimates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch delivery estimates';
      })
      // Real-time delivery options
      .addCase(fetchRealTimeDeliveryOptions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRealTimeDeliveryOptions.fulfilled, (state, action) => {
        state.loading = false;
        state.deliveryOptions = action.payload;
        state.lastUpdate = new Date();
      })
      .addCase(fetchRealTimeDeliveryOptions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update real-time pricing
      .addCase(updateRealTimePricing.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateRealTimePricing.fulfilled, (state, action) => {
        state.loading = false;
        state.deliveryOptions = action.payload;
        state.lastUpdate = new Date();
      })
      .addCase(updateRealTimePricing.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { 
  setDistance, 
  setEstimates, 
  clearError, 
  selectDeliveryProvider,
  setDeliveryOptions,
  clearDeliveryOptions
} = pricingSlice.actions;
export default pricingSlice.reducer;
