import { configureStore } from '@reduxjs/toolkit';
import pricingReducer from './pricingSlice';
import settingsReducer from './settingsSlice';
import restaurantReducer from './restaurantSlice';
import cartReducer from './cartSlice';
import orderReducer from './orderSlice';
import locationReducer from './locationSlice';

export const store = configureStore({
  reducer: {
    pricing: pricingReducer,
    settings: settingsReducer,
    restaurant: restaurantReducer,
    cart: cartReducer,
    order: orderReducer,
    location: locationReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'pricing/setEstimates',
          'restaurant/fetchRestaurantDetails/fulfilled',
          'restaurant/fetchMenuItemsByCategory/fulfilled',
        ],
        ignoredPaths: [
          'pricing.estimates',
          'restaurant.selectedRestaurant',
          'restaurant.menuItems',
        ],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
