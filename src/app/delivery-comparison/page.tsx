'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  Alert,
  CircularProgress,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
} from '@mui/material';
import {
  LocationOn,
  AccessTime,
  LocalShipping,
  ArrowBack,
  CheckCircle,
  Star,
  CompareArrows,
} from '@mui/icons-material';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { DistanceSelector } from '@/components/DistanceSelector';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { fetchDeliveryEstimates, selectDeliveryProvider } from '@/store/pricingSlice';
import { Provider, EstimateEntity } from '@/types';

export default function DeliveryComparisonPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { language } = useAppSelector((state) => state.settings);
  const { distance } = useAppSelector((state) => state.settings);
  const { providers, estimates, loading, error } = useAppSelector(
    (state) => state.pricing
  );
  const { items: cartItems, subtotal, totalAmount } = useAppSelector(
    (state) => state.cart
  );
  const { selectedRestaurant } = useAppSelector((state) => state.restaurant);

  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  useEffect(() => {
    if (cartItems.length === 0) {
      router.push('/cart');
      return;
    }

    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          // Use default location (Riyadh)
          setUserLocation({ lat: 24.7136, lng: 46.6753 });
        }
      );
    } else {
      // Use default location (Riyadh)
      setUserLocation({ lat: 24.7136, lng: 46.6753 });
    }
  }, [cartItems.length, router]);

  useEffect(() => {
    if (userLocation && selectedRestaurant) {
      dispatch(fetchDeliveryEstimates({
        distance,
        restaurantLocation: selectedRestaurant.location,
        userLocation,
      }));
    }
  }, [dispatch, distance, userLocation, selectedRestaurant]);

  const handleProviderSelect = (providerId: string) => {
    setSelectedProvider(providerId);
    dispatch(selectDeliveryProvider(providerId));
  };

  const handleBackToCart = () => {
    router.push('/cart');
  };

  const handleProceedToOrder = () => {
    if (selectedProvider) {
      router.push('/checkout');
    }
  };

  const getCheapestProvider = () => {
    if (estimates.length === 0) return null;
    return estimates.reduce((cheapest, current) =>
      current.totalPrice < cheapest.totalPrice ? current : cheapest
    );
  };

  const getFastestProvider = () => {
    if (estimates.length === 0) return null;
    return estimates.reduce((fastest, current) =>
      current.etaMinutes < fastest.etaMinutes ? current : fastest
    );
  };

  const cheapestProvider = getCheapestProvider();
  const fastestProvider = getFastestProvider();

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        direction: language === 'ar' ? 'rtl' : 'ltr',
      }}
    >
      <Header />
      
      <Container maxWidth="lg" sx={{ flex: 1, py: 4 }}>
        {/* Page Header */}
        <Box sx={{ mb: 4 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={handleBackToCart}
            sx={{ mb: 2 }}
          >
            {language === 'ar' ? 'العودة للسلة' : 'Back to Cart'}
          </Button>
          
          <Typography variant="h4" component="h1" gutterBottom>
            {language === 'ar' ? 'مقارنة خدمات التوصيل' : 'Delivery Service Comparison'}
          </Typography>
          
          <Typography variant="body1" color="text.secondary" paragraph>
            {language === 'ar' 
              ? 'اختر أفضل خدمة توصيل تناسبك من حيث السعر والسرعة'
              : 'Choose the best delivery service that suits you in terms of price and speed'
            }
          </Typography>
        </Box>

        {/* Distance Selector */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {language === 'ar' ? 'مسافة التوصيل' : 'Delivery Distance'}
            </Typography>
            <DistanceSelector
              value={distance}
              onChange={(newDistance) => {
                // This would update the distance in settings
                console.log('Distance changed:', newDistance);
              }}
              min={1}
              max={50}
              step={1}
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {language === 'ar' 
                ? `المسافة المحددة: ${distance} كم`
                : `Selected distance: ${distance} km`
              }
            </Typography>
          </CardContent>
        </Card>

        {error && (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        )}

        {/* Restaurant Info */}
        {selectedRestaurant && (
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={3}>
                  <CardMedia
                    component="img"
                    height="100"
                    image={selectedRestaurant.logo}
                    alt={language === 'ar' ? selectedRestaurant.nameAr : selectedRestaurant.name}
                    sx={{ borderRadius: 1 }}
                  />
                </Grid>
                <Grid item xs={12} sm={9}>
                  <Typography variant="h6" gutterBottom>
                    {language === 'ar' ? selectedRestaurant.nameAr : selectedRestaurant.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {language === 'ar' ? selectedRestaurant.address : selectedRestaurant.address}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Chip
                      icon={<LocationOn />}
                      label={selectedRestaurant.city}
                      size="small"
                    />
                    <Chip
                      icon={<AccessTime />}
                      label={`${selectedRestaurant.deliveryTimeMin}-${selectedRestaurant.deliveryTimeMax} ${language === 'ar' ? 'دقيقة' : 'min'}`}
                      size="small"
                    />
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}

        {/* Delivery Providers */}
        <Grid container spacing={3}>
          {estimates.map((estimate) => {
            const provider = providers.find(p => p.id === estimate.providerId);
            if (!provider) return null;

            const isCheapest = cheapestProvider?.providerId === estimate.providerId;
            const isFastest = fastestProvider?.providerId === estimate.providerId;
            const isSelected = selectedProvider === estimate.providerId;

            return (
              <Grid item xs={12} md={6} lg={4} key={estimate.providerId}>
                <Card
                  sx={{
                    height: '100%',
                    cursor: 'pointer',
                    border: isSelected ? 2 : 1,
                    borderColor: isSelected ? 'primary.main' : 'divider',
                    '&:hover': {
                      borderColor: 'primary.main',
                      boxShadow: 2,
                    },
                  }}
                  onClick={() => handleProviderSelect(estimate.providerId)}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <CardMedia
                        component="img"
                        height="60"
                        image={provider.logo}
                        alt={language === 'ar' ? provider.nameAr : provider.name}
                        sx={{ borderRadius: 1, mr: 2 }}
                      />
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" component="h3">
                          {language === 'ar' ? provider.nameAr : provider.name}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Rating value={provider.rating} readOnly size="small" />
                          <Typography variant="body2" color="text.secondary">
                            {provider.rating}
                          </Typography>
                        </Box>
                      </Box>
                      {isSelected && (
                        <CheckCircle color="primary" />
                      )}
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">
                          {language === 'ar' ? 'سعر التوصيل' : 'Delivery Fee'}
                        </Typography>
                        <Typography variant="h6" color="primary">
                          {estimate.totalPrice} {language === 'ar' ? 'ريال' : 'SAR'}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">
                          {language === 'ar' ? 'وقت التوصيل' : 'Delivery Time'}
                        </Typography>
                        <Typography variant="body2">
                          {estimate.etaMinutes} {language === 'ar' ? 'دقيقة' : 'min'}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">
                          {language === 'ar' ? 'المسافة' : 'Distance'}
                        </Typography>
                        <Typography variant="body2">
                          {estimate.distanceKm} {language === 'ar' ? 'كم' : 'km'}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                      {isCheapest && (
                        <Chip
                          label={language === 'ar' ? 'الأرخص' : 'Cheapest'}
                          color="success"
                          size="small"
                        />
                      )}
                      {isFastest && (
                        <Chip
                          label={language === 'ar' ? 'الأسرع' : 'Fastest'}
                          color="info"
                          size="small"
                        />
                      )}
                    </Box>

                    <Button
                      variant={isSelected ? "contained" : "outlined"}
                      fullWidth
                      startIcon={<LocalShipping />}
                    >
                      {isSelected 
                        ? (language === 'ar' ? 'مختار' : 'Selected')
                        : (language === 'ar' ? 'اختيار' : 'Select')
                      }
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {/* Order Summary */}
        {selectedProvider && (
          <Card sx={{ mt: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {language === 'ar' ? 'ملخص الطلب' : 'Order Summary'}
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body1">
                        {language === 'ar' ? 'مجموع الطلب' : 'Order Total'}
                      </Typography>
                      <Typography variant="body1">
                        {subtotal} {language === 'ar' ? 'ريال' : 'SAR'}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body1">
                        {language === 'ar' ? 'رسوم التوصيل' : 'Delivery Fee'}
                      </Typography>
                      <Typography variant="body1">
                        {estimates.find(e => e.providerId === selectedProvider)?.totalPrice || 0} {language === 'ar' ? 'ريال' : 'SAR'}
                      </Typography>
                    </Box>
                    
                    <Divider />
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="h6">
                        {language === 'ar' ? 'المجموع الإجمالي' : 'Total Amount'}
                      </Typography>
                      <Typography variant="h6" color="primary">
                        {(subtotal + (estimates.find(e => e.providerId === selectedProvider)?.totalPrice || 0)).toFixed(2)} {language === 'ar' ? 'ريال' : 'SAR'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    onClick={handleProceedToOrder}
                    sx={{ height: '100%' }}
                  >
                    {language === 'ar' ? 'إتمام الطلب' : 'Complete Order'}
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}
      </Container>

      <Footer />
    </Box>
  );
}
