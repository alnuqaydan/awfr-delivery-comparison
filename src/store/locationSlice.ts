import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { LocationData, LocationState } from '@/types';

// Async action لاكتشاف الموقع التلقائي
export const detectUserLocation = createAsyncThunk(
  'location/detectUserLocation',
  async (_, { rejectWithValue }) => {
    return new Promise<LocationData>((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          try {
            // استخدام API للحصول على العنوان من الإحداثيات
            const response = await fetch(
              `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}&language=ar`
            );
            
            if (!response.ok) {
              throw new Error('Failed to get address details');
            }
            
            const data = await response.json();
            const feature = data.features[0];
            
            const locationData: LocationData = {
              lat: latitude,
              lng: longitude,
              address: feature?.place_name || `${latitude}, ${longitude}`,
              city: feature?.context?.find((c: any) => c.id.startsWith('place'))?.text || 'Unknown',
              isDetected: true,
              timestamp: new Date(),
            };
            
            resolve(locationData);
          } catch (error) {
            // في حالة فشل الحصول على العنوان، استخدم الإحداثيات فقط
            const fallbackLocation: LocationData = {
              lat: latitude,
              lng: longitude,
              address: `Lat: ${latitude}, Lng: ${longitude}`,
              city: 'Unknown',
              isDetected: true,
              timestamp: new Date(),
            };
            resolve(fallbackLocation);
          }
        },
        (error) => {
          let errorMessage = 'Failed to get location';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied by user';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timeout';
              break;
          }
          
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes cache
        }
      );
    });
  }
);

// Async action للبحث عن المواقع
export const searchLocations = createAsyncThunk(
  'location/searchLocations',
  async (query: string, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}&country=SA&language=ar&limit=5`
      );
      
      if (!response.ok) {
        throw new Error('Failed to search locations');
      }
      
      const data = await response.json();
      
      const locations: LocationData[] = data.features.map((feature: any) => ({
        lat: feature.center[1],
        lng: feature.center[0],
        address: feature.place_name,
        city: feature.context?.find((c: any) => c.id.startsWith('place'))?.text || 'Unknown',
        isDetected: false,
        timestamp: new Date(),
      }));
      
      return locations;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

const initialState: LocationState = {
  userLocation: null,
  detectionInProgress: false,
  searchResults: [],
  selectedLocation: null,
  error: null,
};

const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    setSelectedLocation: (state, action: PayloadAction<LocationData>) => {
      state.selectedLocation = action.payload;
      state.error = null;
    },
    setManualLocation: (state, action: PayloadAction<{ lat: number; lng: number; address: string; city: string }>) => {
      const { lat, lng, address, city } = action.payload;
      const manualLocation: LocationData = {
        lat,
        lng,
        address,
        city,
        isDetected: false,
        timestamp: new Date(),
      };
      state.userLocation = manualLocation;
      state.selectedLocation = manualLocation;
      state.error = null;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
    clearLocationError: (state) => {
      state.error = null;
    },
    setLocationRadius: (state, action: PayloadAction<number>) => {
      if (state.userLocation) {
        state.userLocation.radius = action.payload;
      }
      if (state.selectedLocation) {
        state.selectedLocation.radius = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Detect user location
      .addCase(detectUserLocation.pending, (state) => {
        state.detectionInProgress = true;
        state.error = null;
      })
      .addCase(detectUserLocation.fulfilled, (state, action) => {
        state.detectionInProgress = false;
        state.userLocation = action.payload;
        state.selectedLocation = action.payload;
        state.error = null;
      })
      .addCase(detectUserLocation.rejected, (state, action) => {
        state.detectionInProgress = false;
        state.error = action.error.message || 'Failed to detect location';
      })
      // Search locations
      .addCase(searchLocations.pending, (state) => {
        state.error = null;
      })
      .addCase(searchLocations.fulfilled, (state, action) => {
        state.searchResults = action.payload;
        state.error = null;
      })
      .addCase(searchLocations.rejected, (state, action) => {
        state.searchResults = [];
        state.error = action.payload as string;
      });
  },
});

export const {
  setSelectedLocation,
  setManualLocation,
  clearSearchResults,
  clearLocationError,
  setLocationRadius,
} = locationSlice.actions;

export default locationSlice.reducer;
