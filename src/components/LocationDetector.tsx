'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Chip,
  IconButton,
  InputAdornment,
} from '@mui/material';
import {
  LocationOn,
  Search,
  MyLocation,
  Clear,
  Place,
  GpsFixed,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { 
  detectUserLocation, 
  searchLocations, 
  setSelectedLocation, 
  setManualLocation,
  clearSearchResults,
  clearLocationError,
  setLocationRadius
} from '@/store/locationSlice';
import { LocationData } from '@/types';

interface LocationDetectorProps {
  onLocationSelected?: (location: LocationData) => void;
  showRadiusSelector?: boolean;
  defaultRadius?: number;
}

const LocationDetector: React.FC<LocationDetectorProps> = ({
  onLocationSelected,
  showRadiusSelector = true,
  defaultRadius = 5,
}) => {
  const dispatch = useAppDispatch();
  const { 
    userLocation, 
    detectionInProgress, 
    searchResults, 
    selectedLocation, 
    error 
  } = useAppSelector((state) => state.location);
  const { language } = useAppSelector((state) => state.settings);

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [radius, setRadius] = useState(defaultRadius);

  useEffect(() => {
    if (selectedLocation && onLocationSelected) {
      onLocationSelected(selectedLocation);
    }
  }, [selectedLocation, onLocationSelected]);

  const handleDetectLocation = async () => {
    try {
      await dispatch(detectUserLocation()).unwrap();
    } catch (error) {
      console.error('Failed to detect location:', error);
    }
  };

  const handleSearch = async (query: string) => {
    if (query.trim().length < 3) {
      dispatch(clearSearchResults());
      return;
    }

    setIsSearching(true);
    try {
      await dispatch(searchLocations(query)).unwrap();
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleLocationSelect = (location: LocationData) => {
    const locationWithRadius = { ...location, radius };
    dispatch(setSelectedLocation(locationWithRadius));
    dispatch(clearSearchResults());
    setSearchQuery('');
  };

  const handleManualLocation = () => {
    if (searchQuery.trim()) {
      const [lat, lng] = searchQuery.split(',').map(coord => parseFloat(coord.trim()));
      if (!isNaN(lat) && !isNaN(lng)) {
        dispatch(setManualLocation({
          lat,
          lng,
          address: searchQuery,
          city: 'Manual Location'
        }));
        setSearchQuery('');
      }
    }
  };

  const handleRadiusChange = (newRadius: number) => {
    setRadius(newRadius);
    dispatch(setLocationRadius(newRadius));
  };

  const clearError = () => {
    dispatch(clearLocationError());
  };

  const texts = {
    ar: {
      title: 'اختر موقعك',
      detectButton: 'اكتشاف موقعي',
      searchPlaceholder: 'ابحث عن عنوان أو منطقة...',
      currentLocation: 'موقعك الحالي',
      searchResults: 'نتائج البحث',
      radius: 'نطاق التوصيل (كم)',
      detecting: 'جاري اكتشاف الموقع...',
      searching: 'جاري البحث...',
      noResults: 'لا توجد نتائج',
      useCoords: 'استخدم الإحداثيات',
      selectedLocation: 'الموقع المحدد',
    },
    en: {
      title: 'Choose Your Location',
      detectButton: 'Detect My Location',
      searchPlaceholder: 'Search for address or area...',
      currentLocation: 'Your Current Location',
      searchResults: 'Search Results',
      radius: 'Delivery Radius (km)',
      detecting: 'Detecting location...',
      searching: 'Searching...',
      noResults: 'No results found',
      useCoords: 'Use Coordinates',
      selectedLocation: 'Selected Location',
    },
  };

  const t = texts[language];

  return (
    <Paper
      elevation={2}
      sx={{
        p: 3,
        maxWidth: 500,
        mx: 'auto',
        borderRadius: 2,
      }}
    >
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <LocationOn color="primary" />
        {t.title}
      </Typography>

      {error && (
        <Alert 
          severity="error" 
          onClose={clearError}
          sx={{ mb: 2 }}
        >
          {error}
        </Alert>
      )}

      {/* Auto-detect location button */}
      <Button
        variant="contained"
        startIcon={detectionInProgress ? <CircularProgress size={20} /> : <MyLocation />}
        onClick={handleDetectLocation}
        disabled={detectionInProgress}
        fullWidth
        sx={{ mb: 2 }}
      >
        {detectionInProgress ? t.detecting : t.detectButton}
      </Button>

      {/* Search input */}
      <TextField
        fullWidth
        placeholder={t.searchPlaceholder}
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value);
          handleSearch(e.target.value);
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              {isSearching ? <CircularProgress size={20} /> : <Search />}
            </InputAdornment>
          ),
          endAdornment: searchQuery && (
            <InputAdornment position="end">
              <IconButton
                onClick={() => {
                  setSearchQuery('');
                  dispatch(clearSearchResults());
                }}
                edge="end"
              >
                <Clear />
              </IconButton>
            </InputAdornment>
          ),
        }}
        sx={{ mb: 2 }}
      />

      {/* Current/Selected location display */}
      {selectedLocation && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="primary" gutterBottom>
            {t.selectedLocation}
          </Typography>
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              backgroundColor: 'action.hover',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <GpsFixed color="primary" />
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" fontWeight={600}>
                {selectedLocation.address}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {selectedLocation.city} • {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}
              </Typography>
            </Box>
            {selectedLocation.isDetected && (
              <Chip label="GPS" size="small" color="success" />
            )}
          </Paper>
        </Box>
      )}

      {/* Search results */}
      {searchResults.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            {t.searchResults}
          </Typography>
          <List dense>
            {searchResults.map((location, index) => (
              <ListItem key={index} disablePadding>
                <ListItemButton onClick={() => handleLocationSelect(location)}>
                  <ListItemIcon>
                    <Place />
                  </ListItemIcon>
                  <ListItemText
                    primary={location.address}
                    secondary={`${location.city} • ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      {/* Radius selector */}
      {showRadiusSelector && selectedLocation && (
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            {t.radius}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {[2, 5, 10, 15, 20].map((radiusOption) => (
              <Chip
                key={radiusOption}
                label={`${radiusOption} km`}
                variant={radius === radiusOption ? 'filled' : 'outlined'}
                color={radius === radiusOption ? 'primary' : 'default'}
                onClick={() => handleRadiusChange(radiusOption)}
                clickable
              />
            ))}
          </Box>
        </Box>
      )}

      {/* Manual coordinates input helper */}
      {searchQuery.includes(',') && searchQuery.split(',').length === 2 && (
        <Button
          variant="outlined"
          size="small"
          startIcon={<Place />}
          onClick={handleManualLocation}
          sx={{ mt: 1 }}
        >
          {t.useCoords}
        </Button>
      )}
    </Paper>
  );
};

export default LocationDetector;
