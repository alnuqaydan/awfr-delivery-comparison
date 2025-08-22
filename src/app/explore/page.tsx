'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Container,
  Grid,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Paper,
  Divider,
} from '@mui/material';
import { FilterList, Restaurant as RestaurantIcon } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { 
  fetchRestaurantsByLocation,
  filterRestaurantsByCuisine,
  filterRestaurantsByOpenStatus,
  sortRestaurantsBy
} from '@/store/restaurantSlice';
import { setSelectedLocation } from '@/store/locationSlice';
import LocationDetector from '@/components/LocationDetector';
import RestaurantCard from '@/components/RestaurantCard';
import { LocationData, Restaurant } from '@/types';

// استخدام Suspense wrapper لـ useSearchParams
function ExploreContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  
  const { restaurants, loading, error } = useAppSelector((state) => state.restaurant);
  const { selectedLocation } = useAppSelector((state) => state.location);
  const { language } = useAppSelector((state) => state.settings);

  const [selectedCuisine, setSelectedCuisine] = useState<string>('all');
  const [showOpenOnly, setShowOpenOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('rating');

  // استخراج المعاملات من URL
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  const address = searchParams.get('address');
  const radius = searchParams.get('radius');
  const cuisine = searchParams.get('cuisine');
  const isOpenParam = searchParams.get('is_open');

  // تحديث الحالة من URL parameters عند تحميل الصفحة
  useEffect(() => {
    if (lat && lng && address) {
      const locationFromUrl: LocationData = {
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        address: decodeURIComponent(address),
        city: 'Selected Area',
        radius: radius ? parseInt(radius) : 5,
        isDetected: false,
        timestamp: new Date(),
      };
      
      dispatch(setSelectedLocation(locationFromUrl));
    }

    if (cuisine && cuisine !== 'all') {
      setSelectedCuisine(cuisine);
    }

    if (isOpenParam === 'true') {
      setShowOpenOnly(true);
    }
  }, [lat, lng, address, radius, cuisine, isOpenParam, dispatch]);

  // جلب المطاعم عند تحديد الموقع
  useEffect(() => {
    if (selectedLocation) {
      dispatch(fetchRestaurantsByLocation({
        lat: selectedLocation.lat,
        lng: selectedLocation.lng,
        radius: selectedLocation.radius || 5,
      }));
    }
  }, [selectedLocation, dispatch]);

  // تطبيق الفلاتر
  useEffect(() => {
    if (selectedCuisine !== 'all') {
      dispatch(filterRestaurantsByCuisine(selectedCuisine));
    }
  }, [selectedCuisine, dispatch]);

  useEffect(() => {
    dispatch(filterRestaurantsByOpenStatus(showOpenOnly));
  }, [showOpenOnly, dispatch]);

  useEffect(() => {
    dispatch(sortRestaurantsBy(sortBy));
  }, [sortBy, dispatch]);

  const handleLocationSelected = (location: LocationData) => {
    // تحديث URL مع المعاملات الجديدة
    const params = new URLSearchParams();
    params.set('lat', location.lat.toString());
    params.set('lng', location.lng.toString());
    params.set('address', encodeURIComponent(location.address));
    if (location.radius) {
      params.set('radius', location.radius.toString());
    }
    if (selectedCuisine !== 'all') {
      params.set('cuisine', selectedCuisine);
    }
    if (showOpenOnly) {
      params.set('is_open', 'true');
    }

    router.push(`/explore?${params.toString()}`);
  };

  const handleRestaurantSelect = (restaurant: Restaurant) => {
    // توجيه إلى صفحة المطعم مع المعاملات المطلوبة
    const params = new URLSearchParams();
    params.set('restaurant_id', restaurant.id);
    params.set('lat', selectedLocation?.lat.toString() || '');
    params.set('lng', selectedLocation?.lng.toString() || '');
    
    router.push(`/restaurant/${restaurant.slug}?${params.toString()}`);
  };

  const handleCuisineChange = (cuisine: string) => {
    setSelectedCuisine(cuisine);
    
    // تحديث URL
    const params = new URLSearchParams(window.location.search);
    if (cuisine === 'all') {
      params.delete('cuisine');
    } else {
      params.set('cuisine', cuisine);
    }
    router.push(`/explore?${params.toString()}`);
  };

  const handleOpenOnlyChange = (checked: boolean) => {
    setShowOpenOnly(checked);
    
    // تحديث URL
    const params = new URLSearchParams(window.location.search);
    if (checked) {
      params.set('is_open', 'true');
    } else {
      params.delete('is_open');
    }
    router.push(`/explore?${params.toString()}`);
  };

  const texts = {
    ar: {
      title: 'استكشف المطاعم',
      subtitle: 'اكتشف أفضل المطاعم في منطقتك',
      filters: 'الفلاتر',
      cuisine: 'نوع المطبخ',
      allCuisines: 'جميع المطابخ',
      openOnly: 'المطاعم المفتوحة فقط',
      sortBy: 'ترتيب حسب',
      rating: 'التقييم',
      deliveryTime: 'وقت التوصيل',
      distance: 'المسافة',
      price: 'السعر',
      noRestaurants: 'لا توجد مطاعم في هذه المنطقة',
      selectLocation: 'يرجى اختيار موقعك أولاً',
      restaurantsFound: 'مطعم متاح',
    },
    en: {
      title: 'Explore Restaurants',
      subtitle: 'Discover the best restaurants in your area',
      filters: 'Filters',
      cuisine: 'Cuisine Type',
      allCuisines: 'All Cuisines',
      openOnly: 'Open restaurants only',
      sortBy: 'Sort by',
      rating: 'Rating',
      deliveryTime: 'Delivery Time',
      distance: 'Distance',
      price: 'Price',
      noRestaurants: 'No restaurants found in this area',
      selectLocation: 'Please select your location first',
      restaurantsFound: 'restaurants found',
    },
  };

  const t = texts[language];

  const cuisineTypes = [
    { id: 'all', name: t.allCuisines, nameAr: 'جميع المطابخ' },
    { id: 'arabic', name: 'Arabic', nameAr: 'عربي' },
    { id: 'italian', name: 'Italian', nameAr: 'إيطالي' },
    { id: 'asian', name: 'Asian', nameAr: 'آسيوي' },
    { id: 'american', name: 'American', nameAr: 'أمريكي' },
    { id: 'healthy', name: 'Healthy', nameAr: 'صحي' },
    { id: 'desserts', name: 'Desserts', nameAr: 'حلويات' },
    { id: 'beverages', name: 'Beverages', nameAr: 'مشروبات' },
  ];

  if (!selectedLocation) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box textAlign="center" mb={4}>
          <Typography variant="h4" gutterBottom>
            {t.title}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {t.selectLocation}
          </Typography>
        </Box>
        <LocationDetector onLocationSelected={handleLocationSelected} />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <RestaurantIcon color="primary" />
          {t.title}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          {t.subtitle}
        </Typography>
      </Box>

      {/* Location Summary */}
      <Paper sx={{ p: 2, mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="body2" color="text.secondary">
            {selectedLocation.address}
          </Typography>
          <Typography variant="caption">
            {restaurants.length} {t.restaurantsFound}
          </Typography>
        </Box>
        <Chip 
          label={`${selectedLocation.radius || 5} km`} 
          variant="outlined" 
          size="small" 
        />
      </Paper>

      <Grid container spacing={3}>
        {/* Filters Sidebar */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3, position: 'sticky', top: 20 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FilterList />
              {t.filters}
            </Typography>
            
            <Divider sx={{ my: 2 }} />

            {/* Cuisine Filter */}
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>{t.cuisine}</InputLabel>
              <Select
                value={selectedCuisine}
                onChange={(e) => handleCuisineChange(e.target.value)}
                label={t.cuisine}
              >
                {cuisineTypes.map((cuisine) => (
                  <MenuItem key={cuisine.id} value={cuisine.id}>
                    {language === 'ar' ? cuisine.nameAr : cuisine.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Open Only Switch */}
            <FormControlLabel
              control={
                <Switch
                  checked={showOpenOnly}
                  onChange={(e) => handleOpenOnlyChange(e.target.checked)}
                />
              }
              label={t.openOnly}
              sx={{ mb: 3 }}
            />

            {/* Sort By */}
            <FormControl fullWidth>
              <InputLabel>{t.sortBy}</InputLabel>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                label={t.sortBy}
              >
                <MenuItem value="rating">{t.rating}</MenuItem>
                <MenuItem value="deliveryTime">{t.deliveryTime}</MenuItem>
                <MenuItem value="distance">{t.distance}</MenuItem>
                <MenuItem value="price">{t.price}</MenuItem>
              </Select>
            </FormControl>
          </Paper>
        </Grid>

        {/* Restaurants Grid */}
        <Grid item xs={12} md={9}>
          {loading && (
            <Box display="flex" justifyContent="center" py={8}>
              <CircularProgress size={60} />
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {!loading && !error && restaurants.length === 0 && (
            <Box textAlign="center" py={8}>
              <Typography variant="h6" color="text.secondary">
                {t.noRestaurants}
              </Typography>
            </Box>
          )}

          {!loading && restaurants.length > 0 && (
            <Grid container spacing={3}>
              {restaurants.map((restaurant) => (
                <Grid item xs={12} sm={6} lg={4} key={restaurant.id}>
                  <RestaurantCard
                    restaurant={restaurant}
                    onSelect={handleRestaurantSelect}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </Grid>
      </Grid>
    </Container>
  );
}

// الصفحة الرئيسية مع Suspense wrapper
export default function ExplorePage() {
  return (
    <Suspense fallback={
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress size={60} />
        </Box>
      </Container>
    }>
      <ExploreContent />
    </Suspense>
  );
}
