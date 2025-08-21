import { configureStore } from '@reduxjs/toolkit';
import pricingReducer from './pricingSlice';
import settingsReducer from './settingsSlice';

export const store = configureStore({
  reducer: {
    pricing: pricingReducer,
    settings: settingsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['pricing/setEstimates'],
        ignoredPaths: ['pricing.estimates'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
