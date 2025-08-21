import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { PricingState, EstimateEntity } from '@/types';
import { calculateEstimates, PROVIDERS } from '@/utils/pricing';

const initialState: PricingState = {
  providers: PROVIDERS,
  estimates: [],
  selectedDistance: 5,
  loading: false,
  error: null,
};

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
      });
  },
});

export const { setDistance, setEstimates, clearError, selectDeliveryProvider } = pricingSlice.actions;
export default pricingSlice.reducer;
