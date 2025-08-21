import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SettingsState } from '@/types';

const initialState: SettingsState = {
  language: 'en',
  theme: 'system',
  distance: 5,
  notifications: true,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setLanguage: (state, action: PayloadAction<'ar' | 'en'>) => {
      state.language = action.payload;
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark' | 'system'>) => {
      state.theme = action.payload;
    },
    setDistance: (state, action: PayloadAction<number>) => {
      state.distance = action.payload;
    },
    setNotifications: (state, action: PayloadAction<boolean>) => {
      state.notifications = action.payload;
    },
    resetSettings: (state) => {
      return initialState;
    },
  },
});

export const { 
  setLanguage, 
  setTheme, 
  setDistance, 
  setNotifications, 
  resetSettings 
} = settingsSlice.actions;

export default settingsSlice.reducer;
