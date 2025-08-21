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
      });
  },
});

export const { setDistance, setEstimates, clearError } = pricingSlice.actions;
export default pricingSlice.reducer;
